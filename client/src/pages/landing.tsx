import { BrainCard, BrainCardContent } from "@/components/ui/brain-card";
import { BrainButton } from "@/components/ui/brain-button";
import { FileText, Zap, Brain, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="brain-logo">
              <div className="w-10 h-10 brain-gradient rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="brain-heading-3">Brain Bites</span>
            </div>
            
            <BrainButton onClick={handleLogin} icon={ArrowRight} iconPosition="right">
              Sign In
            </BrainButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Generate Study Materials in Seconds
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload your documents and let AI create personalized flashcards and quizzes 
            tailored to your learning needs.
          </p>
          <BrainButton onClick={handleLogin} size="lg" icon={ArrowRight} iconPosition="right">
            Get Started Free
          </BrainButton>
        </div>

        {/* Features */}
        <div className="brain-grid grid-cols-1 md:grid-cols-3 mb-16">
          <BrainCard className="text-center" variant="interactive">
            <BrainCardContent>
              <div className="w-16 h-16 brain-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="brain-heading-3 mb-4">
                Smart Document Processing
              </h3>
              <p className="brain-text-muted">
                Upload PDFs and text files. Our AI extracts and analyzes content automatically.
              </p>
            </BrainCardContent>
          </BrainCard>

          <BrainCard className="text-center" variant="interactive">
            <BrainCardContent>
              <div className="w-16 h-16 brain-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="brain-heading-3 mb-4">
                Instant Generation
              </h3>
              <p className="brain-text-muted">
                Create flashcards and quizzes in under a minute with advanced AI technology.
              </p>
            </BrainCardContent>
          </BrainCard>

          <BrainCard className="text-center" variant="interactive">
            <BrainCardContent>
              <div className="w-16 h-16 brain-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="brain-heading-3 mb-4">
                Adaptive Difficulty
              </h3>
              <p className="brain-text-muted">
                AI automatically adjusts content difficulty based on your material complexity.
              </p>
            </BrainCardContent>
          </BrainCard>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <BrainCard variant="gradient" padding="lg" className="brain-gradient-light">
            <BrainCardContent>
              <h2 className="brain-heading-2 mb-4">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="brain-text-muted mb-6">
                Join thousands of students who are already studying smarter, not harder.
              </p>
              <BrainButton onClick={handleLogin} size="lg" icon={ArrowRight} iconPosition="right">
                Start Creating Now
              </BrainButton>
            </BrainCardContent>
          </BrainCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="brain-container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="brain-logo mb-4 md:mb-0">
              <div className="w-8 h-8 brain-gradient rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">Brain Bites</span>
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
