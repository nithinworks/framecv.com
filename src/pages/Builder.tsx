
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { samplePortfolioData } from "@/data/samplePortfolio";

const Builder = () => {
  // Use the PortfolioProvider to provide portfolio data to all components
  return (
    <PortfolioProvider initialData={samplePortfolioData}>
      <BuilderPage />
    </PortfolioProvider>
  );
};

export default Builder;
