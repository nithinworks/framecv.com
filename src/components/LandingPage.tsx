
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { Upload, ArrowRight, Sparkles, Settings, Palette, CheckCircle2, Github, Download, Globe, Zap, Target, Clock, Star } from "lucide-react";
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
        <div className="container mx-auto py-4 md:py-6 px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-7 md:h-7 bg-white rounded-md flex items-center justify-center text-black font-medium text-xs md:text-sm">P</div>
            <h1 className="text-base md:text-lg font-normal">Portfolio Creator</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#features" className="nav-link">Features</a>
          </nav>
          <Button variant="outline" onClick={handleUseTemplate} className="btn-minimal text-xs md:text-sm px-3 md:px-6 py-2 md:py-3">
            Try Sample
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center min-h-[90vh] px-4 md:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          
          {/* Announcement Bar */}
          <div className={`transition-all duration-1000 delay-100 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 mb-6 md:mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white/70" />
              <span className="text-xs md:text-sm text-white/80 font-medium">AI-powered portfolio generation</span>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className={`transition-all duration-1200 delay-200 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-3 md:mb-4 tracking-tight leading-[1.1] max-w-3xl mx-auto px-2">
              Your Journey Deserves More Than a Resume
            </h1>
            <h2 className="text-sm md:text-lg lg:text-xl font-normal mb-6 md:mb-8 text-white/70 leading-[1.4] max-w-2xl mx-auto px-2">
              Let our AI turn your resume into a stunning personal portfolio — in seconds, for free.
            </h2>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium text-white">How it Works</h2>
              </div>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Transform your resume into a professional portfolio in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
              <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-white">Upload Your Resume</h3>
                <p className="text-white/60 leading-relaxed">
                  Simply drag and drop your PDF resume. Our AI will extract all relevant information instantly.
                </p>
              </div>
              
              <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-white">AI Magic Happens</h3>
                <p className="text-white/60 leading-relaxed">
                  Our advanced AI analyzes your content and creates a beautiful, responsive portfolio website.
                </p>
              </div>
              
              <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-4 text-white">Launch & Customize</h3>
                <p className="text-white/60 leading-relaxed">
                  Edit, download the code, or publish directly to GitHub. Your portfolio, your way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium text-white">Why Stand Out Matters</h2>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Make a Lasting Impression</h3>
                    <p className="text-white/60">Stand out from other candidates with a professional online presence that showcases your unique story.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Save Countless Hours</h3>
                    <p className="text-white/60">No need to learn web development or hire expensive designers. Get a professional portfolio in minutes.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Own Your Digital Presence</h3>
                    <p className="text-white/60">Your career deserves more than a static resume. Create a dynamic showcase of your achievements.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-medium text-white mb-6 leading-tight">
                  Turn Your Resume Into Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Secret Weapon</span>
                </h3>
                <p className="text-xl text-white/70 mb-8 leading-relaxed">
                  In today's competitive job market, a traditional resume isn't enough. You need a portfolio that tells your story, showcases your personality, and proves your capabilities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>No coding required</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>100% free to start</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium text-white">What You Get</h2>
              </div>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Everything you need to create a professional portfolio that gets you noticed
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-green-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">Responsive Design</h3>
                </div>
                <p className="text-white/60 text-sm">Looks perfect on all devices - desktop, tablet, and mobile.</p>
              </div>
              
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">SEO Optimized</h3>
                </div>
                <p className="text-white/60 text-sm">Built with SEO best practices to help you get discovered online.</p>
              </div>
              
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Github className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">GitHub Publishing</h3>
                </div>
                <p className="text-white/60 text-sm">One-click deployment to GitHub Pages with your custom domain.</p>
              </div>
              
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-orange-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">Source Code Access</h3>
                </div>
                <p className="text-white/60 text-sm">Download the complete source code and customize it further.</p>
              </div>
              
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">Easy Customization</h3>
                </div>
                <p className="text-white/60 text-sm">Modify colors, fonts, layout, and content with our visual editor.</p>
              </div>
              
              <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-pink-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-pink-400 flex-shrink-0" />
                  <h3 className="text-white font-medium">Lightning Fast</h3>
                </div>
                <p className="text-white/60 text-sm">Optimized for speed and performance with modern web technologies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Ready to stand out?</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-white leading-tight">
                Don't Let Your Resume Gather Dust
              </h2>
              <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed max-w-3xl mx-auto">
                Transform your career story into a compelling portfolio that opens doors. 
                Join thousands who've already made the leap from static resumes to dynamic portfolios.
              </p>
              
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div 
                    className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'border-white/30 bg-white/10' : 'border-white/20 bg-white/5'} p-8 rounded-xl transition-all duration-300`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      id="resume-upload-cta"
                      className="hidden" 
                      onChange={handleChange}
                      accept=".pdf"
                    />
                    <label htmlFor="resume-upload-cta" className="flex flex-col items-center cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      {file ? (
                        <div className="text-center">
                          <p className="font-medium text-white mb-1">{file.name}</p>
                          <p className="text-xs text-white/60">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="font-medium text-white mb-1">Drop your resume here</p>
                          <p className="text-sm text-white/60">PDF only, max 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100" 
                    disabled={!file || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing your resume...
                      </div>
                    ) : (
                      <>
                        🚀 Create My Portfolio Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Free forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Ready in minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
                <span className="text-lg font-medium">Portfolio Creator</span>
              </div>
              <p className="text-sm text-white/60 max-w-sm">
                Transform your resume into a stunning portfolio website in minutes. AI-powered, developer-friendly, completely free.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-white/40 mb-3">© 2024 Portfolio Creator</p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
