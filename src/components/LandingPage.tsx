
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { Upload, ArrowRight, Sparkles, Settings, CheckCircle2, Github, Download, Globe } from "lucide-react";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { supabase } from "@/integrations/supabase/client";

const LandingPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsProcessing: setGlobalProcessing } = usePortfolio();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (validateFile(droppedFile)) {
          setFile(droppedFile);
        }
      }
    },
    [toast]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
        }
      }
    },
    [toast]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!file) {
        toast({
          title: "No file selected",
          description: "Please upload a resume PDF",
          variant: "destructive",
        });
        return;
      }
      
      setIsProcessing(true);
      setGlobalProcessing(true);
      
      toast({
        title: "Processing your resume",
        description: "AI is analyzing your PDF...",
      });
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const { data, error } = await supabase.functions.invoke('process-resume', {
          body: formData,
        });
        
        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to process resume');
        }
        
        if (data?.portfolioData) {
          toast({
            title: "Resume processed successfully!",
            description: "Your portfolio has been generated.",
          });
          
          navigate("/builder", { 
            state: { portfolioData: data.portfolioData }
          });
        } else {
          throw new Error('No portfolio data received');
        }
        
      } catch (error) {
        console.error('Error processing resume:', error);
        toast({
          title: "Processing failed",
          description: error.message || "Failed to process your resume. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setGlobalProcessing(false);
      }
    },
    [file, navigate, setGlobalProcessing, toast]
  );

  const handleUseTemplate = () => {
    navigate("/builder", { 
      state: { portfolioData: samplePortfolioData }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b border-border transition-all duration-1000 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md'}`}>
        <div className="container mx-auto py-4 md:py-6 px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-7 md:h-7 bg-foreground rounded-md flex items-center justify-center text-background font-medium text-xs md:text-sm">P</div>
            <h1 className="text-base md:text-lg font-normal">Portfolio Creator</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          </nav>
          <Button variant="outline" onClick={handleUseTemplate} className="text-xs md:text-sm px-3 md:px-6 py-2 md:py-3">
            Try Sample
          </Button>
        </div>
      </header>

      {/* Hero Section with Upload */}
      <section className="flex-grow flex items-center justify-center min-h-[90vh] px-4 md:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          
          {/* Announcement Bar */}
          <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 mb-6 md:mb-8 rounded-full bg-muted border border-border">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <span className="text-xs md:text-sm text-muted-foreground font-medium">AI-powered portfolio generation</span>
            </div>
          </div>

          <div className={`transition-all duration-1200 delay-200 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-3 md:mb-4 tracking-tight leading-[1.1] max-w-3xl mx-auto px-2">
              Your Journey Deserves More Than a Resume
            </h1>
            <h2 className="text-sm md:text-lg lg:text-xl font-normal mb-8 md:mb-12 text-muted-foreground leading-[1.4] max-w-2xl mx-auto px-2">
              Let our AI turn your resume into a stunning personal portfolio — in seconds, for free.
            </h2>
          </div>

          {/* Upload Section */}
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  className={`${dragActive ? 'border-foreground bg-accent' : 'border-border bg-card'} ${file ? 'border-muted-foreground bg-muted' : ''} border-2 border-dashed p-8 rounded-xl transition-all duration-300`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="resume-upload"
                    className="hidden" 
                    onChange={handleChange}
                    accept=".pdf"
                  />
                  <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-background" />
                    </div>
                    {file ? (
                      <div className="text-center">
                        <p className="font-medium text-foreground mb-1">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-medium text-foreground mb-1">Drop your resume here</p>
                        <p className="text-sm text-muted-foreground">PDF only, max 2MB</p>
                      </div>
                    )}
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-foreground hover:bg-muted-foreground text-background font-medium py-4 px-8 rounded-xl transition-all duration-300" 
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                      Processing your resume...
                    </div>
                  ) : (
                    <>
                      Create My Portfolio Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>Ready in minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                  <Settings className="w-5 h-5 text-background" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium text-foreground">How it Works</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Transform your resume into a professional portfolio in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
              <div className="text-center p-8 rounded-2xl bg-card border border-border">
                <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-6 mx-auto">
                  <Upload className="w-8 h-8 text-background" />
                </div>
                <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-foreground">Upload Your Resume</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Simply drag and drop your PDF resume. Our AI will extract all relevant information instantly.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card border border-border">
                <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="w-8 h-8 text-background" />
                </div>
                <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-foreground">AI Magic Happens</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our advanced AI analyzes your content and creates a beautiful, responsive portfolio website.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card border border-border">
                <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-background" />
                </div>
                <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-foreground">Launch & Customize</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Edit, download the code, or publish directly to GitHub. Your portfolio, your way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6">What You Get</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to create a professional portfolio that gets you noticed
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">Responsive Design</h3>
                </div>
                <p className="text-muted-foreground text-sm">Looks perfect on all devices - desktop, tablet, and mobile.</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">SEO Optimized</h3>
                </div>
                <p className="text-muted-foreground text-sm">Built with SEO best practices to help you get discovered online.</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Github className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">GitHub Publishing</h3>
                </div>
                <p className="text-muted-foreground text-sm">One-click deployment to GitHub Pages with your custom domain.</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">Source Code Access</h3>
                </div>
                <p className="text-muted-foreground text-sm">Download the complete source code and customize it further.</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">Easy Customization</h3>
                </div>
                <p className="text-muted-foreground text-sm">Modify colors, fonts, layout, and content with our visual editor.</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-foreground flex-shrink-0" />
                  <h3 className="text-foreground font-medium">Lightning Fast</h3>
                </div>
                <p className="text-muted-foreground text-sm">Optimized for speed and performance with modern web technologies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background font-bold text-sm">P</div>
                <span className="text-lg font-medium">Portfolio Creator</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Transform your resume into a stunning portfolio website in minutes. AI-powered, developer-friendly, completely free.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-muted-foreground mb-3">© 2024 Portfolio Creator</p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
