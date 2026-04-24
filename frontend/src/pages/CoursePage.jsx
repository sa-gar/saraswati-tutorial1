import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import courseStructure from "../data/courseData";

export default function CoursePage() {
  const { main, sub, course } = useParams();

  const mainCategory = courseStructure[main];
  const subCategory = mainCategory?.subcategories[sub];
  const courseData = subCategory?.courses.find(
    (c) => c.slug === course
  );

  if (!courseData) {
    return <div className="p-10 text-center">Page Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* ✅ Breadcrumb */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/">Home</Link> {" / "}
        <Link to={`/courses/${main}`}>{mainCategory.name}</Link> {" / "}
        <Link to={`/courses/${main}/${sub}`}>{subCategory.name}</Link> {" / "}
        <span>{courseData.name}</span>
      </div>

      {/* ✅ SEO */}
      <Helmet>
        <title>
          {courseData.seoTitle || `${courseData.name} in Bangalore`}
        </title>
        <meta
          name="description"
          content={
            courseData.seoDesc ||
            `Best ${courseData.name} in Bangalore with expert tutors. Book free demo today.`
          }
        />
      </Helmet>

      {/* ✅ H1 */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {courseData.name}
      </h1>

      {/* ✅ Intro */}
      <p className="mt-4 text-slate-600">
        Join the best {courseData.name} in Bangalore with experienced tutors and personalized learning.
      </p>

      {/* ✅ Sections */}
      <h2 className="mt-10 text-2xl font-semibold">
        Why Choose Us for {courseData.name}?
      </h2>
      <ul className="mt-4 list-disc pl-6 text-slate-600">
        <li>Experienced tutors</li>
        <li>1-on-1 attention</li>
        <li>Flexible timings</li>
        <li>Affordable pricing</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold">
        {courseData.name} Fees & Syllabus
      </h2>
      <p className="mt-4 text-slate-600">
        Complete syllabus coverage with affordable fees starting from ₹300/hr.
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