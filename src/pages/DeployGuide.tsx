import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { Github, Rocket } from "lucide-react";

const DeployGuide = () => {
  return (
    <>
      <LandingHeader isLoaded={true} />
      <main className="min-h-[60vh] bg-background text-foreground flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How to Deploy Your Portfolio
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Deploy your FrameCV portfolio in just a few steps.
          </p>
        </div>
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center">
          <Rocket className="w-10 h-10 text-blue-500 mb-4" />
          <ol className="list-decimal pl-5 text-left text-muted-foreground space-y-2 text-base w-full max-w-md mx-auto mb-4">
            <li>Build your portfolio using our builder tool.</li>
            <li>
              Click the <b>Deploy</b> button in the builder interface.
            </li>
            <li>Follow the prompts to connect your GitHub account.</li>
            <li>Your portfolio will be deployed to GitHub Pages.</li>
          </ol>
          <div className="flex items-center gap-2 mt-2">
            <Github className="w-5 h-5 text-foreground" />
            <a
              href="/docs/portfolio-site-documentation.html"
              className="text-blue-500 underline text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Full Documentation
            </a>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
};

export default DeployGuide;
