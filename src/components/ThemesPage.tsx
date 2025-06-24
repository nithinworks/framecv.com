
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Palette, CheckCircle, ArrowRight } from "lucide-react";

const ThemesPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('add_to_waitlist', {
        user_name: name.trim(),
        user_email: email.trim()
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "You're on the themes waitlist!",
        description: "We'll notify you when themes are available.",
      });
    } catch (error: any) {
      console.error("Themes waitlist signup error:", error);
      
      if (error.message.includes("already on the waitlist")) {
        toast({
          title: "Already registered",
          description: "This email is already on our waitlist.",
          variant: "destructive",
        });
      } else if (error.message.includes("Invalid email format")) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
      } else if (error.message.includes("Name must be")) {
        toast({
          title: "Invalid name",
          description: "Name must be between 1 and 100 characters.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div
          className={`max-w-sm w-full text-center space-y-6 transition-all duration-1000 ${
            isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
          }`}
        >
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <h1 className="text-2xl font-medium">You're In!</h1>
          <p className="text-muted-foreground">
            Thanks for joining the themes waitlist. We'll notify you when themes launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div
        className={`max-w-sm w-full space-y-8 transition-all duration-1000 ${
          isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 375 375"
                aria-label="FrameCV logo"
              >
                <defs>
                  <clipPath id="e6f8c5b9f5">
                    <path d="M 12.816406 22.734375 L 362 22.734375 L 362 352.265625 L 12.816406 352.265625 Z M 12.816406 22.734375 " />
                  </clipPath>
                  <clipPath id="b699a39509">
                    <path d="M 84.816406 22.734375 L 290.183594 22.734375 C 329.949219 22.734375 362.183594 54.96875 362.183594 94.734375 L 362.183594 280.265625 C 362.183594 320.03125 329.949219 352.265625 290.183594 352.265625 L 84.816406 352.265625 C 45.050781 352.265625 12.816406 320.03125 12.816406 280.265625 L 12.816406 94.734375 C 12.816406 54.96875 45.050781 22.734375 84.816406 22.734375 Z M 84.816406 22.734375 " />
                  </clipPath>
                  <clipPath id="da08487004">
                    <path d="M 124 79.046875 L 291.613281 79.046875 L 291.613281 152 L 124 152 Z M 124 79.046875 " />
                  </clipPath>
                  <clipPath id="96136f3b18">
                    <path d="M 83.113281 151 L 209 151 L 209 224 L 83.113281 224 Z M 83.113281 151 " />
                  </clipPath>
                  <clipPath id="77591e5658">
                    <path d="M 83.113281 223 L 167 223 L 167 295.796875 L 83.113281 295.796875 Z M 83.113281 223 " />
                  </clipPath>
                </defs>
                <g id="884ab43dfc">
                  <g clipPath="url(#e6f8c5b9f5)">
                    <g clipPath="url(#b699a39509)">
                      <path
                        style={{ fill: "#fafafa" }}
                        d="M 12.816406 22.734375 L 361.660156 22.734375 L 361.660156 352.265625 L 12.816406 352.265625 Z M 12.816406 22.734375 "
                      />
                    </g>
                  </g>
                  <g clipPath="url(#da08487004)">
                    <path
                      style={{ fill: "#171717" }}
                      d="M 143.753906 79.046875 L 124.828125 79.046875 L 166.519531 151.253906 L 249.898438 151.253906 L 291.589844 79.046875 Z M 143.753906 79.046875 "
                    />
                  </g>
                  <g clipPath="url(#96136f3b18)">
                    <path
                      style={{ fill: "#171717" }}
                      d="M 124.828125 223.464844 L 208.210938 223.464844 L 166.515625 151.257812 L 83.136719 151.257812 Z M 124.828125 223.464844 "
                    />
                  </g>
                  <g clipPath="url(#77591e5658)">
                    <path
                      style={{ fill: "#171717" }}
                      d="M 166.515625 295.675781 L 124.828125 223.464844 L 83.136719 295.675781 Z M 166.515625 295.675781 "
                    />
                  </g>
                </g>
              </svg>
            </div>
            <span className="font-medium text-lg">FrameCV</span>
          </div>

          <Palette className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-medium">Themes Coming Soon</h1>
          <p className="text-sm text-muted-foreground">
            Beautiful, customizable themes for your portfolio are on the way. Join our waitlist to be the first to know when they launch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="themes-name" className="sr-only">
              Name
            </Label>
            <Input
              id="themes-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-center bg-white/5 border-white/10 focus:border-white/20"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="themes-email" className="sr-only">
              Email
            </Label>
            <Input
              id="themes-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-center bg-white/5 border-white/10 focus:border-white/20"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-foreground hover:bg-muted-foreground text-background font-medium rounded-lg transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                Joining...
              </div>
            ) : (
              <>
                <Palette className="w-4 h-4 mr-2" />
                Join Themes Waitlist
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ThemesPage;
