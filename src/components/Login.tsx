// export default Login;
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { LogIn, UserPlus, Github } from "lucide-react";
import { API_BASE_URL } from "../utils/api";

interface LoginProps {
  defaultMode?: "login" | "signup";
}

const Login: React.FC<LoginProps> = ({ defaultMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean;
    message: string;
  }>({ checking: false, available: true, message: "" });

  const { login, register } = useAuth();
  const { success, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(email, password);
        success("Welcome Back!", "Successfully logged in to your account");
      } else {
        await register(email, password, username);
        success(
          "Account Created!",
          "Your account has been created successfully"
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      showError("Authentication Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setUsername("");
    setPassword("");
    setUsernameStatus({ checking: false, available: true, message: "" });
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: true, message: "" });
      return;
    }

    setUsernameStatus({ checking: true, available: true, message: "" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/check-username/${username}`
      );
      const data = await response.json();

      setUsernameStatus({
        checking: false,
        available: data.available,
        message: data.message,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: true,
        message: "Could not check username availability",
      });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-white/20 transform transition-all duration-300 hover:scale-105">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full">
            <Github className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          GitHub Analyzer
        </h1>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          Visualize and analyze GitHub repositories with AI
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-white/10 rounded-lg p-1 mb-6">
        <button
          onClick={() => !isLogin && handleModeSwitch()}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-300 ${
            isLogin
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </button>
        <button
          onClick={() => isLogin && handleModeSwitch()}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-300 ${
            !isLogin
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 transition-all duration-300"
      >
        {/* Username field - only show for signup */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            !isLogin
              ? "opacity-100 max-h-20 transform translate-y-0"
              : "opacity-0 max-h-0 transform -translate-y-4 pointer-events-none"
          }`}
        >
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300 mb-2 transition-colors"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            className={`w-full px-4 py-3 rounded-lg bg-white/10 border transition-all duration-200 hover:bg-white/15 focus-ring ${
              usernameStatus.checking
                ? "border-yellow-500/50"
                : usernameStatus.available && username.length >= 3
                ? "border-green-500/50"
                : !usernameStatus.available && username.length >= 3
                ? "border-red-500/50"
                : "border-white/20"
            } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
            placeholder="Enter your username"
            required={!isLogin}
          />
          {username.length >= 3 && (
            <div
              className={`text-xs mt-1 ${
                usernameStatus.checking
                  ? "text-yellow-400"
                  : usernameStatus.available
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {usernameStatus.checking ? (
                <span>Checking availability...</span>
              ) : (
                usernameStatus.message
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2 transition-colors"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:bg-white/15 focus-ring"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-2 transition-colors"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:bg-white/15 focus-ring"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm animate-pulse text-overflow-safe">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (!isLogin && (!usernameStatus.available || usernameStatus.checking))
          }
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 focus-ring"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? (
                <LogIn className="w-5 h-5 mr-2" />
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              {isLogin ? "Sign In" : "Sign Up"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
