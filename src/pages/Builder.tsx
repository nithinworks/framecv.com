
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";
import { samplePortfolioData } from "@/data/samplePortfolio";

const Builder = () => {
  return (
    <PortfolioProvider initialData={samplePortfolioData}>
      <BuilderPage />
    </PortfolioProvider>
  );
};

export default Builder;
