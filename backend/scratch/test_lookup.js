import { lookupOdooMasterTutorIds } from "../utils/odooService.js";
import dotenv from "dotenv";
dotenv.config();

// Simulates what the recommendation engine might return
const mockTutors = [
  { name: "Dipak dhariya",         tutorCode: "TUT0003", phone: "8674892407" },
  { name: "S R Preethi",           tutorCode: "TUT0006", phone: "8904859305" },
  { name: "Pavithra R",            tutorCode: "TUT0007", phone: "6363803534" },
  { name: "John Doe (test only)",  tutorCode: "TUT0001", phone: "9876543210" },
  { name: "Not in Odoo at all",    tutorCode: "TUT-099", phone: "0000000000" },
];

async function run() {
  console.log("Testing lookupOdooMasterTutorIds with", mockTutors.length, "tutors...\n");
  const result = await lookupOdooMasterTutorIds(mockTutors);
  console.log("Result:", JSON.stringify(result, null, 2));
  
  if (result.odooIds.length > 0) {
    console.log("\n✅ SUCCESS — matched", result.odooIds.length, "Odoo records in", result.odooModel);
    console.log("Window action domain would be:", `[('id', 'in', ${JSON.stringify(result.odooIds)})]`);
  } else {
    console.log("\n❌ No matches found — page would be empty.");
  }
}

run().catch(console.error);
