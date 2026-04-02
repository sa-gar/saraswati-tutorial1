import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✓
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Thank you!
        </h1>

        <p className="mt-3 text-slate-600">
          Your enquiry has been submitted successfully. Our team will contact you soon.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Redirecting to homepage in 3 seconds...
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}