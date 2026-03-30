import { useEffect, useState } from "react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/blogs`)
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Blog fetch error:", err));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {blogs.map((blog) => (
          <div key={blog._id} className="rounded-xl bg-white p-4 shadow">
            {blog.image ? (
              <img
                src={blog.image}
                alt={blog.title}
                className="mb-3 h-48 w-full rounded-xl object-cover"
              />
            ) : null}

            <h2 className="text-xl font-bold">{blog.title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {blog.content.slice(0, 120)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}