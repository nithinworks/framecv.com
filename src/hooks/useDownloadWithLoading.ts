
import { useState } from "react";
import { useDownloadCode } from "@/hooks/useDownloadCode";
import { usePortfolio } from "@/context/PortfolioContext";

export const useDownloadWithLoading = () => {
  const { portfolioData } = usePortfolio();
  const { downloadSourceCode } = useDownloadCode();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadType, setDownloadType] = useState<"source" | "json">("source");
  const [fileName, setFileName] = useState("");

  const handleDownloadSourceCode = async () => {
    setDownloadType("source");
    setIsLoading(true);
    
    try {
      await downloadSourceCode();
      const name = `${portfolioData.settings.name.replace(/\s+/g, "-")}-Portfolio-Code.zip`;
      setFileName(name);
      setIsLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Download failed:", error);
      setIsLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    setDownloadType("json");
    setIsLoading(true);

    setTimeout(() => {
      const dataStr = JSON.stringify(portfolioData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = "portfolio-data.json";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFileName(fileName);
      setIsLoading(false);
      setShowSuccess(true);
    }, 1000); // Small delay to show loading state
  };

  return {
    isLoading,
    showSuccess,
    downloadType,
    fileName,
    setShowSuccess,
    handleDownloadSourceCode,
    handleDownloadJSON,
  };
};
