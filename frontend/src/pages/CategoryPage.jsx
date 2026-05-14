import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import courseStructure from "../data/courseData";

export default function CategoryPage() {
  const { category } = useParams();

  const mainCategory = courseStructure[category];

  if (!mainCategory) {
    return <div className="p-10 text-center">Category Not Found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* ✅ SEO */}
      <Helmet>
        <title>{mainCategory.name} in Bangalore | Saraswati Tutorial</title>
        <meta
          name="description"
          content={
            mainCategory.description ||
            `Best ${mainCategory.name} in Bangalore with expert tutors. Book free demo today.`
          }
        />
      </Helmet>

      {/* ✅ Breadcrumb */}
      <div className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Home</Link> {" / "}
        <span>{mainCategory.name}</span>
      </div>

      {/* ✅ H1 */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {mainCategory.name}
      </h1>

      {/* ✅ Subcategories */}
      <div className="mt-8 flex flex-col gap-4">
        {Object.entries(mainCategory.subcategories).map(([key, sub]) => (
          <Link
            key={key}
            to={`/courses/${category}/${key}`}
            className="text-blue-600 font-medium hover:underline"
          >
            {sub.name}
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