import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";
import brainBitesLogo from "@assets/image_1750458395951.png";

interface FlashcardProps {
  cards: Array<{
    question: string;
    answer: string;
    difficulty?: string;
  }>;
}

export default function Flashcard({ cards }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No flashcards available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  // Safety check for card data
  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Card data is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setCompletedCards(prev => new Set(prev).add(currentIndex));
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Card {currentIndex + 1} of {cards.length}
            </h2>
            <p className="text-muted-foreground">
              {completedCards.size} cards reviewed
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(currentCard.difficulty || 'medium')}>
              {currentCard.difficulty || 'medium'}
            </Badge>
            {completedCards.has(currentIndex) && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Flashcard */}
      <div className="flashcard-flip">
        <div 
          className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card className="flashcard-front brain-card border-2 shadow-lg relative">
            <div className="absolute top-4 right-4 z-10">
              <img 
                src={brainBitesLogo} 
                alt="Brain Bites" 
                className="h-8 w-auto opacity-60"
              />
            </div>
            <CardContent className="h-full flex items-center justify-center text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-foreground mb-6 leading-relaxed">
                  {currentCard.question}
                </h3>
                <div className="flex items-center justify-center space-x-2 text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Click to reveal answer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="flashcard-back border-2 shadow-lg relative">
            <div className="absolute top-4 right-4 z-10">
              <img 
                src={brainBitesLogo} 
                alt="Brain Bites" 
                className="h-8 w-auto opacity-40"
              />
            </div>
            <CardContent className="h-full flex items-center justify-center text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h4 className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">
                  Answer
                </h4>
                <p className="text-xl text-foreground leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleFlip}>
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </Button>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Summary */}
      {currentIndex === cards.length - 1 && completedCards.size === cards.length && (
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Great job! You've completed all flashcards.
            </h3>
            <p className="text-muted-foreground mb-4">
              You reviewed {cards.length} cards. Ready to try again?
            </p>
            <Button onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
