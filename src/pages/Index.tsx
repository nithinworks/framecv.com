
import { PortfolioProvider } from "@/context/PortfolioContext";
import LandingPage from "@/components/LandingPage";

const Index = () => {
  return (
    <PortfolioProvider>
      <LandingPage />
    </PortfolioProvider>
  );
};

export default Index;
