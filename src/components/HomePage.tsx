import React from "react";
import {
  Github,
  BarChart3,
  Brain,
  FileText,
  Zap,
  Users,
  ArrowRight,
  Play,
  Shield,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const HomePage: React.FC = () => {
  // Function to handle login button clicks
  const handleLoginClick = () => {
    // Since the login modal is handled by the Navbar component,
    // we'll trigger it by dispatching a custom event
    const event = new CustomEvent("openLoginModal");
    window.dispatchEvent(event);
  };

  const features = [
    {
      icon: BarChart3,
      title: "Visual Repository Analysis",
      description:
        "Interactive visualizations of your repository structure with detailed dependency mapping and file relationships.",
      color: "blue",
    },
    {
      icon: Brain,
      title: "AI-Powered Code Insights",
      description:
        "Intelligent analysis and summarization of your code files using advanced AI with context-aware insights.",
      color: "green",
    },
    {
      icon: FileText,
      title: "Smart Documentation",
      description:
        "Generate comprehensive documentation and insights for your projects with automated code analysis.",
      color: "purple",
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description:
        "Get instant insights and analysis with our optimized processing engine and real-time updates.",
      color: "orange",
    },
  ];

  const stats = [
    { number: "100+", label: "Active Users", icon: Users },
    { number: "500+", label: "Repositories Analyzed", icon: Github },
    { number: "95.9%", label: "Uptime", icon: Shield },
    { number: "<5s", label: "Average Response Time", icon: Zap },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer",
      company: "TechCorp",
      content:
        "GitHub Analyzer has completely transformed how we understand our codebase. The AI insights are incredibly accurate.",
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "Engineering Manager",
      company: "StartupXYZ",
      content:
        "The visualization features help our team make better architectural decisions. Highly recommended!",
      avatar: "MR",
    },
    {
      name: "Emily Watson",
      role: "Full Stack Developer",
      company: "DevStudio",
      content:
        "Finally, a tool that makes repository analysis actually enjoyable and insightful.",
      avatar: "EW",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500/20 text-blue-400 border-blue-400/30",
      green: "bg-green-500/20 text-green-400 border-green-400/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-400/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-400/30",
      red: "bg-red-500/20 text-red-400 border-red-400/30",
      indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section id="Home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                    <Github className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-blue-400 text-sm font-medium">
                    GitHub Analyzer v2.0
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Analyze Your GitHub Repos
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Like Never Before
                  </span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  Unlock the full potential of your repositories with AI-powered
                  insights, visualizations, and intelligent code analysis.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Get Started</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Development
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to understand, analyze, and improve your
              GitHub repositories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300 group"
              >
                <div
                  className={`p-3 rounded-lg border ${getColorClasses(
                    feature.color
                  )} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="working" className="py-20 bg-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Connect Repository
              </h3>
              <p className="text-gray-400">
                Simply paste your GitHub repository URL or connect via OAuth
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI Analysis
              </h3>
              <p className="text-gray-400">
                Our AI analyzes your codebase and generates comprehensive
                insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Get Insights
              </h3>
              <p className="text-gray-400">
                View visualizations, documentation, and actionable
                recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Repository Analysis?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of developers who trust GitHub Analyzer for their
            repository insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLoginClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>Start Analyzing Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
