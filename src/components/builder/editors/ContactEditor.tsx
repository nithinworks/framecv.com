
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";

const ContactEditor: React.FC = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const { sections } = portfolioData;
  const { contact, social } = sections;

  const handleContactEnabledChange = (enabled: boolean) => {
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

  const handleSocialEnabledChange = (enabled: boolean) => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          enabled
        }
      }
    });
  };

  const handleContactChange = (field: string, value: string) => {
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

  const addSocialItem = () => {
    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: [
            ...social.items,
            {
              platform: "New Platform",
              url: "https://",
              icon: "globe"
            }
          ]
        }
      }
    });
  };

  const updateSocialItem = (index: number, field: string, value: string) => {
    const updatedItems = [...social.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: updatedItems
        }
      }
    });
  };

  const removeSocialItem = (index: number) => {
    const updatedItems = [...social.items];
    updatedItems.splice(index, 1);

    setPortfolioData({
      ...portfolioData,
      sections: {
        ...sections,
        social: {
          ...social,
          items: updatedItems
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="contact-enabled">Show Contact Section</Label>
        <Switch 
          id="contact-enabled" 
          checked={contact.enabled}
          onCheckedChange={handleContactEnabledChange}
        />
      </div>

      {contact.enabled && (
        <>
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="contact-title">Section Title</Label>
                <Input 
                  id="contact-title" 
                  placeholder="Contact Me"
                  value={contact.title} 
                  onChange={(e) => handleContactChange("title", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="contact-email">Email</Label>
                <Input 
                  id="contact-email" 
                  placeholder="your@email.com"
                  value={contact.email} 
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  type="email"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input 
                  id="contact-phone" 
                  placeholder="+1 (123) 456-7890"
                  value={contact.phone} 
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="w-full">
                <Label htmlFor="contact-location">Location</Label>
                <Input 
                  id="contact-location" 
                  placeholder="City, Country"
                  value={contact.location} 
                  onChange={(e) => handleContactChange("location", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="social-enabled">Show Social Media Links</Label>
              <Switch 
                id="social-enabled" 
                checked={social.enabled}
                onCheckedChange={handleSocialEnabledChange}
              />
            </div>
            
            {social.enabled && (
              <>
                <div className="space-y-4">
                  {social.items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-500" />
                          <h4 className="text-sm font-medium">{item.platform || `Platform ${index + 1}`}</h4>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeSocialItem(index)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`platform-${index}`} className="text-xs">Platform Name</Label>
                          <Input 
                            id={`platform-${index}`}
                            placeholder="LinkedIn, Twitter, etc."
                            value={item.platform} 
                            onChange={(e) => updateSocialItem(index, "platform", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`url-${index}`} className="text-xs">URL</Label>
                          <Input 
                            id={`url-${index}`}
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={item.url} 
                            onChange={(e) => updateSocialItem(index, "url", e.target.value)}
                            type="url"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={addSocialItem} 
                    size="sm"
                    className="w-full mt-2"
                  >
                    Add Social Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactEditor;
