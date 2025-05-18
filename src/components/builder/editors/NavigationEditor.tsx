
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";

const NavigationEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { navigation } = portfolioData;

  const addNavItem = () => {
    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: [
          ...navigation.items,
          { name: "New Link", url: "#" }
        ]
      }
    });
  };

  const updateNavItem = (index: number, field: string, value: string) => {
    const updatedItems = [...navigation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: updatedItems
      }
    });
  };

  const removeNavItem = (index: number) => {
    const updatedItems = [...navigation.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      navigation: {
        ...navigation,
        items: updatedItems
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Navigation Items</h3>
      
      <div className="space-y-4">
        {navigation.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Input 
                value={item.name} 
                onChange={(e) => updateNavItem(index, "name", e.target.value)}
                placeholder="Link text"
              />
            </div>
            <div className="flex-1">
              <Input 
                value={item.url} 
                onChange={(e) => updateNavItem(index, "url", e.target.value)}
                placeholder="URL"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeNavItem(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        type="button" 
        onClick={addNavItem} 
        className="w-full mt-4"
      >
        Add Navigation Item
      </Button>
      
      <div className="text-sm text-gray-500 pt-2">
        <p>Tip: For section links, use "#section-id" format (e.g., "#about").</p>
      </div>
    </div>
  );
};

export default NavigationEditor;
