// src/pages/LoginPage.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { googleLogin } from "../services/authService";

function LoginPage() {
  const { user, loading } = useAuth();
  console.log("LoginPage rendered", { user, loading });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <p className="text-white">Loading...</p>
    </div>
  );

  // already logged in → go home
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="h-screen flex items-center justify-center bg-[url('/background-image.jpg')] bg-cover bg-center">
      <div className="bg-[#1f2937] rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center gap-6">

        <img src="/chatbot-icon.png" alt="logo" className="w-16 h-16" />

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to ChatBot</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign in to start chatting</p>
        </div>

        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.42 3.09 29.48 1 24 1 14.82 1 7.07 6.48 3.87 14.18l7.08 5.5C12.6 13.02 17.87 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.7c-.55 2.96-2.2 5.47-4.67 7.16l7.18 5.57C43.44 37.28 46.52 31.36 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.95 28.32A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.72-4.32l-7.08-5.5A23.9 23.9 0 0 0 0 24c0 3.86.92 7.5 2.55 10.73l8.4-6.41z"/>
            <path fill="#34A853" d="M24 47c5.48 0 10.08-1.82 13.44-4.93l-7.18-5.57C28.42 37.96 26.3 38.5 24 38.5c-6.13 0-11.4-3.52-12.98-8.18l-8.4 6.41C6.07 44.52 14.3 47 24 47z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-gray-500 text-xs text-center">
          New users are automatically registered on first login.
        </p>

      </div>
    </div>
  );
}

export default LoginPage;