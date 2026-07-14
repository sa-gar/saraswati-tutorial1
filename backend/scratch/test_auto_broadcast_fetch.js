import fetch from "node-fetch";

async function run() {
  console.log("Submitting test parent enquiry...");
  
  const response = await fetch("http://localhost:5000/api/parent-enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parentName: "Test Parent AutoBroadcast",
      phone: "9380046541",
      email: "test_parent_auto@example.com",
      address: "HSR Layout, Bangalore 560102",
      area: "HSR Layout",
      pincode: "560102",
      preferredGender: "No Preference",
      preferredTime: "Evening",
      frequency: "5 days",
      monthlyFees: "4500",
      wards: [{
        studentName: "Test Student",
        classGrade: "Class 9-10 (Secondary)",
        curriculum: "CBSE",
        subjectsNeeded: ["Mathematics", "Science"]
      }]
    })
  });

  const data = await response.json();
  console.log("Response status:", response.status);
  console.log("Response body:", data);
}

run().catch(console.error);
