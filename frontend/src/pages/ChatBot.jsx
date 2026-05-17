import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Bot } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 Welcome to Saraswati Tutorial. How can I help you?",
      options: [
        "Find a Tutor",
        "Book Demo Class",
        "Tutor Registration",
        "Payment for Demo Class",
        "Contact Support",
      ],
    },
  ]);
  const [input, setInput] = useState("");

  const addBotMessage = (text, options = [], links = []) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text,
        options,
        links,
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);
  };

  const handleOptionClick = (option) => {
    addUserMessage(option);

    if (option === "Find a Tutor") {
      addBotMessage(
        "Great! Please tell us the class, subject, preferred mode, and area in the parent enquiry form.",
        [],
        [
          {
            label: "Open Parent Enquiry Form",
            to: "/parent-enquiry",
          },
        ]
      );
      return;
    }

    if (option === "Book Demo Class") {
      addBotMessage(
        "You can book a free demo class by filling the parent enquiry form.",
        [],
        [
          {
            label: "Book Demo Class",
            to: "/parent-enquiry",
          },
        ]
      );
      return;
    }

    if (option === "Tutor Registration") {
      addBotMessage(
        "If you want to join as a tutor, please complete the tutor registration form.",
        [],
        [
          {
            label: "Register as Tutor",
            to: "/tutor-register",
          },
        ]
      );
      return;
    }

    if (option === "Payment for Demo Class") {
      addBotMessage(
        "You can complete your demo class payment securely using our payment page.",
        [],
        [
          {
            label: "Go to Payment Page",
            to: "/payment",
          },
        ]
      );
      return;
    }

    if (option === "Contact Support") {
      addBotMessage(
        "You can contact our team directly on WhatsApp.",
        [],
        [
          {
            label: "Open WhatsApp",
            href: "https://wa.me/918904457689",
          },
        ]
      );
      return;
    }

    addBotMessage("Please choose one of the options below.", [
      "Find a Tutor",
      "Book Demo Class",
      "Tutor Registration",
      "Payment for Demo Class",
      "Contact Support",
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    addUserMessage(userText);
    setInput("");

    const lower = userText.toLowerCase();

    if (
      lower.includes("math") ||
      lower.includes("science") ||
      lower.includes("physics") ||
      lower.includes("chemistry") ||
      lower.includes("biology") ||
      lower.includes("english") ||
      lower.includes("tutor") ||
      lower.includes("tuition")
    ) {
      addBotMessage(
        "We can help you find the right tutor. Please fill the parent enquiry form with class, subject, area, and preferred timing.",
        [],
        [
          {
            label: "Open Parent Enquiry Form",
            to: "/parent-enquiry",
          },
        ]
      );
      return;
    }

    if (lower.includes("payment") || lower.includes("pay") || lower.includes("razorpay")) {
      addBotMessage(
        "You can complete payment from our secure payment page.",
        [],
        [
          {
            label: "Go to Payment Page",
            to: "/payment",
          },
        ]
      );
      return;
    }

    if (lower.includes("register") || lower.includes("teach") || lower.includes("teacher")) {
      addBotMessage(
        "You can register as a tutor using our tutor registration form.",
        [],
        [
          {
            label: "Register as Tutor",
            to: "/tutor-register",
          },
        ]
      );
      return;
    }

    if (lower.includes("contact") || lower.includes("whatsapp") || lower.includes("call")) {
      addBotMessage(
        "You can contact us directly on WhatsApp.",
        [],
        [
          {
            label: "Open WhatsApp",
            href: "https://wa.me/918904457689",
          },
        ]
      );
      return;
    }

    addBotMessage(
      "I can help you with tutor enquiry, demo booking, tutor registration, payment, or support.",
      [
        "Find a Tutor",
        "Book Demo Class",
        "Tutor Registration",
        "Payment for Demo Class",
        "Contact Support",
      ]
    );
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-950 px-5 py-4 font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-black"
        >
          <MessageCircle className="h-5 w-5" />
          Chat
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <p className="font-black">Saraswati Assistant</p>
                <p className="text-xs text-slate-300">Usually replies instantly</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    msg.sender === "user"
                      ? "ml-auto bg-slate-950 text-white"
                      : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.options?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {msg.links?.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {msg.links.map((link) =>
                      link.to ? (
                        <Link
                          key={link.label}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-green-700"
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Type your question..."
                className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
              />

              <button
                onClick={handleSend}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white hover:bg-black"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}