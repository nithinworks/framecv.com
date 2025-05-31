
import React, { createContext, useState, useContext, ReactNode } from "react";
import { PortfolioData, DEFAULT_PORTFOLIO_DATA } from "@/types/portfolio";
import { useThemes } from "@/hooks/useThemes";

interface PortfolioContextType {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  currentView: "mobile" | "desktop";
  setCurrentView: React.Dispatch<React.SetStateAction<"mobile" | "desktop">>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  showEditor: boolean;
  setShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
  showCode: boolean;
  setShowCode: React.Dispatch<React.SetStateAction<boolean>>;
  showDeploy: boolean;
  setShowDeploy: React.Dispatch<React.SetStateAction<boolean>>;
  // Theme management
  themes: ReturnType<typeof useThemes>['themes'];
  selectedTheme: string;
  getCurrentTheme: ReturnType<typeof useThemes>['getCurrentTheme'];
  selectTheme: ReturnType<typeof useThemes>['selectTheme'];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
  initialData?: PortfolioData;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ 
  children, 
  initialData = DEFAULT_PORTFOLIO_DATA 
}) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentView, setCurrentView] = useState<"mobile" | "desktop">("desktop");
  const [activeSection, setActiveSection] = useState("hero");
  const [showEditor, setShowEditor] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);

  // Initialize theme management
  const { themes, selectedTheme, getCurrentTheme, selectTheme } = useThemes();

  return (
    <PortfolioContext.Provider
      value={{
        portfolioData,
        setPortfolioData,
        isProcessing,
        setIsProcessing,
        currentView,
        setCurrentView,
        activeSection,
        setActiveSection,
        showEditor,
        setShowEditor,
        showCode,
        setShowCode,
        showDeploy,
        setShowDeploy,
        themes,
        selectedTheme,
        getCurrentTheme,
        selectTheme
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
