
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { toast } from "sonner";

const Builder = () => {
  // Use the PortfolioProvider to provide portfolio data to all components
  return (
    <PortfolioProvider initialData={samplePortfolioData}>
      <BuilderPage />
      <div id="toaster-container" className="fixed bottom-4 right-4 z-50" />
    </PortfolioProvider>
  );
};

export default Builder;
