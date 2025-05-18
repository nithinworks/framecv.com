
import React from "react";
import { usePortfolio } from "@/context/PortfolioContext";

const PortfolioPreview: React.FC = () => {
  const { portfolioData, currentView, showEditor } = usePortfolio();
  const { settings, sections, navigation, footer } = portfolioData;

  // Function to generate inline styles based on the portfolio settings
  const generateStyles = () => {
    const primaryColor = settings.primaryColor || "#0067c7";
    
    return `
      :root {
        --primary-color: ${primaryColor};
        --primary-color-dark: ${primaryColor}dd;
        --primary-color-light: ${primaryColor}22;
      }
      
      .portfolio-preview {
        font-family: 'Inter', sans-serif;
        color: #333;
      }
      
      .portfolio-header {
        background-color: white;
        border-bottom: 1px solid #eee;
      }
      
      .portfolio-button-primary {
        background-color: var(--primary-color);
        color: white;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .portfolio-button-primary:hover {
        background-color: var(--primary-color-dark);
      }
      
      .portfolio-button-secondary {
        background-color: white;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .portfolio-button-secondary:hover {
        background-color: var(--primary-color-light);
      }

      .section-title-underline {
        position: relative;
      }
      
      .section-title-underline::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -10px;
        height: 4px;
        width: 60px;
        background-color: var(--primary-color);
      }
      
      .portfolio-tag {
        background-color: var(--primary-color-light);
        color: var(--primary-color);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
    `;
  };

  return (
    <div className={`portfolio-preview-container ${showEditor ? "ml-80" : ""} transition-all duration-300`}>
      <style>{generateStyles()}</style>
      
      <div className="portfolio-preview">
        <div className={`mx-auto transition-all duration-300 overflow-hidden bg-white ${
          currentView === "mobile" ? "max-w-[360px] border-x border-gray-300 shadow-lg rounded-t-lg" : ""
        }`}>
          {/* Portfolio Navigation */}
          <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="font-bold text-lg text-gray-800">{settings.name}</h1>
              </div>
              <nav className={`${currentView === "mobile" ? "hidden" : "flex"} space-x-6`}>
                {navigation.items.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.url} 
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
              {currentView === "mobile" && (
                <button className="text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>
          </header>

          {/* Hero Section with updated styling to match template */}
          {sections.hero.enabled && (
            <section className="bg-white py-16 lg:py-24">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="md:w-1/2 md:pr-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">{settings.name}</h1>
                    <h2 className="text-xl md:text-2xl text-gray-600 mb-6">{settings.title}</h2>
                    <p className="text-gray-600 mb-8 max-w-lg">{settings.summary}</p>
                    <div className="flex flex-wrap gap-4">
                      {sections.hero.ctaButtons.map((button, index) => (
                        <a 
                          key={index}
                          href={button.url}
                          className={button.isPrimary 
                            ? "px-6 py-3 rounded text-white bg-blue-600 hover:bg-blue-700 transition"
                            : "px-6 py-3 rounded border border-gray-400 text-blue-600 hover:bg-gray-50 transition"}
                        >
                          {button.text}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                    <div className="rounded-full overflow-hidden border-4 border-white shadow-xl w-64 h-64">
                      <img 
                        src={settings.profileImage} 
                        alt={settings.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* About Section */}
          {sections.about.enabled && (
            <section id="about" className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold section-title-underline mb-12">{sections.about.title}</h2>
                <div className="grid md:grid-cols-5 gap-12">
                  <div className="md:col-span-3">
                    <p className="text-gray-700">{sections.about.content}</p>
                  </div>
                  {sections.about.skills.enabled && (
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">{sections.about.skills.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {sections.about.skills.items.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Projects Section */}
          {sections.projects.enabled && (
            <section id="projects" className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold section-title-underline mb-12">{sections.projects.title}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sections.projects.items.map((project, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                      {project.previewUrl !== "#" && (
                        <a 
                          href={project.previewUrl} 
                          className="text-blue-600 font-medium hover:underline"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Experience Section */}
          {sections.experience.enabled && (
            <section id="experience" className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold section-title-underline mb-12">{sections.experience.title}</h2>
                <div className="space-y-8">
                  {sections.experience.items.map((experience, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6 py-2">
                      <div className="flex flex-col md:flex-row md:justify-between mb-2">
                        <h3 className="text-xl font-semibold">{experience.position}</h3>
                        <span className="text-gray-500">{experience.period}</span>
                      </div>
                      <p className="text-blue-600 mb-2">{experience.company}</p>
                      <p className="text-gray-600">{experience.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Education Section */}
          {sections.education.enabled && (
            <section id="education" className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold section-title-underline mb-12">{sections.education.title}</h2>
                <div className="space-y-8">
                  {sections.education.items.map((education, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6 py-2">
                      <div className="flex flex-col md:flex-row md:justify-between mb-2">
                        <h3 className="text-xl font-semibold">{education.degree}</h3>
                        <span className="text-gray-500">{education.period}</span>
                      </div>
                      <p className="text-blue-600 mb-2">{education.institution}</p>
                      {education.description && <p className="text-gray-600">{education.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          {sections.contact.enabled && (
            <section id="contact" className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold section-title-underline mb-12">{sections.contact.title}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Email</h3>
                    <a href={`mailto:${sections.contact.email}`} className="text-blue-600 hover:underline">
                      {sections.contact.email}
                    </a>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <a href={`tel:${sections.contact.phone}`} className="text-blue-600 hover:underline">
                      {sections.contact.phone}
                    </a>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p>{sections.contact.location}</p>
                  </div>
                </div>
                
                {sections.social.enabled && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Connect with me</h3>
                    <div className="flex space-x-4">
                      {sections.social.items.map((social, index) => (
                        <a 
                          key={index}
                          href={social.url} 
                          className="text-gray-600 hover:text-blue-600 transition"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {social.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          {footer.enabled && (
            <footer className="bg-gray-100 text-gray-700 py-8">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p>{footer.copyright}</p>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
