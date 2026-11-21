import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { email, fullName, studioName, trialEndsAt } = body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const smtpUser = process.env.SMTP_EMAIL || 'tech@apniestate.com';
    const smtpPass = process.env.SMTP_APP_PASSWORD || '';

    const formattedExpiry = trialEndsAt 
      ? new Date(trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '7 days from today';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F6FA; margin: 0; padding: 40px 20px; color: #111827; }
          .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 36px 32px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .logo { display: inline-block; padding: 8px 16px; background: #EFF6FF; border-radius: 8px; font-weight: 700; color: #1D4ED8; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
          .badge { display: inline-block; padding: 4px 12px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 9999px; font-weight: 700; color: #92400E; font-size: 12px; margin-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 12px 0; }
          p { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 20px 0; }
          .info-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .btn { display: inline-block; padding: 14px 28px; background: #1D4ED8; color: #FFFFFF !important; font-weight: 700; text-decoration: none; border-radius: 10px; font-size: 14px; text-align: center; }
          .footer { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">APNI ESTATE INTERIORS</div>
          <div>
            <span class="badge">TRIAL ACTIVATED</span>
          </div>
          <h1>Your 7-Day Free Trial is Live!</h1>
          <p>Hello <strong>${fullName || 'Studio Owner'}</strong>,</p>
          <p>Great news! Your request for a <strong>7-day free trial</strong> for <strong>${studioName || 'Your Studio'}</strong> has been approved by the administrator.</p>
          
          <div class="info-box">
            <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">TRIAL VALID UNTIL</div>
            <div style="font-size: 18px; font-weight: 800; color: #1E293B;">${formattedExpiry}</div>
            <div style="font-size: 13px; color: #059669; font-weight: 600; margin-top: 6px;">✓ Full access to BOQ, Expenses, DPR, Site Logs & Client Portals</div>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://interior.apniestate.com" class="btn">Launch Your Studio Workspace →</a>
          </div>

          <p style="font-size: 13px; color: #6B7280;">If you need assistance during your trial, feel free to contact our dedicated support team at <strong>tech@apniestate.com</strong> or call <strong>+91 98201 55432</strong>.</p>
          
          <div class="footer">
            © ${new Date().getFullYear()} Apni Estate Interiors. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    if (!smtpPass) {
      return res.status(200).json({
        success: true,
        message: 'Trial approval recorded (SMTP_APP_PASSWORD not set for live delivery).',
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"Apni Estate Interiors" <${smtpUser}>`,
      to: cleanEmail,
      subject: 'Your 7-Day Free Trial is Activated! - Apni Estate Interiors',
      text: `Hello ${fullName || 'Studio Owner'},\n\nYour 7-day free trial for Apni Estate Interiors is activated until ${formattedExpiry}.\n\nAccess your workspace: https://interior.apniestate.com\n\nApni Estate Team`,
      html: htmlContent,
    });

    return res.status(200).json({
      success: true,
      message: 'Approval email sent successfully.',
    });
  } catch (err) {
    console.error('[SendApprovalEmail] Error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to send approval email.' });
  }
}
