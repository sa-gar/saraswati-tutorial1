import { sendWhatsAppToTutor, triggerWhatsAppQueue } from "../utils/whatsappService.js";
import dotenv from "dotenv";
dotenv.config();

async function testFullSend() {
  console.log("=== Full WhatsApp Broadcast Test ===");
  console.log("Testing onboarding template with dynamic sign link...\n");

  // Use a real tutor phone number for the test
  const phoneNumber = "9380046541";
  const tutorSignLink = "https://saraswati-tutorials.odoo.com/sign/document/236/34e44623-2aab-419b-93ad-1200fbeaab1c";

  const messageBody = `Thank you for showing interest in a Saraswati Tutorials assignment.

To maintain verified and professional tutor allocation, all demo/class requests are processed through our *One-Time Tutor Authorisation System.*

✅ After authorisation, you will receive:
• Parent contact details;
• Exact Parent's location (Society,Wing&Flat No.);
• Demo timings updates
For present & future interested opportunities from Us.

_____

Our verification team will review and proceed accordingly.`;

  console.log(`Sending Tutor Agreement template to: ${phoneNumber}`);
  console.log(`Sign link: ${tutorSignLink}\n`);

  const result = await sendWhatsAppToTutor({
    phoneNumber,
    messageBody,
    templateName: "Tutor Agreement",
    templateLang: "en",
    templateVars: {
      button_dynamic_url_1: tutorSignLink,
    },
  });

  console.log("\n=== Result ===");
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    console.log("\n✅ SUCCESS! Message queued in Odoo. Triggering queue...");
    await triggerWhatsAppQueue();
    console.log("✅ Queue triggered. Message should be delivered soon!");
  } else {
    console.log(`\n❌ FAILED: ${result.failureReason}`);
  }
}

testFullSend().catch(console.error);
