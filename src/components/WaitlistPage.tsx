
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

const WaitlistPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name: name.trim(),
          email: email.trim(),
          action_type: 'waitlist',
          portfolio_name: 'Waitlist Signup'
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "You're on the waitlist!",
        description: "We'll notify you when FrameCV is ready.",
      });
    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold">You're In!</h1>
            <p className="text-muted-foreground">
              Thanks for joining the FrameCV waitlist. We'll notify you as soon as we're ready to launch!
            </p>
          </div>
          
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">
              In the meantime, follow us on social media for updates and tips on creating amazing portfolios.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
                <span className="text-background font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl">FrameCV</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
        <div className="container mx-auto text-center max-w-4xl space-y-12">
          
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-muted/80 text-muted-foreground px-4 py-2 rounded-full text-sm font-medium border border-border/50">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Coming Soon
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              Turn Your Resume Into a
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent block mt-2">
                Stunning Portfolio
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              FrameCV uses AI to transform your resume into a beautiful, customizable portfolio website. 
              No coding required, just upload and deploy.
            </p>
          </div>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waitlist-name" className="sr-only">Name</Label>
                <Input
                  id="waitlist-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-center"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="waitlist-email" className="sr-only">Email</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-center"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-foreground hover:bg-muted-foreground text-background font-medium rounded-xl transition-all duration-300" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                    Joining waitlist...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Join the Waitlist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              Be among the first to access FrameCV when we launch. No spam, ever.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Smart extraction and beautiful formatting
              </p>
            </div>
            
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">One-Click Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Publish to GitHub Pages instantly
              </p>
            </div>
            
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-foreground/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">Fully Customizable</h3>
              <p className="text-sm text-muted-foreground">
                Personalize every detail to match your style
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 FrameCV. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WaitlistPage;
