import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CalendarDays,
  User,
  ArrowRight,
  BookOpen,
  Tag,
} from "lucide-react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

const fallbackCategories = [
  "All",
  "Study Tips",
  "Mathematics",
  "Science",
  "Languages",
  "Exams",
  "Parenting",
  "Tutoring",
];

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
    month: "short",
    year: "numeric",
  });
}

function getExcerpt(content = "", length = 180) {
  const text = stripHtml(content);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

function getCategory(blog) {
  if (blog?.category) return blog.category;

  const title = `${blog?.title || ""} ${stripHtml(blog?.content || "")}`.toLowerCase();

  if (
    title.includes("math") ||
    title.includes("algebra") ||
    title.includes("geometry")
  ) {
    return "Mathematics";
  }

  if (
    title.includes("science") ||
    title.includes("physics") ||
    title.includes("chemistry") ||
    title.includes("biology")
  ) {
    return "Science";
  }

  if (
    title.includes("english") ||
    title.includes("language") ||
    title.includes("grammar")
  ) {
    return "Languages";
  }

  if (
    title.includes("exam") ||
    title.includes("board") ||
    title.includes("neet") ||
    title.includes("jee")
  ) {
    return "Exams";
  }

  if (title.includes("parent")) return "Parenting";
  if (title.includes("tutor") || title.includes("teaching")) return "Tutoring";

  return "Study Tips";
}

function BlogMeta({ blog }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
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

      <div className="flex items-center gap-1.5">
        <Tag className="h-4 w-4" />
        <span>{getCategory(blog)}</span>
      </div>
    </div>
  );
}

function BlogCard({ blog, compact = false }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
      <Link to={`/blogs/${blog.slug || blog._id}`} className="block">
        {blog.image ? (
          <div className={compact ? "h-52 overflow-hidden" : "h-64 overflow-hidden"}>
            <img
              src={blog.image}
              alt={blog.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className={compact ? "h-52 bg-slate-100" : "h-64 bg-slate-100"} />
        )}

        <div className="p-6">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {getCategory(blog)}
          </span>

          <h2
            className={
              compact
                ? "mt-4 text-xl font-bold text-slate-900 group-hover:underline"
                : "mt-4 text-2xl font-bold text-slate-900 group-hover:underline"
            }
          >
            {blog.title}
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            {getExcerpt(blog.content, compact ? 120 : 170)}
          </p>

          <BlogMeta blog={blog} />

          <div className="mt-5 inline-flex items-center gap-2 font-medium text-slate-900">
            Read article
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

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

  const categories = useMemo(() => {
    const fromBlogs = blogs.map(getCategory);
    return ["All", ...new Set([...fallbackCategories.slice(1), ...fromBlogs])];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const q = query.toLowerCase();

      const matchesQuery =
        (blog.title || "").toLowerCase().includes(q) ||
        stripHtml(blog.content || "").toLowerCase().includes(q) ||
        (blog.author || "").toLowerCase().includes(q);

      const matchesCategory =
        category === "All" || getCategory(blog) === category;

      return matchesQuery && matchesCategory;
    });
  }, [blogs, query, category]);

  const featuredBlog = filteredBlogs[0];
  const restBlogs = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog & Insights</h1>
            <p className="text-sm text-slate-500">
              Study tips, exam strategy, tutoring guidance, and parent resources
            </p>
          </div>

          <Link
            to="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-4 md:grid-cols-[1.2fr_220px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blog posts..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            Loading blogs...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">No blogs found</h2>
            <p className="mt-2 text-slate-600">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <>
            {featuredBlog && (
              <section className="mb-12">
                <div className="mb-5 flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                  <span className="text-sm text-slate-500">
                    Latest highlighted article
                  </span>
                </div>

                <article className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="grid gap-0 lg:grid-cols-2">
                    <Link to={`/blogs/${featuredBlog.slug || featuredBlog._id}`} className="block">
                      {featuredBlog.image ? (
                        <img
                          src={featuredBlog.image}
                          alt={featuredBlog.title}
                          loading="lazy"
                          className="h-full min-h-[320px] w-full object-cover"
                        />
                      ) : (
                        <div className="min-h-[320px] bg-slate-100" />
                      )}
                    </Link>

                    <div className="p-8 md:p-10">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getCategory(featuredBlog)}
                      </span>

                      <Link to={`/blogs/${featuredBlog.slug || featuredBlog._id}`}>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl hover:underline">
                          {featuredBlog.title}
                        </h2>
                      </Link>

                      <p className="mt-5 text-base leading-8 text-slate-600">
                        {getExcerpt(featuredBlog.content, 260)}
                      </p>

                      <BlogMeta blog={featuredBlog} />

                      <Link
                        to={`/blogs/${featuredBlog.slug || featuredBlog._id}`}
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white"
                      >
                        Read full article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </section>
            )}

            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">
                  Latest Articles
                </h3>
                <p className="text-sm text-slate-500">
                  {filteredBlogs.length} post{filteredBlogs.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {(restBlogs.length > 0 ? restBlogs : [featuredBlog]).map((blog) => (
                  <BlogCard key={blog._id} blog={blog} compact />
                ))}
              </div>
            </section>

            <section className="mt-14 rounded-[32px] bg-slate-900 p-8 text-white md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h3 className="text-2xl font-bold">Stay updated with learning insights</h3>
                  <p className="mt-2 max-w-2xl text-slate-300">
                    Explore expert guidance on academics, exam preparation, tutoring, and better learning outcomes for students and parents.
                  </p>
                </div>

                <Link
                  to="/parent-enquiry"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 font-medium text-slate-900"
                >
                  Book a Free Demo
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}