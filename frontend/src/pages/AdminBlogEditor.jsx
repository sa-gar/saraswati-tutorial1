import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Image as ImageIcon,
  X,
  ArrowLeft,
  LogOut,
  FileText,
} from "lucide-react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function AdminBlogEditor() {
  const [blogs, setBlogs] = useState([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    image: "",
    author: "Admin",
  });

  const [editingBlog, setEditingBlog] = useState(null);
  const [editBlogForm, setEditBlogForm] = useState({
    title: "",
    content: "",
    image: "",
    author: "Admin",
  });

  const blogEditorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/blogs`);
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const q = blogSearch.toLowerCase();
      return (
        (blog.title || "").toLowerCase().includes(q) ||
        (blog.author || "").toLowerCase().includes(q)
      );
    });
  }, [blogs, blogSearch]);

  const createBlog = async () => {
    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create blog");
        return;
      }

      alert("Blog published successfully");
      setBlogForm({
        title: "",
        content: "",
        image: "",
        author: "Admin",
      });
      setShowPreview(false);
      fetchBlogs();
    } catch (error) {
      console.error(error);
      alert("Failed to create blog");
    }
  };

  const deleteBlog = async (id) => {
    const ok = window.confirm("Delete this blog?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete blog");
        return;
      }

      fetchBlogs();
    } catch (error) {
      console.error(error);
      alert("Failed to delete blog");
    }
  };

  const startEditBlog = (blog) => {
    setEditingBlog(blog);
    setEditBlogForm({
      title: blog.title || "",
      content: blog.content || "",
      image: blog.image || "",
      author: blog.author || "Admin",
    });
  };

  const saveBlogEdit = async () => {
    try {
      const res = await fetch(`${API_BASE}/blogs/${editingBlog._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editBlogForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update blog");
        return;
      }

      alert("Blog updated successfully");
      setEditingBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error(error);
      alert("Failed to update blog");
    }
  };

  const handleBlogImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Image upload failed");
        return;
      }

      if (isEdit) {
        setEditBlogForm((prev) => ({ ...prev, image: data.imageUrl }));
      } else {
        setBlogForm((prev) => ({ ...prev, image: data.imageUrl }));
      }
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Blog Editor</h1>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
                  Content Studio
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  Publish a New Blog
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>

                <button
                  type="button"
                  onClick={createBlog}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />
                  Publish Blog
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Blog Title
                </label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) =>
                    setBlogForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Author Name
                </label>
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={(e) =>
                    setBlogForm((prev) => ({ ...prev, author: e.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Upload Cover Image
                </label>
                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-600">
                  <ImageIcon className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBlogImageUpload(e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {blogForm.image && (
              <div className="mt-5 overflow-hidden rounded-3xl ring-1 ring-slate-200">
                <img
                  src={blogForm.image}
                  alt="Blog cover preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Blog Content
              </label>

              <div className="rounded-3xl bg-white ring-1 ring-slate-200">
                <ReactQuill
                  value={blogForm.content}
                  onChange={(value) =>
                    setBlogForm((prev) => ({ ...prev, content: value }))
                  }
                  modules={blogEditorModules}
                  theme="snow"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-900">Live Preview</h3>
            </div>

            {!showPreview ? (
              <p className="text-slate-500">
                Click Preview to see how your article will appear on the website.
              </p>
            ) : (
              <div className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200">
                {blogForm.image && (
                  <img
                    src={blogForm.image}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h4 className="text-2xl font-bold text-slate-900">
                    {blogForm.title || "Your blog title will appear here"}
                  </h4>

                  <p className="mt-2 text-sm text-slate-500">
                    By {blogForm.author || "Admin"}
                  </p>

                  <div
                    className="mt-5 max-w-none text-slate-700 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html:
                        blogForm.content ||
                        "<p>Your blog content preview will appear here.</p>",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Manage Blogs</h2>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                placeholder="Search blog title or author"
                className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 outline-none"
              />
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-200">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-4 text-slate-600">No blogs found.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200"
                >
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                      No image
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
                      {blog.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      By {blog.author || "Admin"}
                    </p>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {stripHtml(blog.content)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEditBlog(blog)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBlog(blog._id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                      <Link
                        to={`/blogs/${blog.slug || blog._id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Edit Blog</h2>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="rounded-xl border border-slate-300 p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Blog Title
                </label>
                <input
                  type="text"
                  value={editBlogForm.title}
                  onChange={(e) =>
                    setEditBlogForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Author Name
                </label>
                <input
                  type="text"
                  value={editBlogForm.author}
                  onChange={(e) =>
                    setEditBlogForm((prev) => ({ ...prev, author: e.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Change Cover Image
                </label>
                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-600">
                  <ImageIcon className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBlogImageUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {editBlogForm.image && (
              <div className="mt-5 overflow-hidden rounded-3xl ring-1 ring-slate-200">
                <img
                  src={editBlogForm.image}
                  alt="Edit preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Blog Content
              </label>
              <div className="rounded-3xl bg-white ring-1 ring-slate-200">
                <ReactQuill
                  value={editBlogForm.content}
                  onChange={(value) =>
                    setEditBlogForm((prev) => ({ ...prev, content: value }))
                  }
                  modules={blogEditorModules}
                  theme="snow"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveBlogEdit}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}