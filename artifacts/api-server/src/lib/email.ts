import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vinod@unitedmain.com";
const FROM_EMAIL = "United Main <noreply@unitedmain.com>";

export async function sendReservationEmails({
  shopperName,
  shopperEmail,
  shopperPhone,
  vendorName,
  vendorEmail,
  productName,
  quantity,
  note,
  reservationCode,
  marketDate,
}: {
  shopperName: string;
  shopperEmail: string;
  shopperPhone: string;
  vendorName: string;
  vendorEmail: string | null;
  productName: string;
  quantity: number;
  note: string | null;
  reservationCode: string;
  marketDate: string | null;
}) {
  const marketDateStr = marketDate || "the next market day";

  const shopperHtml = `
    <p>Hi ${shopperName},</p>
    <p>Your reservation is confirmed.</p>
    <p><strong>Product:</strong> ${productName}<br>
    <strong>Vendor:</strong> ${vendorName}<br>
    <strong>Quantity:</strong> ${quantity}<br>
    <strong>Reservation code:</strong> ${reservationCode}</p>
    <p>Please pick up your item at the <strong>${vendorName}</strong> booth during market hours on ${marketDateStr}. Payment happens directly with the vendor unless otherwise noted.</p>
    <p>— United Main</p>
  `;

  const vendorHtml = vendorEmail ? `
    <p>Hi ${vendorName},</p>
    <p>A shopper has reserved an item for pickup at the Stoneham Farmers Market.</p>
    <p><strong>Product:</strong> ${productName}<br>
    <strong>Quantity:</strong> ${quantity}<br>
    <strong>Shopper:</strong> ${shopperName}<br>
    <strong>Email:</strong> ${shopperEmail}<br>
    <strong>Phone:</strong> ${shopperPhone}<br>
    <strong>Note:</strong> ${note || "—"}<br>
    <strong>Reservation code:</strong> ${reservationCode}</p>
    <p>Please hold this item for pickup during market hours if available according to your confirmed reservation process.</p>
    <p>Thanks,<br>United Main</p>
  ` : null;

  const adminHtml = `
    <p>New United Main reservation submitted.</p>
    <p><strong>Vendor:</strong> ${vendorName}<br>
    <strong>Product:</strong> ${productName}<br>
    <strong>Quantity:</strong> ${quantity}<br>
    <strong>Shopper:</strong> ${shopperName}<br>
    <strong>Email:</strong> ${shopperEmail}<br>
    <strong>Phone:</strong> ${shopperPhone}<br>
    <strong>Market Date:</strong> ${marketDateStr}<br>
    <strong>Reservation Code:</strong> ${reservationCode}</p>
  `;

  const sends = [];

  sends.push(
    resend.emails.send({
      from: FROM_EMAIL,
      to: shopperEmail,
      subject: `Your reservation at ${vendorName} — ${reservationCode}`,
      html: shopperHtml,
    }).catch((err) => logger.error({ err }, "Failed to send shopper email"))
  );

  if (vendorEmail && vendorHtml) {
    sends.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: vendorEmail,
        subject: "New United Main pickup reservation",
        html: vendorHtml,
      }).catch((err) => logger.error({ err }, "Failed to send vendor email"))
    );
  }

  sends.push(
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New reservation: ${vendorName} - ${productName}`,
      html: adminHtml,
    }).catch((err) => logger.error({ err }, "Failed to send admin email"))
  );

  await Promise.allSettled(sends);
}
