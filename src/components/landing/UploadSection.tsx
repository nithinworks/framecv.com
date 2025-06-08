
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
      
      console.log('Supabase response - data:', JSON.stringify(data, null, 2));
      console.log('Supabase response - error:', JSON.stringify(error, null, 2));
      
      // Check for Supabase function errors first
      if (error) {
        console.error('Supabase function error:', error);
        
        // For FunctionsHttpError, we need to extract the actual error response
        if (error.name === 'FunctionsHttpError') {
          try {
            // Try to get the error details from the response
            const response = await fetch(error.context?.url || '', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmxiZHJscnV1b2ZmbnlhbHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzA4MzUsImV4cCI6MjA2MzY0NjgzNX0.24LD3CVvwmgnj-_SLCGX4jpyc3PnKn_klSjrDfS6Bqo',
              },
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.log('Extracted error data:', errorData);
              
              if (errorData.type === 'NOT_RESUME') {
                toast({
                  title: "Invalid Document Type",
                  description: errorData.details || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
                  variant: "destructive",
                });
                return;
              }
              
              if (errorData.type === 'VALIDATION_ERROR') {
                toast({
                  title: "Validation Error",
                  description: errorData.details || "Please check your file and try again.",
                  variant: "destructive",
                });
                return;
              }
            }
          } catch (fetchError) {
            console.error('Error extracting error details:', fetchError);
          }
        }
        
        // Fallback to generic AI processing error
        throw error;
      }
      
      // Success case
      if (data?.portfolioData) {
        toast({
          title: "Resume processed successfully!",
          description: "Your portfolio has been generated.",
        });
        
        navigate("/builder", { 
          state: { portfolioData: data.portfolioData }
        });
        return;
      } 
      
      // Check for structured error responses in data
      if (data?.type || data?.error) {
        console.log('Structured error in data:', data);
        
        if (data.type === 'NOT_RESUME') {
          toast({
            title: "Invalid Document Type",
            description: data.details || data.message || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
            variant: "destructive",
          });
          return;
        }
        
        if (data.type === 'VALIDATION_ERROR') {
          toast({
            title: "Validation Error",
            description: data.details || data.message || "Please check your file and try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Other structured errors
        throw new Error(data.details || data.message || data.error || 'Unknown error from edge function');
      }
      
      // If no portfolio data and no clear error structure
      throw new Error('No portfolio data received');
      
    } catch (error: any) {
      console.error('Processing error (full):', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // Check error message for keywords (most reliable fallback)
      const errorMessage = error.message?.toLowerCase() || '';
      const errorString = String(error).toLowerCase();
      
      if (errorMessage.includes('not_resume') || 
          errorMessage.includes('not a resume') || 
          errorMessage.includes('voter information') ||
          errorString.includes('not_resume') ||
          errorString.includes('voter information')) {
        toast({
          title: "Invalid Document Type",
          description: "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
          variant: "destructive",
        });
        return;
      }
      
      if (errorMessage.includes('validation') || errorString.includes('validation')) {
        toast({
          title: "Validation Error",
          description: "Please check your file and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Default AI processing error
      toast({
        title: "AI Processing Failed",
        description: "🤖 Our AI partner is overcooked right now! Please try creating your portfolio manually.",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate("/builder", { 
                state: { portfolioData: samplePortfolioData }
              });
            }}
            className="ml-2 bg-white text-black border-gray-600 hover:bg-gray-100"
          >
            Create Manually
          </Button>
        ),
      });
    } finally {
      setIsProcessing(false);
      setGlobalProcessing(false);
    }
  },
  [file, navigate, setGlobalProcessing, toast]
);

  const handleCreateManually = () => {
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
