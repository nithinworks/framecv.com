
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseUserSubmissionProps {
  actionType: "download" | "deploy";
  portfolioName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const useUserSubmission = ({ actionType, portfolioName, onSuccess, onClose }: UseUserSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitUserDetails = async (name: string, email: string, isAutoSubmit: boolean = false) => {
    setIsLoading(true);

    try {
      // Use upsert to update existing record or create new one based on email
      const { error } = await supabase
        .from('user_submissions')
        .upsert({
          name: name.trim(),
          email: email.trim(),
          action_type: actionType,
          portfolio_name: portfolioName
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error saving user details:', error);
        if (isAutoSubmit) {
          // If auto-submit fails, just return false to show the modal
          setIsLoading(false);
          return false;
        } else {
          toast.error("Failed to save details. Please try again.");
          setIsLoading(false);
          return false;
        }
      }

      const successMessage = isAutoSubmit 
        ? "Welcome back! Using your saved details." 
        : "Details saved successfully!";
      
      toast.success(successMessage);
      onClose();
      onSuccess();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Submission error:', error);
      if (!isAutoSubmit) {
        toast.error("An error occurred. Please try again.");
      }
      setIsLoading(false);
      return false;
    }
  };

  return {
    isLoading,
    submitUserDetails
  };
};
