import React from "react";
import { CheckCircle2, Sparkles, Github, Download, Settings } from "lucide-react";
interface FeaturesSectionProps {
  isLoaded: boolean;
}
const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  isLoaded
}) => {
  return <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6">What You Get</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">Everything you need to turn your resume into a standout digital presence.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">Responsive by Default</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Fits perfectly on mobile, tablet, and desktop — no extra setup needed.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">SEO-Ready Out of the Box</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Get discovered faster with clean, optimized code built for search engines.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Github className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">1-Click GitHub Deploy</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Publish instantly on GitHub Pages with your custom domain.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">Source Code Included</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Download the full codebase — tweak, host, or scale however you like.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">Visual Customization</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Edit fonts, colors, layout, and content — no code required.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <h3 className="text-foreground font-medium text-base">Blazing Fast Performance
              </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">Built with modern frameworks for speed, smoothness, and impact.</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;