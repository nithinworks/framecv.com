
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "download" | "deploy";
  portfolioName: string;
  onSuccess: () => void;
}

interface StoredUserData {
  name: string;
  email: string;
  timestamp: number;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  actionType,
  portfolioName,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Local storage key and expiry (30 days in milliseconds)
  const STORAGE_KEY = "portfolio_user_details";
  const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadStoredUserData = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const userData: StoredUserData = JSON.parse(storedData);
          const now = Date.now();
          
          // Check if data hasn't expired
          if (now - userData.timestamp < STORAGE_EXPIRY) {
            setName(userData.name);
            setEmail(userData.email);
            // Auto-submit if data is still valid
            handleAutoSubmit(userData);
            return;
          } else {
            // Clear expired data
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading stored user data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    if (open) {
      loadStoredUserData();
    }
  }, [open]);

  // Auto-submit with stored data
  const handleAutoSubmit = async (userData: StoredUserData) => {
    setIsLoading(true);
    
    try {
      // Use upsert to update existing record or create new one based on email
      const { error } = await supabase
        .from('user_submissions')
        .upsert({
          name: userData.name.trim(),
          email: userData.email.trim(),
          action_type: actionType,
          portfolio_name: portfolioName
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error saving user details:', error);
        // If auto-submit fails, show the modal for manual entry
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back! Using your saved details.");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Auto-submit error:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

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
        toast.error("Failed to save details. Please try again.");
        return;
      }

      // Save to localStorage for future use
      const userDataToStore: StoredUserData = {
        name: name.trim(),
        email: email.trim(),
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userDataToStore));

      toast.success("Details saved successfully!");
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setName("");
      setEmail("");
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
            {actionType === "download" ? "Download Portfolio" : "Deploy to GitHub"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
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
              We'll use these details to help improve our service and may occasionally send you updates about your portfolio.
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
            ) : (
              actionType === "download" ? "Download" : "Deploy"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
