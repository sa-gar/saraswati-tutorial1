import fs from "fs";

const content = fs.readFileSync("c:/Users/niles/OneDrive/Desktop/saraswati tutorial/saraswati-tutorial1/frontend/src/pages/AdminDashboard.jsx", "utf8");
const lines = content.split("\n");

console.log("Lines referencing 'showTutors':");
lines.forEach((line, index) => {
  if (line.includes("showTutors")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
