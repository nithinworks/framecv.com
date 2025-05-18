
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { Upload, ArrowRight } from "lucide-react";

const LandingPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsProcessing, setPortfolioData } = usePortfolio();

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
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return false;
    }

    // Check if the file is under 2MB
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
      
      // For now, we'll use mock data processing
      setIsProcessing(true);
      toast({
        title: "Processing your resume",
        description: "This may take a moment...",
      });
      
      // Simulate API call to Gemini for processing
      setTimeout(() => {
        import("@/data/samplePortfolio").then(({ samplePortfolioData }) => {
          setPortfolioData(samplePortfolioData);
          setIsProcessing(false);
          navigate("/builder");
        });
      }, 2000);
    },
    [file, navigate, setIsProcessing, setPortfolioData, toast]
  );

  const handleUseTemplate = () => {
    import("@/data/samplePortfolio").then(({ samplePortfolioData }) => {
      setPortfolioData(samplePortfolioData);
      navigate("/builder");
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-display font-semibold">Portfolio Creator</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#templates" className="nav-link">Templates</a>
          </nav>
          <Button variant="outline" onClick={handleUseTemplate}>Try with Sample</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col md:flex-row items-center container mx-auto px-6 py-12">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
            Create a <span className="gradient-text">Stunning Portfolio</span> from Your Resume
          </h1>
          <p className="text-lg mb-8 text-gray-600 max-w-md">
            Upload your resume, and our AI will instantly convert it into a beautiful, customizable portfolio website.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'border-primary bg-primary/5' : ''}`}
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
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                {file ? (
                  <div className="text-center">
                    <p className="font-medium text-primary">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">Drop your resume here or click to upload</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports PDF (Max 2MB, 2 pages)
                    </p>
                  </div>
                )}
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={!file}>
              Create My Portfolio <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <div className="w-[350px] h-[400px] rounded-lg shadow-xl border overflow-hidden">
              <img 
                src="/lovable-uploads/82f0abcf-902e-4784-bf29-1d923dfe21f3.png" 
                alt="Portfolio Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-semibold">Your Professional Portfolio</h3>
                  <p className="text-sm opacity-80">Showcase your skills and experience</p>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -top-4 -right-4 w-[350px] h-[400px] bg-accent/20 rounded-lg animate-float"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Resume Parsing</h3>
              <p className="text-gray-600">Upload your resume and watch as our AI extracts all relevant information automatically.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customizable Templates</h3>
              <p className="text-gray-600">Edit every aspect of your portfolio with our intuitive sidebar editor.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
              <p className="text-gray-600">Preview your portfolio on mobile and desktop to ensure it looks great everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-gray-600">Upload your existing resume as a PDF (max 2MB, 2 pages).</p>
            </div>
            <div className="hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">AI Processes Your Data</h3>
              <p className="text-gray-600">Our AI extracts and organizes your information into a structured portfolio format.</p>
            </div>
            <div className="hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Edit & Customize</h3>
              <p className="text-gray-600">Fine-tune your portfolio with our intuitive editor and see changes in real-time.</p>
            </div>
            <div className="hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2">Deploy Your Portfolio</h3>
              <p className="text-gray-600">Deploy to GitHub Pages, Netlify, or Vercel with just a few clicks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-gray-900 font-bold">P</div>
                <h2 className="text-xl font-display font-semibold">Portfolio Creator</h2>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                Convert your resume to a beautiful portfolio website in minutes.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-gray-400">© 2024 Portfolio Creator. All rights reserved.</p>
              <div className="mt-2 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
