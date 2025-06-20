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
import brainBitesLogo from "@assets/image_1750458128564.png";

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
  const queryClient = useQueryClient();
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

  // Fetch uploaded files
  const { data: userFiles = [] } = useQuery<UploadedFile[]>({
    queryKey: ["/api/files"],
    enabled: isAuthenticated,
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File deleted",
        description: "File has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { fileId: number; type: 'flashcards' | 'quiz'; difficulty: string; questionCount?: number }) => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedContent(result);
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      toast({
        title: "Success!",
        description: `Generated ${result.type} successfully.`,
      });
    },
    onError: (error) => {
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
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
    queryClient.invalidateQueries({ queryKey: ["/api/files"] });
  };

  const handleGenerateContent = (fileId: number, type: 'flashcards' | 'quiz') => {
    generateMutation.mutate({
      fileId,
      type,
      difficulty: 'auto',
      questionCount: type === 'quiz' ? 10 : undefined,
    });
  };

  const handleDeleteFile = (fileId: number) => {
    deleteFileMutation.mutate(fileId);
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
          <div className="flex justify-between items-center py-4" style={{ minHeight: '200px' }}>
            <div className="brain-logo">
              <img 
                src={brainBitesLogo} 
                alt="Brain Bites" 
                className="h-auto w-auto"
                style={{ height: '180px' }}
              />
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">My Library</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Settings</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
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
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Instantly generate
            <br />
            <span className="text-primary">flashcards and quizzes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Study smarter by turning your notes or textbook pages into interactive flashcards and quizzes in seconds.
          </p>
          <p className="text-lg text-muted-foreground">
            Great for students, teachers, and lifelong learners.
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
          <div className="inline-block p-1 bg-gradient-to-r from-primary to-secondary rounded-xl">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || uploadedFiles.length === 0 || !selectedFormat}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold shadow-lg rounded-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                "Scan PDF or Text"
              )}
            </Button>
          </div>
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

        {/* Uploaded Files */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Your Files</h2>
          <div className="grid gap-4">
            {userFiles.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="pt-6">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No files uploaded yet</h3>
                  <p className="text-muted-foreground">
                    Upload your first document to generate study materials.
                  </p>
                </CardContent>
              </Card>
            ) : (
              userFiles.map((file) => (
                <Card key={file.id} className="p-6 hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {formatDate(file.uploadedAt)}
                            {!file.hasText && <span className="text-orange-500"> • Processing...</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!file.hasText || generateMutation.isPending}
                          onClick={() => handleGenerateContent(file.id, 'flashcards')}
                          className="bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Flashcards
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!file.hasText || generateMutation.isPending}
                          onClick={() => handleGenerateContent(file.id, 'quiz')}
                          className="bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary hover:text-white"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Quiz
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={deleteFileMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Recent Generations */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Study Materials</h2>
          <div className="grid gap-4">
            {recentGenerations.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="pt-6">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No study materials yet</h3>
                  <p className="text-muted-foreground">
                    Generate flashcards or quizzes from your uploaded files to get started.
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
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{generation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {generation.type === 'flashcards' 
                              ? 'Flashcards' 
                              : `${generation.questionCount} questions`
                            } • {generation.difficulty} • {formatDate(generation.createdAt)}
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
            <div className="brain-logo mb-4 md:mb-0">
              <img 
                src={brainBitesLogo} 
                alt="Brain Bites" 
                className="h-auto w-auto"
                style={{ height: '144px' }}
              />
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Features</a>
              <a href="#" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="hover:text-primary transition-colors">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
