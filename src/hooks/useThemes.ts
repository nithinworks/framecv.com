
import { useState } from "react";

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  styles: {
    background: string;
    heroBackground: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    fontFamily: string;
    spacing: string;
  };
}

export const themes: Theme[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, contemporary design with subtle shadows",
    preview: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    styles: {
      background: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.03) 0%, #fff 100%)",
      heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.08) 0%, #fff 100%)",
      cardBackground: "rgba(255, 255, 255, 0.8)",
      textPrimary: "#2d3748",
      textSecondary: "#718096",
      border: "rgba(0, 0, 0, 0.1)",
      accent: "rgba(var(--primary-rgb), 0.1)",
      fontFamily: "'Inter', system-ui, sans-serif",
      spacing: "normal"
    }
  },
  {
    id: "dark-professional",
    name: "Dark Professional",
    description: "Sophisticated dark theme for professional portfolios",
    preview: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
    styles: {
      background: "linear-gradient(120deg, #1a202c 0%, #2d3748 100%)",
      heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.1) 0%, #1a202c 100%)",
      cardBackground: "rgba(45, 55, 72, 0.8)",
      textPrimary: "#f7fafc",
      textSecondary: "#a0aec0",
      border: "rgba(255, 255, 255, 0.1)",
      accent: "rgba(var(--primary-rgb), 0.2)",
      fontFamily: "'Outfit', system-ui, sans-serif",
      spacing: "relaxed"
    }
  },
  {
    id: "warm-creative",
    name: "Warm Creative",
    description: "Inviting design with warm tones and creative flair",
    preview: "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
    styles: {
      background: "linear-gradient(120deg, #fff5f5 0%, #fffaf0 100%)",
      heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.05) 0%, #fff5f5 100%)",
      cardBackground: "rgba(255, 248, 240, 0.9)",
      textPrimary: "#744210",
      textSecondary: "#a0522d",
      border: "rgba(196, 130, 89, 0.2)",
      accent: "rgba(var(--primary-rgb), 0.15)",
      fontFamily: "'Poppins', system-ui, sans-serif",
      spacing: "cozy"
    }
  },
  {
    id: "glass-futuristic",
    name: "Glass Futuristic",
    description: "Modern glassmorphism with futuristic elements",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    styles: {
      background: "linear-gradient(120deg, #f0f4ff 0%, #e6f3ff 100%)",
      heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)",
      cardBackground: "rgba(255, 255, 255, 0.25)",
      textPrimary: "#1e293b",
      textSecondary: "#64748b",
      border: "rgba(255, 255, 255, 0.3)",
      accent: "rgba(var(--primary-rgb), 0.2)",
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      spacing: "spacious"
    }
  },
  {
    id: "vintage-classic",
    name: "Vintage Classic",
    description: "Timeless design with classic typography and colors",
    preview: "linear-gradient(135deg, #f7f3e9 0%, #e8dcc0 100%)",
    styles: {
      background: "linear-gradient(120deg, #f7f3e9 0%, #ede8db 100%)",
      heroBackground: "linear-gradient(120deg, rgba(var(--primary-rgb), 0.06) 0%, #f7f3e9 100%)",
      cardBackground: "rgba(247, 243, 233, 0.9)",
      textPrimary: "#3c2e26",
      textSecondary: "#8b7355",
      border: "rgba(139, 115, 85, 0.2)",
      accent: "rgba(var(--primary-rgb), 0.12)",
      fontFamily: "'Crimson Text', serif",
      spacing: "classic"
    }
  }
];

export const useThemes = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("modern-minimal");

  const getCurrentTheme = (): Theme => {
    return themes.find(theme => theme.id === selectedTheme) || themes[0];
  };

  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  return {
    themes,
    selectedTheme,
    getCurrentTheme,
    selectTheme
  };
};
