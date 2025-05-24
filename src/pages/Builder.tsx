
import BuilderPage from "@/components/BuilderPage";

const Builder = () => {
  // Remove the PortfolioProvider wrapper since BuilderPage should use 
  // the existing context data that was set from the resume processing
  return (
    <>
      <BuilderPage />
      <div id="toaster-container" className="fixed bottom-4 right-4 z-50" />
    </>
  );
};

export default Builder;
