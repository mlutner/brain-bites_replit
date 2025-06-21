import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface GenerateContentParams {
  fileId: number;
  type: 'flashcards' | 'quiz';
  difficulty: string;
  questionCount?: number;
}

export function useGeneration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (params: GenerateContentParams) => 
      apiRequest("/api/generate", {
        method: "POST",
        body: JSON.stringify(params)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      toast({
        title: "Success!",
        description: "Study materials generated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
        description: error.message || "Failed to generate study materials",
        variant: "destructive",
      });
    }
  });

  return {
    generateContent: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
    data: generateMutation.data
  };
}