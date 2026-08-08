import crypto from "crypto";

export const generateOtp = (): string => {
  const otp = crypto.randomInt(1000, 10000).toString();
  return otp;
};

export async function sendOtpSMS(mobile: string, otp: string) {
  const url = "http://msg.icloudsms.com/rest/services/sendSMS/sendGroupSms";

  const params = new URLSearchParams({
    AUTH_KEY: process.env.AUTH_KEY!,

    // DLT-approved Header
    senderId: process.env.SENDER_ID!,

    // Message Club OTP route
    routeId: "8",

    // Recipient mobile number
    mobileNos: mobile,

    // Principal Entity (PE) ID
    entityid: process.env.ENTITY_ID!,

    // NEW DLT Content Template ID
    templateid: process.env.TEMPLATE_ID!,

    // Must match the NEW approved DLT template
    message: `Dear Customer, your OTP for M/S PROTEIN AND NUTRIENTS login is ${otp}. It is valid for 5 minutes. Do not share it with anyone. - M/S PROTEIN AND NUTRIENTS | https://fuelandnutrients.com`,

    smsContentType: "english",
  });

  try {
    await fetch(`${url}?${params.toString()}`, {
      method: "GET",
    });

  } catch (error) {
    console.error("SMS API Error:", error);
  }
}