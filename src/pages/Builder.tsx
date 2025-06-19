
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { Toaster } from "@/components/ui/toaster";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortfolioData } from "@/types/portfolio";
import { useOptimizedFeatureFlags } from "@/hooks/useOptimizedFeatureFlags";
import { PageLoader } from "@/components/ui/branded-loader";

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { featureFlags, isLoading: flagsLoading } = useOptimizedFeatureFlags();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get the portfolio data from navigation state or sessionStorage
  useEffect(() => {
    const initializeBuilder = async () => {
      console.log("Builder page: checking for portfolio data...");

      // First try to get from navigation state
      let data = location.state?.portfolioData as PortfolioData;
      console.log("Portfolio data from navigation state:", data ? "Found" : "Not found");

      // If not found in navigation state, check sessionStorage (for GitHub OAuth flow)
      if (!data) {
        const storedData = sessionStorage.getItem("github_oauth_portfolio_data");
        if (storedData) {
          console.log("Found portfolio data in sessionStorage, restoring...");
          try {
            data = JSON.parse(storedData);
            // Clear the stored data after using it
            sessionStorage.removeItem("github_oauth_portfolio_data");
            // Flag that GitHub connection is complete
            sessionStorage.setItem("github_connection_complete", "true");
          } catch (error) {
            console.error("Failed to parse stored portfolio data:", error);
          }
        }
      }

      if (data) {
        console.log("Portfolio data loaded successfully");
        setPortfolioData(data);
      } else {
        console.log("No portfolio data found, redirecting to landing");
        navigate("/");
        return;
      }

      setIsInitializing(false);
    };

    initializeBuilder();
  }, [location.state, navigate]);

  // Show loader while initializing or loading feature flags
  if (isInitializing || flagsLoading) {
    return <PageLoader message="Preparing Portfolio Builder..." />;
  }

  // Don't render anything if no portfolio data
  if (!portfolioData) {
    return <PageLoader message="Loading Portfolio Builder..." />;
  }

  return (
    <PortfolioProvider initialData={portfolioData}>
      <BuilderPage />
      <Toaster />
    </PortfolioProvider>
  );
};

export default Builder;
