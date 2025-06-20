import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, FileText } from "lucide-react";
import flashcardIcon from "@assets/image_1750460299962.png";

interface GenerationOptionsProps {
  selectedFormat: 'flashcards' | 'quiz' | null;
  onFormatChange: (format: 'flashcards' | 'quiz') => void;
  quizConfig: { questions: number; difficulty: string };
  onQuizConfigChange: (config: { questions: number; difficulty: string }) => void;
}

export default function GenerationOptions({
  selectedFormat,
  onFormatChange,
  quizConfig,
  onQuizConfigChange,
}: GenerationOptionsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
        Choose Your Study Format
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Flashcards Option */}
        <Card 
          className={`generation-card ${
            selectedFormat === 'flashcards' ? 'selected border-primary shadow-lg' : 'border-border hover:border-primary'
          }`}
          onClick={() => onFormatChange('flashcards')}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src={flashcardIcon} alt="Flashcards" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Flashcards</h3>
                <p className="text-muted-foreground mb-4">
                  Generate question-answer pairs perfect for memorization and quick review.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Front: Key concepts and questions</p>
                  <p>• Back: Detailed explanations</p>
                  <p>• Adaptive difficulty levels</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Option */}
        <Card 
          className={`generation-card ${
            selectedFormat === 'quiz' ? 'selected border-primary shadow-lg' : 'border-border hover:border-primary'
          }`}
          onClick={() => onFormatChange('quiz')}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Choice Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Create comprehensive tests with multiple choice questions and instant feedback.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• 5-25 questions (customizable)</p>
                  <p>• Smart distractor generation</p>
                  <p>• Immediate scoring and review</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Configuration */}
      {selectedFormat === 'quiz' && (
        <Card className="p-6 bg-muted/50">
          <CardContent className="p-0">
            <h4 className="font-medium text-foreground mb-4">Quiz Configuration</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of questions:
                </label>
                <Select
                  value={quizConfig.questions.toString()}
                  onValueChange={(value) => 
                    onQuizConfigChange({ ...quizConfig, questions: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                    <SelectItem value="25">25 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty:
                </label>
                <Select
                  value={quizConfig.difficulty}
                  onValueChange={(value) => 
                    onQuizConfigChange({ ...quizConfig, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
