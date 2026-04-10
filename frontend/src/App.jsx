import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ParentEnquiryForm from "./pages/ParentEnquiryForm";
import BlogPage from "./pages/BlogPage";
import ThankYou from "./pages/ThankYou";
import BlogDetail from "./pages/BlogDetail";
import BlogLogin from "./pages/BlogLogin";
import AdminBlogEditor from "./pages/AdminBlogEditor";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
}

function BlogProtectedRoute({ children }) {
  const token = localStorage.getItem("blogEditorToken");
  return token ? children : <Navigate to="/blog-login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/blog-login" element={<BlogLogin />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/parent-enquiry" element={<ParentEnquiryForm />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/blogs"
          element={
            <BlogProtectedRoute>
              <AdminBlogEditor />
            </BlogProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}