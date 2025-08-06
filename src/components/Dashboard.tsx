import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import RepoInput from "./RepoInput";
import FileTreeVisualization from "./FileTreeVisualization";
import CodeAnalysisPanel from "./CodeAnalysisPanel";
import { LogOut, Github, User, Trash2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  download_url?: string;
  children?: FileNode[];
}

interface Repository {
  id: number;
  repo_url: string;
  repo_data: FileNode;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { error: showError, success } = useToast();
  const [currentRepo, setCurrentRepo] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    content: string;
    name: string;
    path: string;
  } | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [deletingRepo, setDeletingRepo] = useState<number | null>(null);
  const [showAllRepositories, setShowAllRepositories] = useState(false);

  // Calculate which repositories to show
  const displayedRepositories = showAllRepositories
    ? repositories
    : repositories.slice(0, 5);
  const hasMoreRepositories = repositories.length > 5;

  useEffect(() => {
    // Add a small delay to ensure login process completes
    const timer = setTimeout(() => {
      fetchRepositories();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const fetchRepositories = async () => {
    setRepositoriesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/github/repositories`);
      setRepositories(response.data.repositories || []);
      // Reset view to show first 5 when repositories change
      setShowAllRepositories(false);
    } catch (error: any) {
      // Handle different error cases appropriately
      if (error.response?.status === 500) {
        // Server error - show toast
        showError(
          "Server Error",
          "Could not fetch your repositories due to server error"
        );
      } else if (error.response?.status === 401) {
        // Unauthorized - might be expected for new users, don't show toast
        console.log("User not authorized to fetch repositories yet");
      } else if (error.response?.status === 404) {
        // Not found - might be expected for new users, don't show toast
        console.log("No repositories endpoint found");
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ERR_NETWORK"
      ) {
        // Network error - show toast
        showError(
          "Network Error",
          "Could not connect to server. Please check your connection."
        );
      } else {
        // Other errors - log but don't show toast to avoid spam
        console.log(
          "Repository fetch error:",
          error.response?.status || error.message
        );
      }
      // Always set empty array to prevent undefined errors
      setRepositories([]);
    } finally {
      setRepositoriesLoading(false);
    }
  };

  const handleRepoAnalyzed = (fileTree: FileNode) => {
    setCurrentRepo(fileTree);
    fetchRepositories(); // Refresh the list
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.type !== "file" || !file.download_url) return;
    await loadFileContent(file);
  };

  const loadFileContent = async (file: FileNode) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/github/file-content`, {
        params: { url: file.download_url },
        timeout: 30000, // 30 second timeout for large files
      });

      // Check if the content is too large
      const content = response.data.content;
      if (content && content.length > 1000000) {
        // 1MB limit
        setSelectedFile({
          content: `File is too large to display (${(
            content.length /
            1024 /
            1024
          ).toFixed(2)} MB).\n\nFirst 50,000 characters:\n\n${content.substring(
            0,
            50000
          )}...`,
          name: file.name,
          path: file.path || file.name,
        });
      } else {
        setSelectedFile({
          content: content,
          name: file.name,
          path: file.path || file.name,
        });
      }
    } catch (error: any) {
      console.error("File load error:", error);

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        showError(
          "File Load Timeout",
          "The file is too large or the server is taking too long to respond. Try a smaller file."
        );
      } else if (error.response?.status === 413) {
        showError(
          "File Too Large",
          "This file is too large to load. Try a smaller file."
        );
      } else {
        showError(
          "File Load Error",
          "Could not load file content. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRepository = (repo: Repository) => {
    setCurrentRepo(repo.repo_data);
    setSelectedFile(null);
  };

  const handleDeleteRepository = async (
    repoId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent loading the repository

    if (
      !confirm(
        "Are you sure you want to delete this repository? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingRepo(repoId);

    try {
      await axios.delete(`${API_BASE_URL}/github/repositories/${repoId}`);

      // Remove from local state
      setRepositories((prev) => prev.filter((repo) => repo.id !== repoId));

      // If the deleted repo was currently loaded, clear it
      if (
        currentRepo &&
        repositories.find((repo) => repo.id === repoId)?.repo_data ===
          currentRepo
      ) {
        setCurrentRepo(null);
        setSelectedFile(null);
      }

      success("Repository Deleted", "Repository has been successfully deleted");
    } catch (error: any) {
      console.error("Delete repository error:", error);
      showError(
        "Delete Failed",
        "Failed to delete repository. Please try again."
      );
    } finally {
      setDeletingRepo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-40 backdrop-blur-sm bg-gray-800/95">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center min-w-0">
            <div className="p-2 bg-blue-500/20 rounded-lg mr-3 flex-shrink-0">
              <Github className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                GitHub Repository Analyzer
              </h1>
              <span className="hidden sm:inline-block mt-1 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                Powered by Gemini AI
              </span>
            </div>
            <span className="sm:hidden ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full flex-shrink-0">
              Powered by Gemini AI
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center text-gray-300">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm truncate max-w-32 lg:max-w-none">
                {user?.username ? user.username : user?.email}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                success("Logged Out", "You have been successfully logged out");
              }}
              className="flex items-center px-2 sm:px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 sm:p-6 overflow-y-auto max-h-96 lg:max-h-none lg:min-h-0 scrollbar-thin">
          <RepoInput onRepoAnalyzed={handleRepoAnalyzed} />

          {repositoriesLoading ? (
            <div className="mt-6 lg:mt-8">
              <h3 className="text-base lg:text-lg font-semibold text-gray-300 mb-4">
                Recent Repositories
              </h3>
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-sm text-gray-400">
                  Loading repositories...
                </span>
              </div>
            </div>
          ) : repositories.length > 0 ? (
            <div className="mt-6 lg:mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base lg:text-lg font-semibold text-gray-300">
                  Recent Repositories
                </h3>
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
                  {displayedRepositories.length} of {repositories.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 transition-all duration-300">
                {displayedRepositories.map((repo) => (
                  <div key={repo.id} className="relative group">
                    <button
                      onClick={() => loadRepository(repo)}
                      className="w-full text-left p-3 sm:p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 border border-gray-600 hover:border-gray-500 focus-ring pr-12"
                    >
                      <div className="text-sm font-medium text-white truncate mb-1">
                        {repo.repo_url.split("/").slice(-2).join("/")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(repo.created_at).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      onClick={(e) => handleDeleteRepository(repo.id, e)}
                      disabled={deletingRepo === repo.id}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                      title="Delete repository"
                    >
                      {deletingRepo === repo.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* View More/Less Button */}
              {hasMoreRepositories && (
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <button
                    onClick={() => setShowAllRepositories(!showAllRepositories)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all duration-200 group"
                  >
                    <span className="mr-2">
                      {showAllRepositories
                        ? "Show Less"
                        : `View ${repositories.length - 5} More`}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showAllRepositories ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Show message when all repositories are displayed */}
              {!hasMoreRepositories && repositories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <div className="text-center text-xs text-gray-500">
                    All {repositories.length} repositories shown
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 lg:mt-8">
              <h3 className="text-base lg:text-lg font-semibold text-gray-300 mb-4">
                Recent Repositories
              </h3>
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">
                  No repositories analyzed yet. Start by analyzing a repository
                  above!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Flexible Layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* File Tree and AI Panel Container */}
          <div className="flex-1 flex flex-col xl:flex-row min-h-0">
            {/* File Tree Visualization - Flexible Width */}
            <div
              className={`flex-1 p-4 sm:p-6 min-h-96 xl:min-h-0 overflow-hidden transition-all duration-300 ${
                selectedFile ? "xl:w-1/2" : "xl:w-full"
              }`}
            >
              {currentRepo ? (
                <FileTreeVisualization
                  data={currentRepo}
                  onFileSelect={handleFileSelect}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-96">
                  <div className="text-center text-gray-400 px-4">
                    <div className="p-4 bg-gray-800 rounded-full mx-auto mb-4 w-fit">
                      <Github className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      No Repository Selected
                    </h3>
                    <p className="text-sm sm:text-base max-w-md mx-auto text-overflow-safe">
                      Enter a GitHub repository URL to get started
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Code Analysis Panel - Flexible Width */}
            {selectedFile && (
              <div className="xl:w-1/2 border-t xl:border-t-0 xl:border-l border-gray-700">
                <CodeAnalysisPanel
                  file={selectedFile}
                  onClose={() => setSelectedFile(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 flex items-center max-w-sm w-full mx-4">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-sm sm:text-base">
              Loading file content...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
