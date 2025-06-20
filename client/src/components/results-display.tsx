import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Download, Eye, Play } from "lucide-react";

interface ResultsDisplayProps {
  content: {
    id: number;
    type: string;
    title: string;
    content: any[];
    difficulty: string;
    questionCount?: number;
    createdAt: string;
  };
}

export default function ResultsDisplay({ content }: ResultsDisplayProps) {
  const handleExport = () => {
    // TODO: Implement PDF export
    console.log('Export functionality to be implemented');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden result-card">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {content.type === 'flashcards' ? 'Generated Flashcards' : 'Generated Quiz'}
            </h2>
            <p className="text-muted-foreground">
              {content.type === 'flashcards' 
                ? `${content.content.length} cards` 
                : `${content.content.length} questions`
              } based on your content
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Link href={`/study/${content.id}`}>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Start Studying
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Badge className={getDifficultyColor(content.difficulty)}>
            {content.difficulty} difficulty
          </Badge>
          {content.type === 'quiz' && (
            <Badge variant="outline">
              {content.questionCount} questions
            </Badge>
          )}
        </div>

        {/* Content Preview */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Content Preview</h3>
          
          {content.type === 'flashcards' ? (
            // Flashcards preview
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {content.content.slice(0, 3).map((card: any, index: number) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Card {index + 1}
                        </Badge>
                        <Badge className={getDifficultyColor(card.difficulty)} variant="secondary">
                          {card.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-foreground">
                        {card.question}
                      </h4>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {card.answer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Quiz preview
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {content.content.slice(0, 3).map((question: any, index: number) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Question {index + 1}
                        </Badge>
                        <Badge className={getDifficultyColor(question.difficulty)} variant="secondary">
                          {question.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-foreground">
                        {question.question}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            optionIndex === question.correctAnswer 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {optionIndex === question.correctAnswer && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className={`text-sm ${
                            optionIndex === question.correctAnswer 
                              ? 'text-green-700 font-medium' 
                              : 'text-muted-foreground'
                          }`}>
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {content.content.length > 3 && (
            <div className="text-center pt-4">
              <Link href={`/study/${content.id}`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View all {content.content.length} {content.type === 'flashcards' ? 'cards' : 'questions'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
