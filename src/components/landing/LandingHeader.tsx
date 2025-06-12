import React, { useState } from "react";
import { Menu, X, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface LandingHeaderProps {
  isLoaded: boolean;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ isLoaded }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`border-b border-border transition-all duration-1000 ${
        isLoaded ? "animate-blur-in" : "opacity-0 blur-md"
      }`}
    >
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={28}
              height={28}
              viewBox="0 0 375 375"
              aria-label="FrameCV logo"
            >
              <defs>
                <clipPath id="e6f8c5b9f5">
                  <path d="M 12.816406 22.734375 L 362 22.734375 L 362 352.265625 L 12.816406 352.265625 Z M 12.816406 22.734375 " />
                </clipPath>
                <clipPath id="b699a39509">
                  <path d="M 84.816406 22.734375 L 290.183594 22.734375 C 329.949219 22.734375 362.183594 54.96875 362.183594 94.734375 L 362.183594 280.265625 C 362.183594 320.03125 329.949219 352.265625 290.183594 352.265625 L 84.816406 352.265625 C 45.050781 352.265625 12.816406 320.03125 12.816406 280.265625 L 12.816406 94.734375 C 12.816406 54.96875 45.050781 22.734375 84.816406 22.734375 Z M 84.816406 22.734375 " />
                </clipPath>
                <clipPath id="da08487004">
                  <path d="M 124 79.046875 L 291.613281 79.046875 L 291.613281 152 L 124 152 Z M 124 79.046875 " />
                </clipPath>
                <clipPath id="96136f3b18">
                  <path d="M 83.113281 151 L 209 151 L 209 224 L 83.113281 224 Z M 83.113281 151 " />
                </clipPath>
                <clipPath id="77591e5658">
                  <path d="M 83.113281 223 L 167 223 L 167 295.796875 L 83.113281 295.796875 Z M 83.113281 223 " />
                </clipPath>
              </defs>
              <g id="884ab43dfc">
                <g clipPath="url(#e6f8c5b9f5)">
                  <g clipPath="url(#b699a39509)">
                    <path
                      style={{ fill: "#fafafa" }}
                      d="M 12.816406 22.734375 L 361.660156 22.734375 L 361.660156 352.265625 L 12.816406 352.265625 Z M 12.816406 22.734375 "
                    />
                  </g>
                </g>
                <g clipPath="url(#da08487004)">
                  <path
                    style={{ fill: "#171717" }}
                    d="M 143.753906 79.046875 L 124.828125 79.046875 L 166.519531 151.253906 L 249.898438 151.253906 L 291.589844 79.046875 Z M 143.753906 79.046875 "
                  />
                </g>
                <g clipPath="url(#96136f3b18)">
                  <path
                    style={{ fill: "#171717" }}
                    d="M 124.828125 223.464844 L 208.210938 223.464844 L 166.515625 151.257812 L 83.136719 151.257812 Z M 124.828125 223.464844 "
                  />
                </g>
                <g clipPath="url(#77591e5658)">
                  <path
                    style={{ fill: "#171717" }}
                    d="M 166.515625 295.675781 L 124.828125 223.464844 L 83.136719 295.675781 Z M 166.515625 295.675781 "
                  />
                </g>
              </g>
            </svg>
          </div>
          <Link to="/" className="text-base md:text-lg font-normal">
            FrameCV
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <span className="flex items-center gap-1 text-muted-foreground opacity-60 cursor-not-allowed select-none">
            <span>Themes</span>
            <Lock className="w-4 h-4 inline-block align-middle" />
            <span className="ml-1 text-xs">(Coming soon)</span>
          </span>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          {/* <Link
            to="/deploy-guide"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Deploy Guide
          </Link> */}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <span className="flex items-center gap-1 text-muted-foreground opacity-60 cursor-not-allowed select-none">
              <span>Themes</span>
              <Lock className="w-4 h-4 inline-block align-middle" />
              <span className="ml-1 text-xs">(Coming soon)</span>
            </span>
            <Link
              to="/about"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/deploy-guide"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Deploy Guide
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
