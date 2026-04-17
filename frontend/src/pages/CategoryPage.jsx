import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const categoryData = {
  science: {
    title: "Science Tutors in Bangalore",
    description:
      "Find the best science tutors in Bangalore for Class 6 to 12 with expert guidance and personalized learning.",
    courses: [
      {
        name: "Class 10 Science Coaching in Bangalore",
        slug: "class-10-science",
      },
    ],
  },
  maths: {
    title: "Maths Tutors in Bangalore",
    description:
      "Top maths tutors in Bangalore for all classes with personalized coaching and affordable pricing.",
    courses: [
      {
        name: "Maths Tutor in Bangalore",
        slug: "maths-tutor-bangalore",
      },
    ],
  },
  english: {
    title: "English Speaking Classes in Bangalore",
    description:
      "Improve your communication skills with the best English speaking classes in Bangalore.",
    courses: [
      {
        name: "English Speaking Classes in Bangalore",
        slug: "english-speaking-bangalore",
      },
    ],
  },
};

export default function CategoryPage() {
  const { category } = useParams();
  const data = categoryData[category];

  if (!data) {
    return <div className="p-10 text-center">Category Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* ✅ SEO */}
      <Helmet>
        <title>{data.title} | Saraswati Tutorial</title>
        <meta name="description" content={data.description} />
      </Helmet>

      {/* ✅ Breadcrumb */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Home</Link> {" / "}
        <span>{data.title}</span>
      </div>

      {/* ✅ H1 */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {data.title}
      </h1>

      {/* ✅ Description */}
      <p className="mt-4 text-slate-600">
        {data.description}
      </p>

      {/* ✅ Courses List */}
      <div className="mt-8 flex flex-col gap-4">
        {data.courses.map((course) => (
          <Link
            key={course.slug}
            to={`/course/${course.slug}`}
            className="text-blue-600 font-medium hover:underline"
          >
            {course.name}
          </Link>
        ))}
      </div>

      {/* ✅ CTA (SEO + Conversion boost) */}
      <div className="mt-10">
        <Link
          to="/parent-enquiry"
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          Book Free Demo
        </Link>
      </div>

    </div>
  );
}