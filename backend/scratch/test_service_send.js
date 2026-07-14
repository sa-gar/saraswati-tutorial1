import { sendWhatsAppToTutor } from "../utils/whatsappService.js";
import dotenv from "dotenv";
dotenv.config();

async function testSend() {
  console.log("Calling sendWhatsAppToTutor for onboarding workflow...");
  const sendResult = await sendWhatsAppToTutor({
    phoneNumber: "9380046541",
    messageBody: "Test body",
    templateName: "Tutor Agreement",
    templateLang: "en",
    templateVars: {},
    forceTemplate: true // Force template flow to verify the composer
  });

  console.log("Send result details:", sendResult);
}

testSend();
