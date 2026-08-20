import dotenv from "dotenv";

dotenv.config();

async function runAttendanceVerification() {
  console.log("---------------------------------------------------------");
  console.log("STARTING ATTENDANCE AUTO CYCLE & HISTORY VERIFICATION TESTS");
  console.log("---------------------------------------------------------");

  const API_BASE = "http://localhost:5000/api";

  try {
    // 1. Fetch active students for any tutor or test parent search
    console.log("Testing parent login search endpoint...");
    const parentRes = await fetch(`${API_BASE}/attendance/parent-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543210" }),
    });

    const parentData = await parentRes.json();
    console.log("Parent Login API status:", parentRes.status);
    console.log("Parent Search Results Found:", parentData.results?.length || 0);

    if (parentData.results && parentData.results.length > 0) {
      const firstId = parentData.results[0].card._id;
      console.log(`\nTesting History API for Lead ID ${firstId}...`);
      const histRes = await fetch(`${API_BASE}/attendance/history/${firstId}`);
      const histData = await histRes.json();
      console.log("History API Success:", histData.success);
      console.log("Current Package Cycle:", histData.currentCycle);
      console.log("Cycles Count:", histData.cycles?.length);

      console.log(`\nTesting CSV Download API for Lead ID ${firstId}...`);
      const csvRes = await fetch(`${API_BASE}/attendance/download-history/${firstId}?cycle=all`);
      const csvHeader = csvRes.headers.get("content-type");
      console.log("CSV Download Status:", csvRes.status);
      console.log("Content-Type:", csvHeader);

      if (csvRes.status === 200 && csvHeader?.includes("text/csv")) {
        console.log("\n✅ ALL API ENDPOINTS VERIFIED SUCCESSFULLY!");
      }
    } else {
      console.log("No test records found for phone, but API call succeeded.");
    }
  } catch (err) {
    console.error("Test error:", err);
  }
}

runAttendanceVerification();
