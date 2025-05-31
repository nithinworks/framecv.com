
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface LandingHeaderProps {
  isLoaded: boolean;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ isLoaded }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`border-b border-border transition-all duration-1000 ${isLoaded ? 'animate-blur-in' : 'opacity-0 blur-md'}`}>
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-7 md:h-7 bg-foreground rounded-md flex items-center justify-center text-background font-medium text-xs md:text-sm">F</div>
          <h1 className="text-base md:text-lg font-normal">FrameCV</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a 
              href="#how-it-works" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <a 
              href="#features" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
