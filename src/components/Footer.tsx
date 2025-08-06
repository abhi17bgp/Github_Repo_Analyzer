import React from "react";
import {
  Github,
  Linkedin,
  Mail,
  Zap,
  PieChart,
  WorkflowIcon,
  Home,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Home", href: "#Home", icon: Home },
        { name: "Features", href: "#features", icon: Zap },
        { name: "Stats", href: "#stats", icon: PieChart },
        { name: "Working", href: "#working", icon: WorkflowIcon },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/abhi17bgp/Github_Repo_Analyzer/",
      icon: Github,
    },

    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/abhishek-anand-626a13288/",
      icon: Linkedin,
    },
    { name: "Email", href: "mailto:iabhishekbgp21.com", icon: Mail },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 ">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                <Github className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-white">
                GitHub Analyzer
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Unlock the full potential of your repositories with AI-powered
              insights, visualizations, and intelligent code analysis.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 ">
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
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>
                © {currentYear} GitHub Analyzer Made by Abhishek with ❤️ for
                developers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
