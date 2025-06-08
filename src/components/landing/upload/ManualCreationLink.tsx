
import React from "react";
import { useNavigate } from "react-router-dom";
import { samplePortfolioData } from "@/data/samplePortfolio";

const ManualCreationLink: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateManually = () => {
    navigate("/builder", { 
      state: { portfolioData: samplePortfolioData }
    });
  };

  return (
    <div className="mt-3">
      <button 
        onClick={handleCreateManually}
        className="text-white text-sm underline transition-all duration-300 underline-offset-4"
      >
        Create Portfolio Manually
      </button>
    </div>
  );
};

export default ManualCreationLink;
