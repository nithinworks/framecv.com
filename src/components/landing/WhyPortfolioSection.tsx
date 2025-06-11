import React from "react";
import { Star, Eye, Globe, Rocket } from "lucide-react";
interface WhyPortfolioSectionProps {
  isLoaded: boolean;
}
const WhyPortfolioSection: React.FC<WhyPortfolioSectionProps> = ({
  isLoaded
}) => {
  const cards = [{
    icon: Star,
    title: "Stand Out Instantly",
    description: "A portfolio showcases your work before anyone asks. It's visual, memorable, and shows you're serious.",
    color: "orange"
  }, {
    icon: Eye,
    title: "Show, Don't Just Tell",
    description: "Highlight projects, skills, and personal flair in a way a PDF never could. Your work deserves more than bullet points.",
    color: "blue"
  }, {
    icon: Globe,
    title: "Own Your Online Presence",
    description: "Having your own link makes sharing easy—and helps recruiters or collaborators find you faster.",
    color: "green"
  }, {
    icon: Rocket,
    title: "Future-Proof Your Career",
    description: "Whether it's job hunts, freelance gigs, or speaking opportunities—your portfolio keeps working even when you're not.",
    color: "purple"
  }];
  const getColorClasses = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-orange-500/20 text-orange-400";
      case "blue":
        return "bg-blue-500/20 text-blue-400";
      case "green":
        return "bg-green-500/20 text-green-400";
      case "purple":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };
  return <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`transition-all duration-1000 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why should someone have a portfolio?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">&quot;In today’s crowded job market, a portfolio isn’t optional — it’s your edge.&quot;

          </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {cards.map((card, index) => <div key={index} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl ${getColorClasses(card.color)} backdrop-blur-sm flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {card.description}
                </p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default WhyPortfolioSection;