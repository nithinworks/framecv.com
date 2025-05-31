
import React from "react";
import { Upload, Sparkles, Globe, Settings } from "lucide-react";

interface HowItWorksSectionProps {
  isLoaded: boolean;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ isLoaded }) => {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-foreground">How it Works</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Transform your resume into a professional portfolio in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-3 text-foreground">Upload Your Resume</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Simply drag and drop your PDF resume. Our AI will extract all relevant information instantly.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-3 text-foreground">AI Magic Happens</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Our advanced AI analyzes your content and creates a beautiful, responsive portfolio website.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div className="w-8 h-1 bg-foreground rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-3 text-foreground">Launch & Customize</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Edit, download the code, or publish directly to GitHub. Your portfolio, your way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
