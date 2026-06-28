import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackLeadConversion } from "../utils/analytics";

const PARENT_WHATSAPP_LINK = "https://wa.me/message/VX2T7QEATZPRL1";
const TUTOR_WHATSAPP_LINK = "https://wa.me/message/TI4DOHTXZTLGD1";

export default function ThankYou() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const type = params.get("type");

  const isTutor = type === "tutor";

  const whatsappLink = isTutor
    ? TUTOR_WHATSAPP_LINK
    : PARENT_WHATSAPP_LINK;

  useEffect(() => {
    const wasSubmitted = sessionStorage.getItem("enquiry_form_submitted") === "true";
    if (wasSubmitted && !isTutor) {
      sessionStorage.removeItem("enquiry_form_submitted");
      trackLeadConversion();
    }
  }, [isTutor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = whatsappLink;
    }, 2500);

    return () => clearTimeout(timer);
  }, [whatsappLink]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
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

        <div className="mt-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-2xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
          >
            Open WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}