import fs from "fs";

const fileContent = fs.readFileSync("c:/Users/niles/OneDrive/Desktop/saraswati tutorial/saraswati-tutorial1/frontend/src/pages/AdminDashboard.jsx", "utf8");
const lines = fileContent.split("\n");

console.log("Searching for 'Unknown City' / 'unknown' in AdminDashboard.jsx:");
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes("unknown")) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
