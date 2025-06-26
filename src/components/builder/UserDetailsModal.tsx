
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUserDetailsStorage } from "@/hooks/useUserDetailsStorage";
import { useUserSubmission } from "@/hooks/useUserSubmission";
import { supabase } from "@/integrations/supabase/client";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "download" | "deploy";
  portfolioName: string;
  portfolioLink?: string;
  onSuccess: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  actionType,
  portfolioName,
  portfolioLink,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { loadStoredUserData, saveUserData } = useUserDetailsStorage();
  const { isLoading, submitUserDetails } = useUserSubmission({
    actionType,
    portfolioName,
    portfolioLink,
    onSuccess: async () => {
      // Track download if this is a download action
      if (actionType === "download") {
        try {
          await supabase.rpc('increment_portfolio_stat', { stat_type: 'download' });
        } catch (error) {
          console.error('Failed to track portfolio stat:', error);
        }
      }
      onSuccess();
    },
    onClose: () => onOpenChange(false),
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    if (open) {
      const storedData = loadStoredUserData();
      if (storedData) {
        setName(storedData.name);
        setEmail(storedData.email);
        // Auto-submit if data is still valid
        handleAutoSubmit(storedData.name, storedData.email);
      }
    }
  }, [open]);

  // Auto-submit with stored data
  const handleAutoSubmit = async (storedName: string, storedEmail: string) => {
    const success = await submitUserDetails(storedName, storedEmail, true);
    if (!success) {
      // If auto-submit failed, keep the modal open for manual entry
      console.log("Auto-submit failed, showing modal for manual entry");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Enhanced validation to match server-side rules
    if (name.trim().length > 100) {
      toast.error("Name must be 100 characters or less");
      return;
    }

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const success = await submitUserDetails(name, email, false);
    if (success) {
      // Save to localStorage for future use
      saveUserData(name, email);

      // Reset form
      setName("");
      setEmail("");
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md h-auto max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {actionType === "download"
              ? "Download Portfolio"
              : "Publish to GitHub"}
          </DialogTitle>
          <DialogDescription>
            {actionType === "download"
              ? "Enter your details to download your portfolio."
              : "Enter your details to publish your portfolio to GitHub."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-details-name">Name</Label>
              <Input
                id="user-details-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Maximum 100 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 py-2">
              We'll use these details to help improve our service and may
              occasionally send you updates about your portfolio. Rate limits:
              10 submissions per hour.
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : actionType === "download" ? (
              "Download"
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
