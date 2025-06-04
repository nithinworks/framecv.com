
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { ArrowRight } from "lucide-react";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { supabase } from "@/integrations/supabase/client";
import FileUploadZone from "./FileUploadZone";

interface UploadSectionProps {
  isLoaded: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ isLoaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsProcessing: setGlobalProcessing } = usePortfolio();

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
      
      // Enhanced logging for browser console
      console.log('🚀 Starting resume processing...');
      console.log('📄 File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      toast({
        title: "Processing your resume",
        description: "AI is analyzing your PDF...",
      });
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('📡 Calling Supabase edge function...');
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('process-resume', {
          body: formData,
        });
        
        const processingTime = Date.now() - startTime;
        console.log(`⏱️ Processing completed in ${processingTime}ms`);
        
        if (error) {
          console.error('❌ Supabase function error:', error);
          
          // Simple single toast message for any error
          toast({
            title: "AI Processing Failed",
            description: "🤖 Our AI partner is overcooked right now! Please try creating your portfolio manually.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('👤 User chose to create portfolio manually after error');
                  navigate("/builder", { 
                    state: { portfolioData: samplePortfolioData }
                  });
                }}
                className="ml-2"
              >
                Create Manually
              </Button>
            ),
          });
          
          throw new Error('AI processing failed');
        }
        
        console.log('✅ Supabase function success:', data);
        
        if (data?.portfolioData) {
          console.log('📊 Portfolio data received:', {
            hasSettings: !!data.portfolioData.settings,
            hasSections: !!data.portfolioData.sections,
            name: data.portfolioData.settings?.name || 'Unknown',
            sectionsCount: data.portfolioData.sections ? Object.keys(data.portfolioData.sections).length : 0
          });
          
          toast({
            title: "Resume processed successfully!",
            description: "Your portfolio has been generated.",
          });
          
          console.log('🎯 Navigating to builder with portfolio data...');
          navigate("/builder", { 
            state: { portfolioData: data.portfolioData }
          });
        } else {
          console.error('❌ No portfolio data received:', data);
          
          toast({
            title: "AI Processing Failed",
            description: "🤖 Our AI partner is overcooked right now! Please try creating your portfolio manually.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('👤 User chose to create portfolio manually after incomplete processing');
                  navigate("/builder", { 
                    state: { portfolioData: samplePortfolioData }
                  });
                }}
                className="ml-2"
              >
                Create Manually
              </Button>
            ),
          });
          
          throw new Error('No portfolio data received');
        }
        
      } catch (error) {
        console.error('💥 Resume processing failed:', error);
        
        // Only show toast if we haven't already shown one for this specific error
        if (!error.message?.includes('AI processing failed') && !error.message?.includes('No portfolio data received')) {
          toast({
            title: "AI Processing Failed",
            description: "🤖 Our AI partner is overcooked right now! Please try creating your portfolio manually.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('👤 User chose to create portfolio manually after unexpected error');
                  navigate("/builder", { 
                    state: { portfolioData: samplePortfolioData }
                  });
                }}
                className="ml-2"
              >
                Create Manually
              </Button>
            ),
          });
        }
      } finally {
        console.log('🏁 Resume processing finished');
        setIsProcessing(false);
        setGlobalProcessing(false);
      }
    },
    [file, navigate, setGlobalProcessing, toast]
  );

  const handleCreateManually = () => {
    console.log('👤 Creating portfolio manually with sample data');
    navigate("/builder", { 
      state: { portfolioData: samplePortfolioData }
    });
  };

  return (
    <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileUploadZone file={file} onFileSelect={setFile} />
          
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

        <div className="mt-3">
          <button 
            onClick={handleCreateManually}
            className="text-white text-sm underline transition-all duration-300 underline-offset-4"
          >
            Create Portfolio Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
