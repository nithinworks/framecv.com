
import React from "react";
import { useNavigate } from "react-router-dom";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { supabase } from "@/integrations/supabase/client";

const ManualCreationLink: React.FC = () => {
  const navigate = useNavigate();

  const handleManualCreation = () => {
    // Track manual portfolio creation
    supabase.rpc('increment_portfolio_stat', { stat_type: 'manual' }).catch(console.error);
    
    navigate("/builder", { 
      state: { portfolioData: samplePortfolioData }
    });
  };

  return (
    <div className="text-center mt-6">
      <p className="text-sm text-muted-foreground mb-3">
        Don't have a resume? No problem!
      </p>
      <button
        onClick={handleManualCreation}
        className="text-white/80 hover:text-white underline underline-offset-4 transition-colors duration-200 text-sm font-medium"
      >
        Create portfolio manually instead →
      </button>
    </div>
  );
};

export default ManualCreationLink;
