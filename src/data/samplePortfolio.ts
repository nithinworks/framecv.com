
import { PortfolioData } from "@/types/portfolio";

export const samplePortfolioData: PortfolioData = {
  "settings": {
    "name": "Kollipara Yuvanaga Nithin",
    "title": "Full Stack Developer",
    "location": "India",
    "summary": "A dedicated and tech-savvy individual with a B.Tech in Computer Science Engineering seeking a challenging role at a progressive organization that offers immense growth opportunities.",
    "profileImage": "https://media.licdn.com/dms/image/v2/D5603AQFzMJaF4hG5Dw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727192931451?e=1752710400&v=beta&t=fwPmFbTPBP6TK-aJbS9GMh__RtbWgkmcopHLGIoKfV8",
    "primaryColor": "#0067c7"
  },
  "sections": {
    "hero": {
      "enabled": true,
      "ctaButtons": [
        {
          "text": "Connect via Email",
          "url": "mailto:connect.naganithin@gmail.com",
          "isPrimary": true,
          "icon": "mail"
        },
        {
          "text": "View Resume",
          "url": "https://drive.google.com/your-resume-link",
          "isPrimary": false,
          "icon": "download"
        }
      ]
    },
    "about": {
      "enabled": true,
      "title": "About Me",
      "content": "A Computer Science Engineering graduate with a passion for technology and problem-solving. Experienced in web technologies, Android development, and SAP Quality Management. Seeking opportunities to apply and expand my skills in a challenging and growth-oriented environment.",
      "skills": {
        "enabled": true,
        "title": "Skills",
        "items": [
          "C",
          "C++",
          "Java",
          "Web Technologies (HTML, CSS, JavaScript, PHP)",
          "Flutter (Intermediate)",
          "SAP QM",
          "SEO",
          "Digital Marketing"
        ]
      }
    },
    "experience": {
      "enabled": true,
      "title": "Experience",
      "items": [
        {
          "company": "Cognizant",
          "position": "SAP Quality Management",
          "period": "09/2022 - Present",
          "description": "Worked as an Intern initially, gaining experience in web technologies (HTML, CSS, JavaScript, PHP) and SAP Quality Management. Transitioned to a Full-time role after training in SAP QM. Served as a Point of Contact (POC) for 30 interns."
        },
        {
          "company": "SP Technologies",
          "position": "Android Developer",
          "period": "11/2018 - 05/2019",
          "description": "Completed a 6-month industrial training. Troubleshooted technical issues (90% success rate), enhanced application features, fixed bugs, and optimized performance. Developed an Advanced Weather Application using the OpenWeather API."
        }
      ]
    },
    "projects": {
      "enabled": true,
      "title": "Projects",
      "items": [
        {
          "title": "Grow Wiser - Placement News App",
          "description": "Developed a news application using Flutter 2.5 to display the latest company hiring information. Utilized Firebase Cloud Firestore for data storage and retrieval.",
          "tags": ["Flutter", "Firebase", "Mobile Development"],
          "previewUrl": "#"
        },
        {
          "title": "Weather Tracking App",
          "description": "Developed a weather tracking application using the OpenWeather API. Features include weather tracking for the current location and other cities with a responsive user interface.",
          "tags": ["Android Development", "OpenWeather API", "Java"],
          "previewUrl": "https://google.com"
        },
        {
          "title": "Weather Tracking App",
          "description": "Developed a weather tracking application using the OpenWeather API. Features include weather tracking for the current location and other cities with a responsive user interface.",
          "tags": ["Android Development", "OpenWeather API", "Java"],
          "previewUrl": "#"
        },
        {
          "title": "COVID-19 Tracker App",
          "description": "Developed a COVID-19 tracker application using the Open Disease Data API and Volley Library. Provides data on total cases, deaths, critical cases, recoveries, total tests, and vaccination counts for all countries.",
          "tags": ["Android Development", "API Integration", "Java", "Volley"],
          "previewUrl": "#"
        }
      ]
    },
    "education": {
      "enabled": true,
      "title": "Education",
      "items": [
        {
          "institution": "Vidya Jyothi Institute of Technology",
          "degree": "B.Tech in Computer Science",
          "period": "07/2019 - Present",
          "description": "Hyderabad"
        },
        {
          "institution": "RRS College of Engineering & Technology",
          "degree": "Diploma in Computer Engineering",
          "period": "06/2016 - 04/2019"
        },
        {
          "institution": "ST. Anthony's High School",
          "degree": "10th Board",
          "period": "03/2015 - 03/2016"
        }
      ]
    },
    "achievements": {
      "enabled": true,
      "title": "Achievements & Certifications",
      "items": [
        {
          "title": "2nd Prize in Coding Quiz",
          "period": "03/2017",
          "description": "Won 2nd prize in the coding quiz at Stanza & Waves - 2K17, RRS College of Engineering & Technology."
        },
        {
          "title": "National Level Tech Fest Participant",
          "period": "09/2017",
          "description": "Participated in THE TECH FEST 2017 national event conducted by JNTU, Hyderabad."
        },
        {
          "title": "Aptech Certified Programmer",
          "period": "04/2016 - 04/2017",
          "description": "Learned C, C++, Java, SQL, and MS Office."
        },
        {
          "title": "Certified Android Developer",
          "period": "11/2018 - 05/2019",
          "description": "Completed 6-month industrial training in Android development."
        }
      ]
    },
    "contact": {
      "enabled": true,
      "title": "Contact",
      "email": "connect.naganithin@gmail.com",
      "phone": "+91 9398945849",
      "location": "Sangareddy, India",
      "icon": "phone"
    },
    "social": {
      "enabled": true,
      "items": [
        {
          "platform": "LinkedIn",
          "url": "https://linkedin.com/in/nithintalks",
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
    "copyright": "© 2024 Kollipara Yuvanaga Nithin. All rights reserved."
  }
};
