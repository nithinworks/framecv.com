
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { Upload, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Header */}
      <header className={`border-b border-border/20 transition-all duration-1000 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md'}`}>
        <div className="container mx-auto py-6 px-6 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-black font-medium text-sm">P</div>
            <h1 className="text-lg font-normal">Portfolio Creator</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
          </nav>
          <Button variant="outline" onClick={handleUseTemplate} className="btn-minimal">
            Try Sample
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center min-h-[80vh] px-6 md:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          
          {/* Announcement Bar */}
          <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/80 font-medium">AI-powered portfolio generation</span>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className={`transition-all duration-1200 delay-200 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 tracking-tight leading-[1.1] max-w-3xl mx-auto">
              Your Journey Deserves More Than a Resume
            </h1>
            <h2 className="text-base md:text-lg lg:text-xl font-normal mb-8 text-white/70 leading-[1.4] max-w-2xl mx-auto">
              Let our AI turn your resume into a stunning personal portfolio — in seconds, for free.
            </h2>
          </div>
          
          <div className={`max-w-md mx-auto transition-all duration-1000 delay-700 ${isLoaded ? 'animate-scale-blur' : 'opacity-0 scale-95 blur-sm'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div 
                className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'border-white/20 bg-white/5' : ''}`}
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
                  <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                  {file ? (
                    <div className="text-center">
                      <p className="font-normal text-white text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-normal text-sm mb-1">Drop your resume here</p>
                      <p className="text-xs text-muted-foreground">
                        PDF only, max 2MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={!file || isProcessing}>
                {isProcessing ? "Processing..." : "Create Portfolio"} 
                {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Processing powered by AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border/10">
        <div className="container mx-auto px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl font-normal text-center mb-16 text-muted-foreground">Features</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-normal mb-3">AI-Powered</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced resume parsing that understands your experience and skills automatically.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-normal mb-3">Customizable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Edit every aspect with our intuitive editor and see changes in real-time.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-normal mb-3">Responsive</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Perfect on all devices with mobile-first design principles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-border/10">
        <div className="container mx-auto px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl font-normal text-center mb-16 text-muted-foreground">How It Works</h2>
            <div className="flex flex-col md:flex-row gap-12 items-start justify-center max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-8 h-8 rounded-full border border-border/30 text-muted-foreground flex items-center justify-center mb-4 text-sm">1</div>
                <h3 className="text-base font-normal mb-2">Upload Resume</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Upload your PDF resume file</p>
              </div>
              <div className="hidden md:block">
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-4" />
              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-8 h-8 rounded-full border border-border/30 text-muted-foreground flex items-center justify-center mb-4 text-sm">2</div>
                <h3 className="text-base font-normal mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">AI extracts and organizes your data</p>
              </div>
              <div className="hidden md:block">
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-4" />
              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-8 h-8 rounded-full border border-border/30 text-muted-foreground flex items-center justify-center mb-4 text-sm">3</div>
                <h3 className="text-base font-normal mb-2">Customize</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Edit and deploy your portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-12">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black font-medium text-xs">P</div>
                <span className="text-sm font-normal">Portfolio Creator</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                Convert your resume to a beautiful portfolio website in minutes.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs text-muted-foreground">© 2024 Portfolio Creator</p>
              <div className="mt-2 flex space-x-6">
                <a href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
