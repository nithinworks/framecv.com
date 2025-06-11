
import React from "react";

interface HeroContentProps {
  isLoaded: boolean;
}

const HeroContent: React.FC<HeroContentProps> = ({ isLoaded }) => {
  return (
    <div className={`transition-all duration-1000 delay-100 mt-2 md:mt-0 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md translate-y-8'}`}>
      <h1 className="text-xl md:text-3xl lg:text-4xl font-medium mb-3 md:mb-4 tracking-tight leading-[1.2] md:leading-[1.2] lg:leading-[1.2] max-w-3xl mx-auto px-2">
        Your Journey Deserves More Than a Resume
      </h1>
      <h2 className="text-xs md:text-base lg:text-lg font-normal mb-8 md:mb-10 text-muted-foreground leading-[1.6] md:leading-[1.6] lg:leading-[1.6] max-w-2xl mx-auto px-2">
        Turn your resume into a stunning portfolio — in seconds, for free.
      </h2>
    </div>
  );
};

export default HeroContent;
