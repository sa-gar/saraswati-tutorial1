import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function run() {
  try {
    // 1. Log in to get the token
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed: ${errText}`);
    }

    const { token } = await loginRes.json();
    console.log("Logged in successfully. Token obtained.");

    // 2. Fetch stats
    const statsRes = await fetch(`${API_BASE}/analytics/stats?period=7d`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!statsRes.ok) {
      const errText = await statsRes.text();
      throw new Error(`Stats fetch failed: ${errText}`);
    }

    const statsData = await statsRes.json();
    console.log("API response summary:");
    console.log(JSON.stringify(statsData.summary, null, 2));
    
    console.log("Location stats returned by API:");
    console.log(JSON.stringify(statsData.locationStats, null, 2));

    console.log("Unique cities in recentActivity:");
    const citiesInActivity = new Set(statsData.recentActivity.map(a => a.city));
    console.log(Array.from(citiesInActivity));

  } catch (error) {
    console.error("Error:", error);
  }
}

run();
