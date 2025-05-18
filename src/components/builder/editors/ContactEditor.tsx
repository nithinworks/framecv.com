
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ContactEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { contact } = sections;

  const handleEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        contact: {
          ...contact,
          enabled
        }
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        contact: {
          ...contact,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="contact-enabled">Enable Contact Section</Label>
        <Switch 
          id="contact-enabled" 
          checked={contact.enabled}
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {contact.enabled && (
        <>
          <div>
            <Label htmlFor="contact-title">Section Title</Label>
            <Input 
              id="contact-title" 
              value={contact.title} 
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input 
              id="contact-email" 
              value={contact.email} 
              onChange={(e) => handleChange("email", e.target.value)}
              type="email"
            />
          </div>

          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input 
              id="contact-phone" 
              value={contact.phone} 
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contact-location">Location</Label>
            <Input 
              id="contact-location" 
              value={contact.location} 
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ContactEditor;
