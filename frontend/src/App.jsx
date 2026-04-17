import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ParentEnquiryForm from "./pages/ParentEnquiryForm";
import BlogPage from "./pages/BlogPage";
import BlogDetail from "./pages/BlogDetail";
import ThankYou from "./pages/ThankYou";
import TutorRegistration from "./pages/TutorRegistration";
// Blog separate system
import BlogLogin from "./pages/BlogLogin";
import AdminBlogEditor from "./pages/AdminBlogEditor";
import CategoryPage from "./pages/CategoryPage";
import CoursePage from "./pages/CoursePage";

// 🔐 Admin Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
}

// 🔐 Blog Editor Protected Route
function BlogProtectedRoute({ children }) {
  const token = localStorage.getItem("blogEditorToken");
  return token ? children : <Navigate to="/blog-login" replace />;
}

export default function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-slate-50">
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/parent-enquiry" element={<ParentEnquiryForm />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/tutor-register" element={<TutorRegistration />} />
          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Blog Editor Login */}
          <Route path="/blog-login" element={<BlogLogin />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Blog Editor Page (separate system) */}
          <Route
            path="/admin/blogs"
            element={
              <BlogProtectedRoute>
                <AdminBlogEditor />
              </BlogProtectedRoute>
            }
          />
          
          <Route path="/tutors/:category" element={<CategoryPage />} />
          <Route path="/course/:slug" element={<CoursePage />} />

          {/* <Route path="*" element={<Navigate to="/" />} /> */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </HelmetProvider>
  );
}