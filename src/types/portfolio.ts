export interface PortfolioData {
  settings: {
    name: string;
    title: string;
    location: string;
    summary: string;
    profileImage: string;
    primaryColor: string;
    fontFamily: string;
  };
  sections: {
    hero: {
      enabled: boolean;
      ctaButtons: {
        text: string;
        url: string;
        isPrimary: boolean;
        icon?: string;
      }[];
    };
    about: {
      enabled: boolean;
      title: string;
      content: string;
      skills: {
        enabled: boolean;
        title: string;
        items: string[];
      };
    };
    experience: {
      enabled: boolean;
      title: string;
      items: {
        company: string;
        position: string;
        period: string;
        description: string;
      }[];
    };
    projects: {
      enabled: boolean;
      title: string;
      items: {
        title: string;
        description: string;
        tags: string[];
        previewUrl: string;
      }[];
    };
    education: {
      enabled: boolean;
      title: string;
      items: {
        institution: string;
        degree: string;
        period: string;
        description?: string;
      }[];
    };
    achievements: {
      enabled: boolean;
      title: string;
      items: {
        title: string;
        period: string;
        description: string;
      }[];
    };
    contact: {
      enabled: boolean;
      title: string;
      email: string;
      phone: string;
      location: string;
      icon?: string;
    };
    social: {
      enabled: boolean;
      items: {
        platform: string;
        url: string;
        icon?: string;
      }[];
    };
  };
  navigation: {
    items: {
      name: string;
      url: string;
    }[];
  };
  footer: {
    enabled: boolean;
    copyright: string;
  };
}

export type PortfolioSection = keyof PortfolioData["sections"];

export const FONT_OPTIONS = [
  { value: "Ovo", label: "Ovo", description: "Elegant & Sophisticated" },
  { value: "Playfair Display", label: "Playfair Display", description: "Luxury & Editorial" },
  { value: "Crimson Text", label: "Crimson Text", description: "Classic & Refined" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", description: "Artistic & Stylish" },
  { value: "EB Garamond", label: "EB Garamond", description: "Traditional & Elegant" },
  { value: "Merriweather", label: "Merriweather", description: "Readable & Professional" },
  { value: "Inter", label: "Inter", description: "Modern & Clean" },
  { value: "Outfit", label: "Outfit", description: "Rounded & Friendly" },
  { value: "Poppins", label: "Poppins", description: "Geometric & Versatile" },
  { value: "Source Sans Pro", label: "Source Sans Pro", description: "Professional" },
  { value: "Roboto", label: "Roboto", description: "Google's Default" },
  { value: "Montserrat", label: "Montserrat", description: "Bold & Contemporary" }
];

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  settings: {
    name: "Your Name",
    title: "Your Title",
    location: "Your Location",
    summary: "A brief summary about yourself and your skills.",
    profileImage: "https://via.placeholder.com/400",
    primaryColor: "#0067c7",
    fontFamily: "Ovo"
  },
  sections: {
    hero: {
      enabled: true,
      ctaButtons: [
        {
          text: "Contact Me",
          url: "mailto:your.email@example.com",
          isPrimary: true,
          icon: "mail"
        },
        {
          text: "Download Resume",
          url: "#",
          isPrimary: false,
          icon: "download"
        }
      ]
    },
    about: {
      enabled: true,
      title: "About Me",
      content: "Write about yourself, your experience, and what you're passionate about.",
      skills: {
        enabled: true,
        title: "Skills",
        items: ["HTML", "CSS", "JavaScript", "React", "Node.js"]
      }
    },
    experience: {
      enabled: true,
      title: "Experience",
      items: [
        {
          company: "Company Name",
          position: "Your Position",
          period: "01/2020 - Present",
          description: "Description of your role and responsibilities."
        }
      ]
    },
    projects: {
      enabled: true,
      title: "Projects",
      items: [
        {
          title: "Project Name",
          description: "Description of the project and your contributions.",
          tags: ["React", "TypeScript", "Tailwind CSS"],
          previewUrl: "#"
        }
      ]
    },
    education: {
      enabled: true,
      title: "Education",
      items: [
        {
          institution: "University Name",
          degree: "Your Degree",
          period: "09/2016 - 06/2020",
          description: "Additional details about your studies."
        }
      ]
    },
    achievements: {
      enabled: true,
      title: "Achievements & Certifications",
      items: [
        {
          title: "Achievement Title",
          period: "01/2022",
          description: "Description of your achievement or certification."
        }
      ]
    },
    contact: {
      enabled: true,
      title: "Contact",
      email: "your.email@example.com",
      phone: "+1 234 567 890",
      location: "Your City, Country",
      icon: "phone"
    },
    social: {
      enabled: true,
      items: [
        {
          platform: "LinkedIn",
          url: "https://linkedin.com/in/yourusername",
          icon: "globe"
        }
      ]
    }
  },
  navigation: {
    items: [
      { name: "Home", url: "/" },
      { name: "About", url: "#about" },
      { name: "Projects", url: "#projects" },
      { name: "Experience", url: "#experience" },
      { name: "Education", url: "#education" },
      { name: "Contact", url: "#contact" }
    ]
  },
  footer: {
    enabled: true,
    copyright: "© 2024 Your Name. All rights reserved."
  }
};
