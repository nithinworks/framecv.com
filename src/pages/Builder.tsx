
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { Toaster } from "@/components/ui/toaster";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortfolioData } from "@/types/portfolio";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { featureFlags } = useFeatureFlags();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  
  // Get the portfolio data from navigation state (passed from landing page) or sessionStorage
  useEffect(() => {
    console.log("Builder page: checking for portfolio data...");
    
    // First try to get from navigation state
    let data = location.state?.portfolioData as PortfolioData;
    console.log("Portfolio data from navigation state:", data ? "Found" : "Not found");
    
    // If not found in navigation state, check sessionStorage (for GitHub OAuth flow)
    if (!data) {
      const storedData = sessionStorage.getItem('github_oauth_portfolio_data');
      if (storedData) {
        console.log("Found portfolio data in sessionStorage, restoring...");
        try {
          data = JSON.parse(storedData);
          // Clear the stored data after using it
          sessionStorage.removeItem('github_oauth_portfolio_data');
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
    }
  }, [location.state, navigate]);
  
  // Don't render anything if no portfolio data
  if (!portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717] px-4">
        <div className="text-center animate-blur-in">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-medium mb-3 text-white">Loading Portfolio Builder</h2>
          <p className="text-gray-400 text-sm">Preparing your workspace...</p>
        </div>
      </div>
    );
  }
  
  return (
    <PortfolioProvider initialData={portfolioData}>
      <BuilderPage />
      <Toaster />
    </PortfolioProvider>
  );
};

export default Builder;
