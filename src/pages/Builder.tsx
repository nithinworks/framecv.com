
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { Toaster } from "@/components/ui/toaster";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PortfolioData } from "@/types/portfolio";

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the portfolio data from navigation state (passed from landing page)
  const portfolioData = location.state?.portfolioData as PortfolioData;
  
  // If no portfolio data was passed, redirect back to landing
  useEffect(() => {
    if (!portfolioData) {
      console.log("No portfolio data found in navigation state, redirecting to landing");
      navigate("/");
    }
  }, [portfolioData, navigate]);
  
  // Don't render anything if no portfolio data
  if (!portfolioData) {
    return null;
  }
  
  return (
    <PortfolioProvider initialData={portfolioData}>
      <BuilderPage />
      <Toaster />
    </PortfolioProvider>
  );
};

export default Builder;
