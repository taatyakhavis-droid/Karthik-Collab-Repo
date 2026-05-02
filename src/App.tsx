import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/app/App";
import AdminDashboard from "./pages/admin/app/Dashboard";
import AdminEditor from "./pages/admin/app/Editor";
import AdminCategories from "./pages/admin/app/Categories";
import Post from "./pages/post/app/App";
import Login from "./pages/login/app/App";
import { authService } from "./services/authService";
import "./index.css";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    authService.isAdmin().then(res => setIsAdmin(res));
  }, []);

  if (isAdmin === null) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FBDE06] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<Post />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/new" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/edit/:slug" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
          {/* Legacy redirects */}
          <Route path="/post/:id" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
