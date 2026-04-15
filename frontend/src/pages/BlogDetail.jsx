
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  User,
  BookOpen,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function getReadTime(content = "") {
  const words = stripHtml(content).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateString) {
  if (!dateString) return "Recently published";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently published";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCategory(blog) {
  if (blog?.category) return blog.category;
  const title = `${blog?.title || ""} ${stripHtml(blog?.content || "")}`.toLowerCase();

  if (title.includes("math")) return "Mathematics";
  if (title.includes("science") || title.includes("physics") || title.includes("chemistry") || title.includes("biology")) return "Science";
  if (title.includes("english") || title.includes("language")) return "Languages";
  if (title.includes("exam") || title.includes("neet") || title.includes("jee")) return "Exams";
  if (title.includes("parent")) return "Parenting";
  if (title.includes("tutor") || title.includes("teaching")) return "Tutoring";
  return "Study Tips";
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/blogs/slug/${slug}`).then((res) => res.json()),
      fetch(`${API_BASE}/blogs`).then((res) => res.json()),
    ])
      .then(([blogData, allData]) => {
        setBlog(blogData);
        setAllBlogs(Array.isArray(allData) ? allData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return allBlogs
      .filter((item) => item.slug !== blog.slug)
      .slice(0, 3);
  }, [blog, allBlogs]);

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          Loading article...
        </div>
      </div>
    );
  }

  if (!blog || blog.message) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Blog not found</h1>
          <p className="mt-2 text-slate-600">
            The article you are looking for does not exist.
          </p>
          <Link
            to="/blogs"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <article className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
          {blog.image ? (
            <img
              src={blog.image}
              alt={blog.title}
              loading="lazy"
              className="h-[280px] w-full object-cover md:h-[420px]"
            />
          ) : null}

          <div className="p-6 md:p-10">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {getCategory(blog)}
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              {blog.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{blog.author || "Admin"}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{getReadTime(blog.content)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Share2 className="h-4 w-4" />
                Share
              </span>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Facebook className="h-4 w-4" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Twitter className="h-4 w-4" />
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Linkedin className="h-4 w-4" />
              </a>

              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <div
              className="mt-10 max-w-none text-slate-700 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-5 [&_p]:leading-8 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {relatedBlogs.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Related Articles
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedBlogs.map((item) => (
                <Link
                  key={item._id}
                  to={`/blogs/${item.slug}`}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="h-44 bg-slate-100" />
                  )}

                  <div className="p-5">
                    <p className="text-xs font-medium text-slate-500">
                      {getCategory(item)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {stripHtml(item.content).slice(0, 110)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}