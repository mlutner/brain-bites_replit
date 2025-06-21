import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BrainCard, BrainCardContent } from "@/components/ui/brain-card";
import { BrainButton } from "@/components/ui/brain-button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FileUpload from "@/components/file-upload";
import GenerationOptions from "@/components/generation-options";
import ResultsDisplay from "@/components/results-display";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { Navigation } from "@/components/common/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/formatters";
import { Link } from "wouter";
import { FileText, Clock, Download, MoreHorizontal, Trash2, BookOpen, HelpCircle, Upload } from "lucide-react";
import brainBitesLogo from "@assets/image_1750458128564.png";
import flashcardIcon from "@assets/image_1750460125700.png";
import quizIcon from "@assets/image_1750460618691.png";

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

  // Fetch uploaded files with auto-refresh for processing files
  const { data: userFiles = [] } = useQuery<UploadedFile[]>({
    queryKey: ["/api/files"],
    enabled: isAuthenticated,
    refetchInterval: (data) => {
      // Auto-refresh every 3 seconds if any files are still processing
      const hasProcessingFiles = Array.isArray(data) && data.some((file: UploadedFile) => !file.hasText);
      return hasProcessingFiles ? 3000 : false;
    },
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
    <div className="min-h-screen bg-background relative">
      <LoadingOverlay isVisible={generateMutation.isPending} />
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center" style={{ height: '100px' }}>
            <div className="brain-logo">
              <img 
                src={brainBitesLogo} 
                alt="Brain Bites" 
                className="h-auto w-auto"
                style={{ height: '100px' }}
              />
            </div>

            <Navigation user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-foreground mb-8 leading-tight">
              Instantly generate
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                flashcards and quizzes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
              Study smarter by turning your notes or textbook pages into interactive flashcards and quizzes in seconds.
            </p>
            <p className="text-lg text-muted-foreground/80 font-medium">
              Great for students, teachers, and lifelong learners.
            </p>
          </div>
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
        <section className="text-center mb-16">
          <div className="inline-block p-1.5 brain-gradient rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <BrainButton 
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={uploadedFiles.length === 0 || !selectedFormat}
              size="lg"
              className="bg-white hover:bg-gray-50 text-primary px-10 py-6 text-xl font-bold shadow-none rounded-xl border-0 hover:scale-105 transition-all duration-300"
            >
              {isGenerating ? 'Generating...' : 'Scan PDF or Text'}
            </BrainButton>
          </div>
          <p className="brain-text-muted mt-4 font-medium">
            Processing typically takes 30-60 seconds
          </p>
        </section>

        {/* Loading State */}
        {isGenerating && (
          <section className="mb-12">
            <BrainCard className="text-center" padding="lg">
              <BrainCardContent>
                <div className="w-16 h-16 brain-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="brain-heading-3 mb-2">
                  Generating Your Study Materials
                </h3>
                <p className="brain-text-muted">
                  Our AI is analyzing your content and creating personalized study materials...
                </p>
              </BrainCardContent>
            </BrainCard>
          </section>
        )}

        {/* Results Display */}
        {generatedContent && (
          <section className="mb-12">
            <ResultsDisplay content={generatedContent} />
          </section>
        )}

        {/* Uploaded Files */}
        <section className="mt-20">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Your Documents</h2>
              <p className="text-muted-foreground">Uploaded files ready for processing</p>
            </div>
          </div>
          <div className="grid gap-6 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-200/50 shadow-sm">
            {userFiles.length === 0 ? (
              <BrainCard className="text-center brain-gradient-light border-dashed border-2" padding="lg">
                <BrainCardContent>
                  <div className="w-20 h-20 brain-gradient rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="brain-heading-3 mb-3">No files uploaded yet</h3>
                  <p className="brain-text-muted text-lg">
                    Upload your first document to generate study materials and start learning smarter!
                  </p>
                </BrainCardContent>
              </BrainCard>
            ) : (
              userFiles.map((file) => (
                <BrainCard key={file.id} variant="interactive" className="bg-white">
                  <BrainCardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                          <FileText className="w-7 h-7 text-blue-600" />
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
                        {file.hasText ? (
                          <>
                            <BrainButton 
                              variant="outline" 
                              size="sm"
                              isLoading={generateMutation.isPending && isGenerating}
                              onClick={() => handleGenerateContent(file.id, 'flashcards')}
                              className="text-primary hover:bg-primary hover:text-white"
                            >
                              Flashcards
                            </BrainButton>
                            <BrainButton 
                              variant="outline" 
                              size="sm"
                              isLoading={generateMutation.isPending && isGenerating}
                              onClick={() => handleGenerateContent(file.id, 'quiz')}
                              className="text-secondary hover:bg-secondary hover:text-white"
                            >
                              Quiz
                            </BrainButton>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Processing document...</span>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <BrainButton variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </BrainButton>
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
                  </BrainCardContent>
                </BrainCard>
              ))
            )}
          </div>
        </section>

        {/* Recent Generations */}
        <section className="mt-20">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <img src={flashcardIcon} alt="Study Materials" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Study Materials</h2>
              <p className="text-muted-foreground">Generated flashcards and quizzes ready to study</p>
            </div>
          </div>
          <div className="grid gap-6 p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 rounded-2xl border border-primary/20 shadow-sm">
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
                <Card key={generation.id} className="p-6 hover:shadow-sm transition-shadow bg-white border-primary/30">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center border border-primary/30">
                          {generation.type === 'flashcards' ? (
                            <img src={flashcardIcon} alt="Flashcards" className="w-6 h-6" />
                          ) : (
                            <img src={quizIcon} alt="Quiz" className="w-6 h-6" />
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
                className="h-8 w-auto"
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