import { Routes, Route, Link, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ParentEnquiryForm from "./pages/ParentEnquiryForm";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/" className="text-sm font-medium text-slate-700">Home</Link>
        <Link to="/admin" className="text-sm font-medium text-slate-700">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
          
        />
        <Route path="/parent-enquiry" element={<ParentEnquiryForm />} />
      </Routes>
    </div>
  );
}