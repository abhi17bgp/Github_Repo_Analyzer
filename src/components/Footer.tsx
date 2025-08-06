import React from "react";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Code, 
  BarChart3, 
  Brain, 
  FileText, 
  Zap,
  Heart,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  // Function to handle login button clicks
  const handleLoginClick = () => {
    // Since the login modal is handled by the Navbar component,
    // we'll trigger it by dispatching a custom event
    const event = new CustomEvent('openLoginModal');
    window.dispatchEvent(event);
  };

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features", icon: BarChart3 },
        { name: "AI Analysis", href: "#ai-analysis", icon: Brain },
        { name: "Documentation", href: "#docs", icon: FileText },
        { name: "Performance", href: "#performance", icon: Zap },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs", icon: FileText },
        { name: "API Reference", href: "#api", icon: Code },
        { name: "Tutorials", href: "#tutorials", icon: Code },
        { name: "Blog", href: "#blog", icon: FileText },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about", icon: ExternalLink },
        { name: "Careers", href: "#careers", icon: ExternalLink },
        { name: "Privacy", href: "#privacy", icon: ExternalLink },
        { name: "Terms", href: "#terms", icon: ExternalLink },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#help", icon: ExternalLink },
        { name: "Contact", href: "#contact", icon: Mail },
        { name: "Status", href: "#status", icon: ExternalLink },
        { name: "Community", href: "#community", icon: ExternalLink },
      ],
    },
  ];

  const socialLinks = [
    { name: "GitHub", href: "https://github.com", icon: Github },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { name: "Email", href: "mailto:contact@githubanalyzer.com", icon: Mail },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                <Github className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-white">GitHub Analyzer</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Unlock the full potential of your repositories with AI-powered insights, 
              visualizations, and intelligent code analysis.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all duration-200 group"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group text-sm"
                    >
                      <link.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Stay updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest updates on new features and improvements.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button 
                onClick={handleLoginClick}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© {currentYear} GitHub Analyzer. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for developers.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* VSCode-style Status Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready</span>
              </span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span>React</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>UTF-8</span>
              <span>•</span>
              <span>LF</span>
              <span>•</span>
              <span>TypeScript React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 