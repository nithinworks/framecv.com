
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
      
      console.log('=== RESUME SUBMISSION STARTED ===');
      console.log('File selected:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
      
      if (!file) {
        console.log('ERROR: No file selected');
        toast({
          title: "No file selected",
          description: "Please upload a resume PDF",
          variant: "destructive",
        });
        return;
      }
      
      setIsProcessing(true);
      setGlobalProcessing(true);
      
      console.log('Setting processing state to true');
      
      toast({
        title: "Processing your resume",
        description: "AI is analyzing your PDF...",
      });
      
      try {
        console.log('Creating FormData...');
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('FormData created, calling process-resume function...');
        console.log('Supabase URL:', 'https://rlnlbdrlruuoffnyaltc.supabase.co');
        
        const { data, error } = await supabase.functions.invoke('process-resume', {
          body: formData,
        });
        
        console.log('=== SUPABASE FUNCTION RESPONSE ===');
        console.log('Data:', data);
        console.log('Error:', error);
        console.log('Error details:', error ? JSON.stringify(error, null, 2) : 'No error');
        
        if (error) {
          console.log('Function invocation error detected');
          
          // Try to extract error details from the response
          let errorMessage = 'Unknown error occurred';
          let errorType = 'UNKNOWN_ERROR';
          
          if (error.message) {
            console.log('Error message:', error.message);
            errorMessage = error.message;
          }
          
          // Check if there's additional context in the error
          if (error.context) {
            console.log('Error context:', error.context);
          }
          
          // Handle FunctionsHttpError specifically
          if (error.name === 'FunctionsHttpError' && error.context) {
            try {
              const errorResponse = error.context;
              console.log('FunctionsHttpError context:', errorResponse);
              
              if (errorResponse.type === 'NOT_RESUME') {
                console.log('Document identified as NOT_RESUME');
                toast({
                  title: "Invalid Document Type",
                  description: errorResponse.details || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
                  variant: "destructive",
                });
                return;
              }
              
              if (errorResponse.type === 'VALIDATION_ERROR') {
                console.log('Validation error detected');
                toast({
                  title: "Validation Error",
                  description: errorResponse.details || "Please check your file and try again.",
                  variant: "destructive",
                });
                return;
              }
            } catch (parseError) {
              console.log('Failed to parse error context:', parseError);
            }
          }
          
          console.log('Showing AI overcooked toast due to unhandled error');
          throw error;
        }
        
        // Success case
        if (data?.portfolioData) {
          console.log('SUCCESS: Portfolio data received');
          console.log('Portfolio data keys:', Object.keys(data.portfolioData));
          
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
        if (data?.type === 'NOT_RESUME') {
          console.log('NOT_RESUME response in data');
          toast({
            title: "Invalid Document Type",
            description: data.details || "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
            variant: "destructive",
          });
          return;
        }
        
        if (data?.type === 'VALIDATION_ERROR') {
          console.log('VALIDATION_ERROR response in data');
          toast({
            title: "Validation Error",
            description: data.details || "Please check your file and try again.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('No portfolio data or error type found, throwing error');
        throw new Error('No portfolio data received');
        
      } catch (error: any) {
        console.log('=== CATCH BLOCK TRIGGERED ===');
        console.log('Caught error:', error);
        console.log('Error type:', typeof error);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        
        // Check error message for specific types
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('not_resume') || 
            errorMessage.includes('not a resume') || 
            errorMessage.includes('invalid document')) {
          console.log('NOT_RESUME error detected in message');
          toast({
            title: "Invalid Document Type",
            description: "This document does not appear to be a resume. Please upload a valid resume/CV in PDF format.",
            variant: "destructive",
          });
          return;
        }
        
        if (errorMessage.includes('validation')) {
          console.log('Validation error detected in message');
          toast({
            title: "Validation Error",
            description: "Please check your file and try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Default AI processing error
        console.log('Showing default AI overcooked message');
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
        console.log('=== CLEANING UP ===');
        setIsProcessing(false);
        setGlobalProcessing(false);
        console.log('Processing state reset to false');
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
