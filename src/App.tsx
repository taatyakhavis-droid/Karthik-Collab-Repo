import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/app/App";
import AdminDashboard from "./pages/admin/app/Dashboard";
import AdminEditor from "./pages/admin/app/Editor";
import AdminCategories from "./pages/admin/app/Categories";
import Post from "./pages/post/app/App";
import Login from "./pages/login/app/App";
import { supabase } from "./lib/supabase";
import "./index.css";

/**
 * ProtectedRoute — blocks access to admin pages for anyone who is not
 * authenticated as the admin. Uses Supabase's onAuthStateChange so the
 * session is always in sync. Renders a neutral spinner while resolving;
 * never hints that an admin panel exists to unauthenticated visitors.
 */
const ADMIN_EMAIL = "admin@mostlyindia.in";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    // Check current session immediately
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    });

    // Keep in sync with auth state changes (logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FBDE06] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login — does NOT expose /admin path to the visitor
  if (status === "denied") return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<Post />} />
          <Route path="/login" element={<Login />} />

          {/* ── Admin (protected) ── */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/new" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/edit/:slug" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />

          {/* ── Catch-all & legacy ── */}
          <Route path="/post/:id" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
