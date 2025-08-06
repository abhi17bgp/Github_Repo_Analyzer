import React, { useState, useEffect, useRef } from "react";
import { X, Brain, Copy, Check, FileText } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { useJsonContent } from "../hooks/useJsonContent";
import { API_BASE_URL } from "../utils/api";

interface CodeAnalysisPanelProps {
  file: {
    content: string;
    name: string;
    path: string;
  };
  onClose: () => void;
}

const CodeAnalysisPanel: React.FC<CodeAnalysisPanelProps> = ({
  file,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "analysis">("editor");
  const [isImageFile, setIsImageFile] = useState(false);
  const { success, error: showError } = useToast();
  const hasShownImageError = useRef(false);
  // Check if file is an image when component mounts
  useEffect(() => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".svg"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const isImage = imageExtensions.includes(`.${fileExtension}`);
    setIsImageFile(isImage);

    if (isImage && !hasShownImageError.current) {
      showError(
        "Unsupported File Type",
        "Image files cannot be opened in the editor"
      );
      hasShownImageError.current = true;
      setActiveTab("analysis"); // Switch to analysis tab which will show the message
    }
  }, [file.name]);

  // Optimize JSON content rendering to prevent re-renders
  const formattedContent = useJsonContent({
    content: file.content,
    fileName: file.name,
  });

  const analyzeCode = async () => {
    if (isImageFile) {
      showError("Unsupported File Type", "Cannot analyze image files");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/analyze-code`, {
        fileContent: formattedContent,
        fileName: file.name,
      });

      setAnalysis(response.data.analysis);
      setActiveTab("analysis");
      success("Analysis Complete!", "AI has analyzed your code successfully");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to analyze code";
      setError(errorMessage);
      showError("Analysis Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      success("Copied!", "Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError("Copy Failed", "Could not copy code to clipboard");
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
      yaml: "yaml",
      yml: "yaml",
    };
    return languageMap[ext || ""] || "text";
  };

  const getLanguageIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      js: "⚡",
      jsx: "⚛️",
      ts: "📘",
      tsx: "📘",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️",
      css: "🎨",
      html: "🌐",
      json: "📄",
      md: "📝",
      yaml: "⚙️",
      yml: "⚙️",
    };
    return iconMap[ext || ""] || "📄";
  };

  const renderLineNumbers = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => (
      <div key={index} className="flex">
        <div className="w-12 text-right pr-4 text-gray-500 text-xs select-none font-mono">
          {index + 1}
        </div>
        <div className="flex-1 text-gray-300 text-xs font-mono">
          {line || "\u00A0"}
        </div>
      </div>
    ));
  };

  const renderAnalysis = (analysis: string) => {
    const lines = analysis.split("\n");
    return lines.map((line, index) => (
      <div key={index} className="flex">
        <div className="w-8 text-right pr-3 text-gray-500 text-xs select-none font-mono">
          {index + 1}
        </div>
        <div className="flex-1 text-gray-300 text-xs font-mono">
          {line || "\u00A0"}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full h-full bg-[#1e1e1e] border-t xl:border-t-0 xl:border-l border-[#3c3c3c] flex flex-col min-h-0">
      {/* VS Code-like Header */}
      <div className="bg-[#2d2d30] border-b border-[#3c3c3c] flex-shrink-0">
        {/* Tab Bar */}
        <div className="flex items-center bg-[#2d2d30] border-b border-[#3c3c3c]">
          <div className="flex items-center space-x-1 px-2 py-1">
            <button
              onClick={() => !isImageFile && setActiveTab("editor")}
              className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors duration-200 flex items-center space-x-2 ${
                activeTab === "editor"
                  ? "bg-[#1e1e1e] text-white border-b-2 border-[#007acc]"
                  : "text-gray-400 hover:text-gray-300 hover:bg-[#3c3c3c]"
              } ${isImageFile ? "cursor-not-allowed opacity-50" : ""}`}
              disabled={isImageFile}
            >
              <span>{getLanguageIcon(file.name)}</span>
              <span>{file.name}</span>
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors duration-200 flex items-center space-x-2 ${
                activeTab === "analysis"
                  ? "bg-[#1e1e1e] text-white border-b-2 border-[#007acc]"
                  : "text-gray-400 hover:text-gray-300 hover:bg-[#3c3c3c]"
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>AI Analysis</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {getLanguage(file.name)}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">{file.path}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors duration-200"
              title="Copy code"
              disabled={isImageFile}
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-[#3c3c3c] transition-colors duration-200"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "editor" ? (
          /* Code Editor */
          <div className="flex-1 overflow-auto bg-[#1e1e1e]">
            <div className="p-4">
              <div className="bg-[#1e1e1e] rounded border border-[#3c3c3c] overflow-hidden">
                <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={analyzeCode}
                      disabled={loading || isImageFile}
                      className="flex items-center space-x-1 px-2 py-1 bg-[#007acc] text-white text-xs rounded hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Brain className="w-3 h-3" />
                      )}
                      <span>{loading ? "Analyzing..." : "Analyze"}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 font-mono text-sm leading-relaxed">
                  {isImageFile ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-[#2d2d30] rounded-full mx-auto mb-4 w-fit">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        Image files cannot be displayed in the editor
                      </p>
                      <p className="text-gray-600 text-xs">
                        This file appears to be an image (.jpg, .jpeg, .png)
                      </p>
                    </div>
                  ) : (
                    renderLineNumbers(formattedContent)
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Panel */
          <div className="flex-1 overflow-auto bg-[#1e1e1e]">
            <div className="p-4">
              <div className="bg-[#1e1e1e] rounded border border-[#3c3c3c] overflow-hidden">
                <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      AI Code Analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => !isImageFile && setActiveTab("editor")}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded transition-colors duration-200"
                      disabled={isImageFile}
                    >
                      Back to Editor
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {isImageFile ? (
                    <div className="mb-4 p-3 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="font-medium">
                          Unsupported File Type
                        </span>
                      </div>
                      Image files (.jpg, .jpeg, .png) cannot be analyzed or
                      displayed in the editor.
                    </div>
                  ) : null}

                  {error && (
                    <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="font-medium">Error</span>
                      </div>
                      {error}
                    </div>
                  )}

                  {analysis ? (
                    <div className="font-mono text-sm leading-relaxed">
                      {renderAnalysis(analysis)}
                    </div>
                  ) : !loading && !error && !isImageFile ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-[#2d2d30] rounded-full mx-auto mb-4 w-fit">
                        <Brain className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        No analysis available
                      </p>
                      <p className="text-gray-600 text-xs">
                        Switch to the editor tab and click "Analyze" to get
                        started
                      </p>
                    </div>
                  ) : null}

                  {loading && (
                    <div className="text-center py-12">
                      <div className="p-4 bg-[#2d2d30] rounded-full mx-auto mb-4 w-fit">
                        <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Analyzing code with AI...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#007acc] text-white text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>{isImageFile ? "Unsupported File Type" : "Ready"}</span>
          <span>•</span>
          <span>{getLanguage(file.name)}</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln {formattedContent.split("\n").length}</span>
          <span>•</span>
          <span>Col 1</span>
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysisPanel;
