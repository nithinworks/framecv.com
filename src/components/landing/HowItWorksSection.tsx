import React from "react";
import { Upload, Sparkles, Edit, Download, Settings } from "lucide-react";

interface HowItWorksSectionProps {
  isLoaded: boolean;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ isLoaded }) => {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-foreground">
                How it Works
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Transform your resume into a professional portfolio in four simple
              steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-3 text-foreground">
                Upload Your Resume
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Upload your PDF resume. Our system instantly extracts your
                skills, experience, and projects—no manual work.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium mb-3 text-foreground">
                AI Builds Your Portfolio
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Our AI transforms your content into a modern, responsive
                portfolio—structured, styled, and ready to shine.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Edit className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-3 text-foreground">
                Live-Edit Your Details
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Tweak text, update links, or swap sections. See changes in
                real-time with a live preview that updates as you type.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Download className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium mb-3 text-foreground">
                Publish or Download
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Deploy to GitHub Pages with one click, or download the full
                source code and host it anywhere. You're in control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
