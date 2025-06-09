import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8 flex flex-col items-center">
        {/* Logo Only */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={40}
              height={40}
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
        </div>
        {/* Description */}
        <p className="text-center text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Transform your resume into a stunning portfolio website in minutes.
          AI-powered, developer-friendly, completely free.
        </p>
        {/* Nav Links */}
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6">
            <li>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/deploy-guide"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Deploy Guide
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        {/* Copyright */}
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FrameCV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
