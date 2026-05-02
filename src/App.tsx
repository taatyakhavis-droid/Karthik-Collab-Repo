import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/app/App";
import AdminDashboard from "./pages/admin/app/Dashboard";
import AdminEditor from "./pages/admin/app/Editor";
import AdminCategories from "./pages/admin/app/Categories";
import Post from "./pages/post/app/App";
import Login from "./pages/login/app/App";
import { supabase } from "./lib/supabase";
import "./index.css";

const ADMIN_EMAIL = "admin@mostlyindia.in";

/**
 * Renders identical 404 for both unknown pages AND unauthenticated admin access.
 * This makes /console indistinguishable from any non-existent route.
 */
function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center gap-4">
      <h1 className="font-archivo text-7xl text-gray-800 uppercase select-none">404</h1>
      <p className="text-gray-600 text-xs uppercase tracking-[0.3em]">This page doesn't exist</p>
      <a href="/" className="text-gray-700 hover:text-gray-500 text-xs uppercase tracking-widest mt-2">← Return Home</a>
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setStatus(user?.email === ADMIN_EMAIL ? "allowed" : "denied");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session?.user?.email === ADMIN_EMAIL ? "allowed" : "denied");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FBDE06] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Show same 404 as any unknown page — admin route is not discoverable
  if (status === "denied") return <NotFound />;

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

          {/* ── Admin login at non-obvious path ── */}
          <Route path="/console/auth" element={<Login />} />

          {/* ── Admin panel at /console instead of /admin ── */}
          <Route path="/console" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/console/new" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/console/edit/:slug" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/console/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />

          {/* ── Every other path: generic 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}
