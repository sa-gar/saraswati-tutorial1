import { Link } from "react-router-dom";

export default function MumbaiPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-blue-300">
            Saraswati Tutorials Mumbai
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Home Tutors in Mumbai
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Find experienced home tutors in Mumbai for school tuition, college
            subjects, competitive exams, spoken English, and skill-based learning.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/parent-enquiry"
              className="rounded-2xl bg-white px-6 py-4 font-black text-slate-950"
            >
              Book Free Demo Class
            </Link>

            <Link
              to="/tutor-register"
              className="rounded-2xl border border-white/25 px-6 py-4 font-black text-white"
            >
              Become a Tutor
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="School Tuition" text="Class 1 to 12 tutors for all major boards." />
          <Card title="Home Tuition" text="One-to-one learning support at home." />
          <Card title="Online Tuition" text="Flexible online tutoring support." />
        </div>
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}