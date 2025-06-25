
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { Toaster } from "@/components/ui/toaster";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortfolioData } from "@/types/portfolio";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { BrandedLoader } from "@/components/ui/branded-loader";

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { featureFlags, isLoading: flagsLoading } = useFeatureFlags();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get the portfolio data from navigation state or sessionStorage
  useEffect(() => {
    const initializeBuilder = async () => {
      // First try to get from navigation state
      let data = location.state?.portfolioData as PortfolioData;

      // If not found in navigation state, check localStorage (for GitHub OAuth flow)
      if (!data) {
        const storedData = localStorage.getItem("github_oauth_portfolio_data");
        if (storedData) {
          try {
            data = JSON.parse(storedData);
            // Don't clear the stored data yet - we need it for the GitHub flow
          } catch (error) {
            // Silent fail
          }
        }
      }

      if (data) {
        setPortfolioData(data);
      } else {
        navigate("/");
        return;
      }

      setIsInitializing(false);
    };

    initializeBuilder();
  }, [location.state, navigate]);

  // Show loader while initializing or loading feature flags
  if (isInitializing || flagsLoading) {
    return <BrandedLoader message="Preparing Portfolio Builder..." size="lg" fullScreen={true} />;
  }

  // Don't render anything if no portfolio data
  if (!portfolioData) {
    return <BrandedLoader message="Loading Portfolio Builder..." size="lg" fullScreen={true} />;
  }

  return (
    <PortfolioProvider initialData={portfolioData}>
      <BuilderPage />
      <Toaster />
    </PortfolioProvider>
  );
};

export default Builder;
