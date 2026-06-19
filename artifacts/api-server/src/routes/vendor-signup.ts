import { Router } from "express";
import { Resend } from "resend";

const router = Router();
const resend = new Resend(process.env["RESEND_API_KEY"]);

router.post("/vendor-signup", async (req, res) => {
  const { name, email, phone, businessName, website } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    website?: string;
  };

  if (!name || !email || !phone || !businessName) {
    res.status(400).json({ error: "Name, email, phone, and business name are required." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Please provide a valid email address." });
    return;
  }

  try {
    await resend.emails.send({
      from: "United Main Market <onboarding@resend.dev>",
      to: "vinod@unitedmain.com",
      subject: `New Vendor Inquiry: ${businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h2 style="margin-top: 0; font-size: 20px;">New Vendor Sign-Up — Stoneham Farmers Market</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 10px 12px; background: #f5f5f5; font-weight: 600; width: 140px; border-bottom: 1px solid #e0e0e0;">Business Name</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background: #f5f5f5; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Contact Name</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background: #f5f5f5; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background: #f5f5f5; font-weight: 600; border-bottom: 1px solid #e0e0e0;">Phone</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; background: #f5f5f5; font-weight: 600;">Website</td>
              <td style="padding: 10px 12px;">${website ? `<a href="${website}">${website}</a>` : "—"}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; font-size: 13px; color: #666;">Submitted via the Stoneham Farmers Market vendor sign-up form.</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send vendor signup email");
    res.status(500).json({ error: "Failed to send your application. Please try again." });
  }
});

export default router;
