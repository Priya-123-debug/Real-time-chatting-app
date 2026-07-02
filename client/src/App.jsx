// src/App.jsx
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <p className="text-white text-lg">Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <div className="bg-[url('/background-image.jpg')] bg-contain bg-center bg-cover">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;