import React from "react";
import { Sparkles } from "lucide-react";
interface AnnouncementBarProps {
  isLoaded: boolean;
}
const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  isLoaded
}) => {
  return <div className={`transition-all duration-1000 delay-100 ${isLoaded ? "animate-blur-in" : "opacity-0 blur-md translate-y-4"}`}>
      <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 mb-6 md:mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
        <span className="text-xs md:text-sm text-muted-foreground font-medium">Resume to Portfolio in Seconds 🔥</span>
      </div>
    </div>;
};
export default AnnouncementBar;