import { useEffect } from "react";

export default function ThankYou() {

  useEffect(() => {
    const timer = setTimeout(() => {
      const message = "Hi, I just submitted my details. Please assist me.";

      window.location.href =
        "https://wa.me/message/VX2T7QEATZPRL1?text=" +
        encodeURIComponent(message);

    }, 2500); // 2.5 sec delay

    return () => clearTimeout(timer);
  }, []);

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
          Your details have been submitted successfully.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Redirecting you to WhatsApp...
        </p>

        {/* Optional manual button */}
        <div className="mt-6">
          <a
            href="https://wa.me/message/VX2T7QEATZPRL1"
            target="_blank"
            className="inline-flex rounded-2xl bg-green-600 px-6 py-3 font-medium text-white"
          >
            Open WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}