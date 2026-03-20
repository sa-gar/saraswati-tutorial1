import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link to="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          Home
        </Link>
        <Link to="/admin" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          Admin
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}