import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FileUpload from "@/components/file-upload";
import GenerationOptions from "@/components/generation-options";
import ResultsDisplay from "@/components/results-display";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { FileText, Clock, Download, MoreHorizontal, Trash2, BookOpen, HelpCircle, Upload } from "lucide-react";

interface Generation {
  id: number;
  type: string;
  title: string;
  difficulty: string;
  questionCount?: number;
  createdAt: string;
}

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  hasText: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'flashcards' | 'quiz' | null>(null);
  const [quizConfig, setQuizConfig] = useState({ questions: 10, difficulty: 'auto' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch recent generations
  const { data: recentGenerations = [] } = useQuery<Generation[]>({
    queryKey: ["/api/generations"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0 || !selectedFormat) {
      toast({
        title: "Missing Requirements",
        description: "Please upload a file and select a generation type.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileId: uploadedFiles[0].id,
          type: selectedFormat,
          difficulty: quizConfig.difficulty,
          questionCount: selectedFormat === 'quiz' ? quizConfig.questions : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      setGeneratedContent(result);
      
      toast({
        title: "Success!",
        description: `Generated ${selectedFormat} successfully.`,
      });
    } catch (error) {
      if (error instanceof Error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-xl text-foreground">FlashGen</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">My Library</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Settings</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Generate Study Materials in Seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your documents and let AI create personalized flashcards and quizzes 
            tailored to your learning needs.
          </p>
        </section>

        {/* File Upload Section */}
        <section className="mb-12">
          <FileUpload onFilesUpload={handleFileUpload} />
        </section>

        {/* Generation Options */}
        <section className="mb-12">
          <GenerationOptions
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            quizConfig={quizConfig}
            onQuizConfigChange={setQuizConfig}
          />
        </section>

        {/* Generate Button */}
        <section className="text-center mb-12">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || uploadedFiles.length === 0 || !selectedFormat}
            size="lg"
            className="px-8 py-4 text-lg font-semibold shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              "Generate Study Materials"
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Processing typically takes 30-60 seconds
          </p>
        </section>

        {/* Loading State */}
        {isGenerating && (
          <section className="mb-12">
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Generating Your Study Materials
                </h3>
                <p className="text-muted-foreground">
                  Our AI is analyzing your content and creating personalized study materials...
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Results Display */}
        {generatedContent && (
          <section className="mb-12">
            <ResultsDisplay content={generatedContent} />
          </section>
        )}

        {/* Recent Generations */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Generations</h2>
          <div className="grid gap-4">
            {recentGenerations.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="pt-6">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No generations yet</h3>
                  <p className="text-muted-foreground">
                    Upload a file and generate your first study materials to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recentGenerations.map((generation) => (
                <Card key={generation.id} className="p-6 hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          {generation.type === 'flashcards' ? (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{generation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {generation.type === 'flashcards' 
                              ? 'Flashcards' 
                              : `${generation.questionCount} questions`
                            } • {formatDate(generation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link href={`/study/${generation.id}`}>
                          <Button variant="outline" size="sm">
                            <Clock className="w-4 h-4 mr-2" />
                            Study
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">F</span>
              </div>
              <span className="font-semibold text-foreground">FlashGen</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
