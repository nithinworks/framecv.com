
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
      // Validate inputs before submission
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      if (trimmedName.length === 0 || trimmedName.length > 100) {
        if (!isAutoSubmit) {
          toast.error("Name must be between 1 and 100 characters");
        }
        setIsLoading(false);
        return false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        if (!isAutoSubmit) {
          toast.error("Please enter a valid email address");
        }
        setIsLoading(false);
        return false;
      }

      // Use upsert to update existing record or create new one based on email
      const { error } = await supabase
        .from('user_submissions')
        .upsert({
          name: trimmedName,
          email: trimmedEmail,
          action_type: actionType,
          portfolio_name: portfolioName
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error saving user details:', error);
        
        if (error.message.includes('Rate limit exceeded')) {
          const errorMsg = "You've reached the hourly limit of 10 submissions. Please try again later.";
          if (!isAutoSubmit) {
            toast.error(errorMsg);
          }
        } else if (error.message.includes('Invalid email format')) {
          if (!isAutoSubmit) {
            toast.error("Please enter a valid email address");
          }
        } else if (error.message.includes('Name must be')) {
          if (!isAutoSubmit) {
            toast.error("Name must be between 1 and 100 characters");
          }
        } else {
          if (!isAutoSubmit) {
            toast.error("Failed to save details. Please try again.");
          }
        }
        
        setIsLoading(false);
        return false;
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
