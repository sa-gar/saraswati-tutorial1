import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function AdminBlogEditor() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleBlogLogout = () => {
    localStorage.removeItem("blogEditorToken");
    localStorage.removeItem("blogEditorEmail");
    navigate("/blog-login");
  };

  useEffect(() => {
    fetch(`${API_BASE}/blogs`)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Blog fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Editor</h1>
          <p className="text-slate-600">Separate blog editor panel</p>
        </div>

        <button
          onClick={handleBlogLogout}
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        {loading ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="rounded-xl border p-4"
              >
                <h2 className="text-xl font-bold">{blog.title}</h2>
                <p className="text-sm text-slate-500">
                  {blog.author || "Admin"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}