import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/app/App";
import Admin from "./pages/admin/app/App";
import Post from "./pages/post/app/App";
import Login from "./pages/login/app/App";
import { authService } from "./services/authService";
import "./index.css";

import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    authService.isAdmin().then(res => setIsAdmin(res));
  }, []);

  if (isAdmin === null) return null;

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/:id" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </div>
    </Router>
  );
}
