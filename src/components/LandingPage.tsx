
import React, { useState, useEffect } from "react";
import LandingHeader from "./landing/LandingHeader";
import AnnouncementBar from "./landing/AnnouncementBar";
import HeroContent from "./landing/HeroContent";
import UploadSection from "./landing/UploadSection";
import ToastTestButton from "./landing/ToastTestButton";
import HowItWorksSection from "./landing/HowItWorksSection";
import FeaturesSection from "./landing/FeaturesSection";
import LandingFooter from "./landing/LandingFooter";

const LandingPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader isLoaded={isLoaded} />

      {/* Hero Section with Upload */}
      <section className="flex-grow flex items-center justify-center min-h-[85vh] px-4 md:px-8 pt-12 md:pt-16">
        <div className="container mx-auto text-center max-w-4xl">
          <AnnouncementBar isLoaded={isLoaded} />
          <HeroContent isLoaded={isLoaded} />
          <UploadSection isLoaded={isLoaded} />
          <ToastTestButton />
        </div>
      </section>

      <HowItWorksSection isLoaded={isLoaded} />
      <FeaturesSection isLoaded={isLoaded} />
      <LandingFooter />
    </div>
  );
