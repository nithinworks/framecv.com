
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
          console.error('Error details:', {
            message: error.message,
            details: error.details || 'No additional details',
            hint: error.hint || 'No hint provided',
            code: error.code || 'No error code'
          });
          
          // Enhanced error handling with user-friendly messages
          let userMessage = "Our AI is experiencing some technical difficulties. Please try creating your portfolio manually instead.";
          let shouldSuggestManual = true;
          
          // Check for specific error types and customize messages
          if (error.message?.includes('overloaded') || error.message?.includes('503')) {
            userMessage = "🤖 Our AI is overcooked right now! Too many people are using it. Please try creating your portfolio manually or wait a few minutes.";
          } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            userMessage = "🕐 Our AI needs a breather! Rate limit reached. Please try again in a few minutes or create manually.";
          } else if (error.message?.includes('Invalid file type') || error.message?.includes('File too large')) {
            userMessage = error.message;
            shouldSuggestManual = false;
          } else if (error.message?.includes('API key') || error.message?.includes('Authentication')) {
            userMessage = "🔧 Our AI is having authentication issues. Please try creating your portfolio manually for now.";
          } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
            userMessage = "⏰ The AI took too long to respond. Please try creating your portfolio manually or try again later.";
          }
          
          toast({
            title: "AI Processing Failed",
            description: userMessage,
            variant: "destructive",
            action: shouldSuggestManual ? (
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
            ) : undefined,
          });
          
          throw new Error(error.message || 'Failed to process resume');
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
            title: "AI Processing Incomplete",
            description: "🤖 Our AI got confused and didn't return your portfolio data. Please try creating manually!",
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
        console.error('Error stack:', error.stack);
        
        // Only show toast if we haven't already shown one for this specific error
        if (!error.message?.includes('Failed to process resume') && !error.message?.includes('No portfolio data received')) {
          toast({
            title: "Unexpected Error",
            description: "🤖 Our AI had an unexpected hiccup! Please try creating your portfolio manually.",
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
