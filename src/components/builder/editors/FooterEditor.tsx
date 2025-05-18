
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const FooterEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { footer } = portfolioData;

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      footer: {
        ...footer,
        enabled
      }
    });
  };

  const handleCopyrightChange = (copyright: string) => {
    setPortfolioData({
      ...portfolioData,
      footer: {
        ...footer,
        copyright
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="footer-enabled">Enable Footer</Label>
        <Switch 
          id="footer-enabled" 
          checked={footer.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {footer.enabled && (
        <div>
          <Label htmlFor="footer-copyright">Copyright Text</Label>
          <Input 
            id="footer-copyright" 
            value={footer.copyright} 
            onChange={(e) => handleCopyrightChange(e.target.value)}
          />
        </div>
      )}

      <div className="text-sm text-gray-500 pt-2">
        <p>Tip: You can use © symbol and the current year in your copyright text.</p>
      </div>
    </div>
  );
};

export default FooterEditor;
