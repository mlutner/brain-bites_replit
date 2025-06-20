import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Flashcard from "@/components/flashcard";
import Quiz from "@/components/quiz";
import brainBitesLogo from "@assets/image_1750458395951.png";

export default function StudySession() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: generation, isLoading: isLoadingGeneration, error } = useQuery({
    queryKey: [`/api/generations/${id}`],
    enabled: isAuthenticated && !!id,
  });

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

  if (error) {
    const errorMessage = error instanceof Error && isUnauthorizedError(error) 
      ? "You need to be logged in to access this content."
      : "Failed to load study session.";

    if (error instanceof Error && isUnauthorizedError(error)) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingGeneration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The study session you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Logo in top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <img 
          src={brainBitesLogo} 
          alt="Brain Bites" 
          className="h-10 w-auto"
        />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="text-left">
                <h1 className="font-semibold text-foreground">{generation?.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {generation?.type === 'flashcards' 
                    ? `${generation?.content?.length} flashcards`
                    : `${generation?.content?.length} questions`
                  } • {generation?.difficulty} difficulty
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Study Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generation.type === 'flashcards' ? (
          <Flashcard cards={generation.content} />
        ) : (
          <Quiz questions={generation.content} title={generation.title} />
        )}
      </main>
    </div>
  );
}
