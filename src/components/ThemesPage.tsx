
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Palette, CheckCircle, ArrowRight, Home } from "lucide-react";
import LandingHeader from "./landing/LandingHeader";
import { Link } from "react-router-dom";

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
      <div className="min-h-screen bg-background text-foreground">
        <LandingHeader isLoaded={isLoaded} />
        <div className="flex items-center justify-center px-4 pt-20">
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
            <Link to="/">
              <Button className="w-full h-10 bg-foreground hover:bg-muted-foreground text-background font-medium rounded-lg transition-all duration-300">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader isLoaded={isLoaded} />
      <div className="flex items-center justify-center px-4 pt-20">
        <div
          className={`max-w-sm w-full space-y-8 transition-all duration-1000 ${
            isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center space-y-4">
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
    </div>
  );
};

export default ThemesPage;
