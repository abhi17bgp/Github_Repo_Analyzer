import React, { useState, useRef } from "react";
import { Search, Github, X } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  download_url?: string;
  children?: FileNode[];
}

interface RepoInputProps {
  onRepoAnalyzed: (fileTree: FileNode) => void;
}

const RepoInput: React.FC<RepoInputProps> = ({ onRepoAnalyzed }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxDepth, setMaxDepth] = useState(15);
  const [progress, setProgress] = useState(0);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [currentPath, setCurrentPath] = useState("");
  const { success, error: showError } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError("");
    setProgress(0);
    setCurrentDepth(0);
    setCurrentPath("");

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Start progress polling
    progressIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/github/analyze/progress`
        );
        if (response.data.active) {
          setProgress(response.data.progress);
          setCurrentDepth(response.data.currentDepth);
          setCurrentPath(response.data.currentPath);
        }
      } catch (error) {
        console.error("Failed to get progress:", error);
      }
    }, 1000);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/github/analyze`,
        {
          repoUrl: repoUrl.trim(),
          maxDepth: maxDepth,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      onRepoAnalyzed(response.data.fileTree);
      success(
        "Repository Analyzed!",
        "Successfully loaded repository structure"
      );
      setRepoUrl("");
    } catch (err: any) {
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        setError("Analysis cancelled");
        return;
      }

      const errorMessage =
        err.response?.data?.message || "Failed to analyze repository";
      setError(errorMessage);
      showError("Analysis Failed", errorMessage);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentDepth(0);
      setCurrentPath("");
      abortControllerRef.current = null;

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleStopAnalysis = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      // Also notify the server to cancel the analysis
      await axios.post(`${API_BASE_URL}/github/analyze/cancel`, {
        analysisId: Date.now().toString(),
      });
    } catch (error) {
      console.error("Failed to notify server of cancellation:", error);
    }

    setLoading(false);
    setProgress(0);
    setCurrentDepth(0);
    setCurrentPath("");
    setError("Analysis cancelled");

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base lg:text-lg font-semibold text-gray-300 mb-3">
          Analyze Repository
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full pl-9 sm:pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-600 text-sm sm:text-base focus-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Analysis Depth: {maxDepth} levels
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="5"
                max="20"
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                {maxDepth}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shallow (5)</span>
              <span>Deep (20)</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleStopAnalysis}
                  className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base focus-ring"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Stop Analysis
                </button>
                <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-gray-600 text-white font-medium text-sm sm:text-base">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing...
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress: {progress}%</span>
                  <span>
                    Depth: {currentDepth}/{maxDepth}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {currentPath && (
                  <div className="text-xs text-gray-500 truncate">
                    Current: {currentPath}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!repoUrl.trim()}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base focus-ring"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Analyze Repository
            </button>
          )}
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm animate-pulse text-overflow-safe">
            {error}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 leading-relaxed bg-gray-800/50 rounded-lg p-3">
        <p className="mb-2">
          <strong>Supported formats:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-gray-500">
          <li>https://github.com/user/repo</li>
          <li>github.com/user/repo</li>
        </ul>
        <p className="mt-3 text-gray-500 text-xs">
          Only public repositories are supported. Private repos require
          authentication.
        </p>
      </div>
    </div>
  );
};

export default RepoInput;
