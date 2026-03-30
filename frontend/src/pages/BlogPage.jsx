import { useEffect, useState } from "react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/blogs`)
      .then((res) => res.json())
      .then(setBlogs);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <div key={b._id} className="bg-white rounded-xl shadow p-4">
            {b.image && (
              <img src={b.image} className="rounded-xl mb-3" />
            )}
            <h2 className="text-xl font-bold">{b.title}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {b.content.slice(0, 100)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}