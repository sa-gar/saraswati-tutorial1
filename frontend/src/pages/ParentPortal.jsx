import { useState } from "react";
import { API_BASE } from "../config";
import { 
  Search, 
  Phone, 
  Calendar, 
  Clock, 
  BookOpen, 
  XCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  User,
  Activity,
  FileDown,
  Info
} from "lucide-react";

export default function ParentPortal() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null); // Array of { card, logs }
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);

  // Helper to dynamically load external scripts for PDF generation
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  };

  async function handleSearch(e) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`${API_BASE}/attendance/parent-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.message || "Failed to find records.");
        setLoading(false);
        return;
      }

      setData(resData.results);
      if (resData.results.length > 0) {
        setExpandedCardId(resData.results[0].card._id); // Expand first card by default
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCard(cardId) {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  }

  // Client-Side PDF Generation and Download
  async function generatePDFReport(card, logs) {
    setPdfGeneratingId(card._id);
    try {
      // Dynamically load jsPDF and jsPDF AutoTable from CDN
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // 1. Saraswati Tutorials Branding
      doc.setFillColor(30, 41, 59); // dark slate-800 background for top header banner
      doc.rect(0, 0, 210, 32, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("SARASWATI TUTORIALS", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(199, 210, 254); // indigo-200
      doc.text("Verified Home Tuitions & Academic Excellence", 14, 25);

      // Print Date
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const printDateStr = `Report Generated: ${new Date().toLocaleString()}`;
      doc.text(printDateStr, 155, 25);

      // 2. Student & Teacher Details Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text("STUDENT & TUITION DETAILS", 14, 42);

      // Draw horizontal dividing line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 45, 196, 45);

      // Grid of Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Student Name:", 14, 52);
      doc.text("Teacher Name:", 14, 58);
      doc.text("Requirement ID:", 110, 52);
      doc.text("Class Schedule:", 110, 58);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(card.studentName, 42, 52);
      doc.text(card.tutorName, 42, 58);
      doc.text(card.requirementId, 138, 52);
      doc.text(card.classSchedule, 138, 58);

      // 3. Attendance Summary Box
      doc.setFillColor(248, 250, 252); // light grey-50 box
      doc.setDrawColor(226, 232, 240); // border
      doc.rect(14, 66, 182, 22, "FD");

      // Table Headers in Summary Box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("TOTAL CLASSES", 18, 72);
      doc.text("COMPLETED (DONE)", 62, 72);
      doc.text("MISSED CLASSES", 112, 72);
      doc.text("REMAINING", 158, 72);

      // Summary Values
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(String(card.totalClasses), 18, 80);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(String(card.completedClasses), 62, 80);
      doc.setTextColor(239, 68, 68); // rose-600
      doc.text(String(card.missedClasses), 112, 80);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(String(card.remainingClasses), 158, 80);

      // 4. Date-wise Attendance Timeline Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("DATE-WISE CLASS HISTORY LOG", 14, 98);
      doc.line(14, 101, 196, 101);

      // 5. Build Class Log Table
      const tableBody = logs.map((log, index) => {
        const classNumber = logs.length - index;
        const details = log.status === "Done" 
          ? `Topics: ${log.topicsCovered}` 
          : `Reason: ${log.missedReason === "Other" ? log.customReason : log.missedReason}`;
        
        return [
          `Class ${classNumber}`,
          log.date,
          log.status === "Done" ? "Done" : "Missed",
          details,
          log.tutorName
        ];
      });

      doc.autoTable({
        startY: 104,
        head: [["Session", "Date", "Status", "Topics Covered / Missed Reason", "Teacher"]],
        body: tableBody,
        headStyles: { 
          fillColor: [79, 70, 229], 
          textColor: [255, 255, 255], 
          fontSize: 9,
          fontStyle: "bold"
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 28 },
          2: { cellWidth: 20 },
          3: { cellWidth: 84 },
          4: { cellWidth: 30 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: function (table) {
          // Color code Status column (column index 2)
          if (table.section === "body" && table.column.index === 2) {
            const statusVal = table.cell.raw;
            if (statusVal === "Done") {
              table.cell.styles.textColor = [16, 185, 129];
              table.cell.styles.fontStyle = "bold";
            } else {
              table.cell.styles.textColor = [239, 68, 68];
              table.cell.styles.fontStyle = "bold";
            }
          }
        },
        margin: { left: 14, right: 14 },
        styles: { font: "helvetica", fontSize: 8.5 }
      });

      // Save the PDF file
      const filename = `Saraswati_Attendance_${card.studentName.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error(err);
      alert("Failed to generate and download PDF report. Error: " + err.message);
    } finally {
      setPdfGeneratingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Brand Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto max-w-3xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              S
            </div>
            <h1 className="text-base font-extrabold tracking-tight">Saraswati Tutorials</h1>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Parent Portal</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 mt-8">
        
        {/* Search Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Check Class Attendance & Progress</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered parent phone number to verify class details, timeline logs, and progress.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                required
                placeholder="Registered phone number (e.g. 9876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Searching..." : (
                <>
                  <Search className="h-4 w-4" />
                  Fetch History
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* Attendance Data Display */}
        {data && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-slate-800">Active Tuitions ({data.length})</h3>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Info className="h-3 w-3" /> Click cards to show timelines
              </p>
            </div>
            
            {data.map((item) => {
              const card = item.card;
              const logs = item.logs;
              const isExpanded = expandedCardId === card._id;
              const percent = Math.min(100, Math.round((card.completedClasses / card.totalClasses) * 100)) || 0;

              return (
                <div 
                  key={card._id} 
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Summary Card Header */}
                  <div 
                    onClick={() => toggleCard(card._id)}
                    className="p-6 cursor-pointer hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg">
                            {card.requirementId}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                            card.currentAttendanceStatus === "Done"
                              ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                              : card.currentAttendanceStatus === "Missed"
                              ? "bg-rose-50 border-rose-150 text-rose-700"
                              : "bg-amber-50 border-amber-150 text-amber-700"
                          }`}>
                            {card.currentAttendanceStatus === "Done" ? "Done Today" : card.currentAttendanceStatus === "Missed" ? "Missed Today" : "Pending Today"}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-800 mt-1">{card.studentName}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 pt-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>Teacher: {card.tutorName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>Schedule: {card.classSchedule}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        {/* Counter */}
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Attendance Summary</span>
                          <strong className="text-sm font-extrabold text-slate-800">{card.completedClasses} / {card.totalClasses} Classes</strong>
                        </div>
                        
                        {/* Chevron Toggle */}
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for summary */}
                    <div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-[9px] font-black text-slate-400">
                        <span>{percent}% Classes Completed</span>
                        <span>Remaining: {card.remainingClasses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable History Detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-150 bg-slate-50/50 p-6 animate-slideFade">
                      
                      {/* Attendance Grid Summary details */}
                      <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 block uppercase">Total</span>
                          <strong className="text-base font-black text-slate-800 mt-0.5 block">{card.totalClasses}</strong>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 block uppercase">Completed</span>
                          <strong className="text-base font-black text-emerald-600 mt-0.5 block">{card.completedClasses}</strong>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 block uppercase">Missed</span>
                          <strong className="text-base font-black text-rose-600 mt-0.5 block">{card.missedClasses}</strong>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
                          <span className="text-[9px] font-black text-slate-400 block uppercase">Remaining</span>
                          <strong className="text-base font-black text-indigo-600 mt-0.5 block">{card.remainingClasses}</strong>
                        </div>
                      </div>

                      {/* Download PDF CTA */}
                      <div className="mb-6 flex justify-end">
                        <button
                          type="button"
                          disabled={pdfGeneratingId === card._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePDFReport(card, logs);
                          }}
                          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <FileDown className="h-4 w-4" />
                          {pdfGeneratingId === card._id ? "Generating PDF..." : "Download Attendance Report"}
                        </button>
                      </div>

                      {/* Class Log Timeline */}
                      <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200/80 pb-2">Class Attendance Timeline</h5>
                      
                      {logs.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-2">
                          <Activity className="h-6 w-6 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">No classes logged yet for this tuition.</p>
                        </div>
                      ) : (
                        <div className="relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                          {logs.map((log, index) => {
                            const classIndex = logs.length - index;
                            return (
                              <div 
                                key={log._id}
                                className="relative pl-5"
                              >
                                {/* Circle icon marker on line */}
                                <div className="absolute -left-[19px] top-1 z-10">
                                  {log.status === "Done" ? (
                                    <div className="h-4.5 w-4.5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    </div>
                                  ) : (
                                    <div className="h-4.5 w-4.5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center">
                                      <XCircle className="h-3 w-3 text-rose-600" />
                                    </div>
                                  )}
                                </div>

                                {/* Timeline Card */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                                    <h6 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                      <span>Class {classIndex}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-500 font-bold">{log.date}</span>
                                    </h6>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                      log.status === "Done" 
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                        : "bg-rose-50 border-rose-100 text-rose-700"
                                    }`}>
                                      {log.status === "Done" ? "Completed" : "Missed"}
                                    </span>
                                  </div>

                                  {log.status === "Done" ? (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Topics Covered</span>
                                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        {log.topicsCovered}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Missed Reason</span>
                                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        {log.missedReason === "Other" ? log.customReason : log.missedReason}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="mt-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                                    <span>Logged by: {log.tutorName}</span>
                                    <span>Updated: {new Date(log.timestamp).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
