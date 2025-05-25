
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, User, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "download" | "deploy";
  portfolioName?: string;
  onSuccess: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  actionType,
  portfolioName,
  onSuccess
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name: name.trim(),
          email: email.trim(),
          action_type: actionType,
          portfolio_name: portfolioName
        });

      if (error) {
        console.error('Error saving user details:', error);
        toast.error("Failed to save details. Please try again.");
        return;
      }

      toast.success("Details saved successfully!");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setName("");
      setEmail("");
    } catch (error) {
      console.error('Error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionText = actionType === "download" ? "download" : "deploy";
  const actionTitle = actionType === "download" ? "Download Portfolio" : "Deploy to GitHub";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f0f0f] border-gray-800">
        <DialogHeader className="space-y-4 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-medium text-white">
            {actionType === "download" ? (
              <User className="h-6 w-6" />
            ) : (
              <Mail className="h-6 w-6" />
            )}
            {actionTitle}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base leading-relaxed">
            Please provide your details to {actionText} your portfolio. This helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-11 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-gray-700 hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="flex-1 h-11 bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Continue to ${actionText}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
