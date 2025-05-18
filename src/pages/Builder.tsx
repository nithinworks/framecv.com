
import { PortfolioProvider } from "@/context/PortfolioContext";
import BuilderPage from "@/components/BuilderPage";

const Builder = () => {
  return (
    <PortfolioProvider>
      <BuilderPage />
    </PortfolioProvider>
  );
};

export default Builder;
