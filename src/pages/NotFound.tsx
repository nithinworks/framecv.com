import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div
        className={`max-w-sm w-full space-y-8 transition-all duration-1000 ${
          isLoaded ? "animate-fade-up" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 h-10 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
