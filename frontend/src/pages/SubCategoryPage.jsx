import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import courseStructure from "../data/courseData";

export default function SubCategoryPage() {
  const { main, sub } = useParams();

  const mainCategory = courseStructure[main];
  const subData = mainCategory?.subcategories[sub];

  if (!mainCategory || !subData) {
    return <div className="p-10 text-center">Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* ✅ SEO */}
      <Helmet>
        <title>
          {subData.name} Tuition in Bangalore | Saraswati Tutorial
        </title>
        <meta
          name="description"
          content={`Find best ${subData.name} tuition in Bangalore with expert tutors. Book free demo today.`}
        />
      </Helmet>

      {/* ✅ Breadcrumb (FIXED) */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Home</Link> {" / "}
        <Link to={`/courses/${main}`} className="hover:underline">
          {mainCategory.name}
        </Link>{" / "}
        <span>{subData.name}</span>
      </div>

      {/* ✅ H1 */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {subData.name} Tuition in Bangalore
      </h1>

      {/* ✅ Intro */}
      <p className="mt-4 text-slate-600">
        Explore the best {subData.name} courses in Bangalore with experienced tutors and flexible learning options.
      </p>

      {/* ✅ Courses Grid (UPGRADED UI) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {subData.courses.map((c) => (
          <Link
            key={c.slug}
            to={`/courses/${main}/${sub}/${c.slug}`}
            className="p-5 border rounded-xl hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {c.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Learn {c.name} with expert tutors
            </p>
          </Link>
        ))}
      </div>

      {/* ✅ CTA */}
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