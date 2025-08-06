import React, { useState, useEffect } from "react";
import {
  Github,
  Menu,
  X,
  Home,
  Zap,
  User,
  LogIn,
  PieChart,
  WorkflowIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();

  // Listen for custom event to open login modal
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  const navigation = [
    { name: "Home", href: "#Home", icon: Home },
    { name: "Features", href: "#features", icon: Zap },
    { name: "Stats", href: "#stats", icon: PieChart },
    { name: "Working", href: "#working", icon: WorkflowIcon },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-400/30">
                  <Github className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">
                  GitHub Analyzer
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors duration-200" />
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              ))}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openLoginModal}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-3" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={openLoginModal}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                ))}

                <div className="border-t border-gray-800 pt-4 mt-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {user.username}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={openLoginModal}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                      <button
                        onClick={openLoginModal}
                        className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-center font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Get Started</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Sign In to GitHub Analyzer
                </h2>
                <button
                  onClick={closeLoginModal}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Login />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
