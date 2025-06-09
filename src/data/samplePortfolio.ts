import { PortfolioData } from "@/types/portfolio";

export const samplePortfolioData: PortfolioData = {
  "settings": {
    "name": "Sarah Johnson",
    "title": "Full Stack Developer",
    "location": "San Francisco, CA",
    "summary": "Passionate full-stack developer with 5+ years of experience building scalable web applications. I love creating efficient solutions and learning new technologies to solve complex problems.",
    "profileImage": "https://media.istockphoto.com/id/1309328823/photo/headshot-portrait-of-smiling-male-employee-in-office.jpg?s=612x612&w=0&k=20&c=kPvoBm6qCYzQXMAn9JUtqLREXe9-PlZyMl9i-ibaVuY=",
    "primaryColor": "#0067c7",
    "fonts": {
      "primary": "ovo",
      "secondary": "schibsted"
    }
  },
  "sections": {
    "hero": {
      "enabled": true,
      "ctaButtons": [
        {
          "text": "Get In Touch",
          "url": "mailto:sarah.johnson@example.com",
          "isPrimary": true,
          "icon": "mail"
        },
        {
          "text": "View Resume",
          "url": "https://drive.google.com/file/d/sample-resume-link",
          "isPrimary": false,
          "icon": "download"
        }
      ]
    },
    "about": {
      "enabled": true,
      "title": "About Me",
      "content": "I'm a passionate full-stack developer with expertise in modern web technologies. I enjoy building user-friendly applications that solve real-world problems and have a strong foundation in both frontend and backend development.",
      "skills": {
        "enabled": true,
        "title": "Technical Skills",
        "items": [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "PostgreSQL",
          "AWS",
          "Docker",
          "Git"
        ]
      }
    },
    "experience": {
      "enabled": true,
      "title": "Work Experience",
      "items": [
        {
          "company": "TechCorp Solutions",
          "position": "Senior Full Stack Developer",
          "period": "01/2022 - Present",
          "description": "Lead development of scalable web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Mentored junior developers and implemented best practices for code quality."
        },
        {
          "company": "StartupXYZ",
          "position": "Frontend Developer",
          "period": "06/2020 - 12/2021",
          "description": "Built responsive user interfaces using React and TypeScript. Worked closely with designers to implement pixel-perfect designs. Optimized application performance and improved user experience metrics by 40%."
        }
      ]
    },
    "projects": {
      "enabled": true,
      "title": "Featured Projects",
      "items": [
        {
          "title": "E-Commerce Platform",
          "description": "Built a full-featured e-commerce platform with React, Node.js, and PostgreSQL. Includes user authentication, payment processing, and admin dashboard with real-time analytics.",
          "tags": ["React", "Node.js", "PostgreSQL", "Stripe"],
          "previewUrl": "https://demo-ecommerce.example.com"
        },
        {
          "title": "Task Management App",
          "description": "Developed a collaborative task management application with real-time updates using Socket.io. Features include team collaboration, file sharing, and progress tracking.",
          "tags": ["React", "Socket.io", "MongoDB", "Express"],
          "previewUrl": "https://taskapp-demo.example.com"
        },
        {
          "title": "Weather Dashboard",
          "description": "Created a responsive weather dashboard that displays current conditions and forecasts. Integrated with multiple weather APIs and includes location-based services.",
          "tags": ["JavaScript", "Weather API", "Charts.js", "CSS Grid"],
          "previewUrl": "https://weather-dashboard.example.com"
        },
        {
          "title": "Portfolio Website",
          "description": "Designed and developed a modern portfolio website with smooth animations and responsive design. Built with React and deployed on Vercel with continuous integration.",
          "tags": ["React", "Framer Motion", "Tailwind CSS", "Vercel"],
          "previewUrl": "https://portfolio.example.com"
        }
      ]
    },
    "education": {
      "enabled": true,
      "title": "Education",
      "items": [
        {
          "institution": "University of California, Berkeley",
          "degree": "Bachelor of Science in Computer Science",
          "period": "09/2016 - 06/2020"
        },
        {
          "institution": "FreeCodeCamp",
          "degree": "Full Stack Web Development Certification",
          "period": "01/2019 - 12/2019"
        },
        {
          "institution": "Coursera",
          "degree": "Machine Learning Specialization",
          "period": "06/2021 - 12/2021"
        }
      ]
    },
    "achievements": {
      "enabled": true,
      "title": "Achievements & Certifications",
      "items": [
        {
          "title": "AWS Certified Developer",
          "period": "03/2023",
          "description": "Achieved AWS Developer Associate certification demonstrating expertise in developing and maintaining applications on AWS."
        },
        {
          "title": "Tech Innovation Award",
          "period": "12/2022",
          "description": "Received company-wide recognition for developing an innovative solution that improved system performance by 60%."
        },
        {
          "title": "Open Source Contributor",
          "period": "01/2021 - Present",
          "description": "Active contributor to popular open source projects with 500+ GitHub stars and multiple merged pull requests."
        },
        {
          "title": "Hackathon Winner",
          "period": "09/2020",
          "description": "Won first place at the Bay Area Tech Hackathon for developing a sustainability-focused mobile application."
        }
      ]
    },
    "contact": {
      "enabled": true,
      "title": "Contact",
      "email": "sarah.johnson@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA",
      "icon": "phone"
    },
    "social": {
      "enabled": true,
      "items": [
        {
          "platform": "linkedin",
          "name": "LinkedIn",
          "url": "https://linkedin.com/in/sarahjohnson",
          "icon": "globe"
        }
      ]
    }
  },
  "navigation": {
    "items": [
      { "name": "Home", "url": "/" },
      { "name": "About", "url": "#about" },
      { "name": "Projects", "url": "#projects" },
      { "name": "Experience", "url": "#experience" },
      { "name": "Education", "url": "#education" },
      { "name": "Contact", "url": "#contact" }
    ]
  },
  "footer": {
    "enabled": true,
    "copyright": "© 2024 Sarah Johnson. All rights reserved."
  }
};
