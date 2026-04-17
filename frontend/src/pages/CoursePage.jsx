import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const courseData = {
  "class-10-science": {
    title: "Class 10 Science Coaching in Bangalore",
    h1: "Class 10 Science Best Coaching Institute",
    description:
      "Find the best Class 10 Science coaching in Bangalore with expert tutors. Book demo classes and improve your performance.",
  },
  "maths-tutor-bangalore": {
    title: "Maths Tutor in Bangalore",
    h1: "Best Maths Coaching Institute in Bangalore",
    description:
      "Get the best maths tutor in Bangalore with personalized coaching and flexible learning options.",
  },
  "english-speaking-bangalore": {
    title: "Spoken English Classes in Bangalore",
    h1: "Best English Speaking Coaching in Bangalore",
    description:
      "Join top English speaking classes in Bangalore and improve communication skills with expert trainers.",
  },
};

export default function CoursePage() {
  const { slug } = useParams();
  const course = courseData[slug];

  // ✅ Category mapping (IMPORTANT FIX)
  const categoryMap = {
    "class-10-science": "science",
    "maths-tutor-bangalore": "maths",
    "english-speaking-bangalore": "english",
  };

  const category = categoryMap[slug];

  // ✅ Format name
  const formattedName = slug
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (!course) {
    return <div className="p-10 text-center">Page Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* ✅ Breadcrumb (FIXED) */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Home</Link> {" / "}
        <Link to={`/tutors/${category}`} className="hover:underline">
          {category.charAt(0).toUpperCase() + category.slice(1)} Tutors
        </Link>{" / "}
        <span>{formattedName}</span>
      </div>

      {/* ✅ SEO META */}
      <Helmet>
        <title>{course.title} | Saraswati Tutorial</title>
        <meta name="description" content={course.description} />
      </Helmet>

      {/* ✅ H1 */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {course.h1}
      </h1>

      {/* ✅ Intro */}
      <p className="mt-4 text-slate-600">
        {course.description}
      </p>

      {/* ✅ Section 1 */}
      <h2 className="mt-10 text-2xl font-semibold">
        Why Choose Us for {course.title}?
      </h2>
      <ul className="mt-4 list-disc pl-6 text-slate-600">
        <li>Experienced and verified tutors</li>
        <li>Flexible home & online classes</li>
        <li>Affordable pricing</li>
        <li>Personalized attention</li>
      </ul>

      {/* ✅ Section 2 */}
      <h2 className="mt-10 text-2xl font-semibold">
        {course.title} Syllabus & Fees
      </h2>
      <p className="mt-4 text-slate-600">
        Complete syllabus coverage with affordable fees starting from ₹300/hr.
      </p>

      {/* ✅ Section 3 */}
      <h2 className="mt-10 text-2xl font-semibold">
        Success Stories
      </h2>
      <p className="mt-4 text-slate-600">
        Many students have improved their performance with our expert tutors.
      </p>

      {/* ✅ CTA */}
      <div className="mt-10">
        <Link
          to="/parent-enquiry"
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          Enroll Now
        </Link>
      </div>

    </div>
  );
}