import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory OTP storage with 10-minute expiry for local dev
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function signOtpToken(email: string, code: string, expiresAt: number, secret: string) {
  const payload = Buffer.from(JSON.stringify({ email, code, expiresAt })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function otpAuthPlugin(env: Record<string, string>): Plugin {
  const smtpUser = env.SMTP_EMAIL || 'tech@apniestate.com';
  const smtpPass = env.SMTP_APP_PASSWORD || '';
  const otpSecret = env.OTP_SECRET || smtpPass || 'apni-estate-interiors-otp-secret';

  const transporter = smtpPass
    ? nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

  return {
    name: 'vite-plugin-otp-auth',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/auth/send-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { email, type } = JSON.parse(body || '{}');
              const cleanEmail = (email || '').toLowerCase().trim();
              if (!cleanEmail || !cleanEmail.includes('@')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Valid email address is required.' }));
                return;
              }

              const otp = Math.floor(100000 + Math.random() * 900000).toString();
              const expiresAt = Date.now() + 10 * 60 * 1000;
              otpStore.set(cleanEmail, { code: otp, expiresAt });
              const token = signOtpToken(cleanEmail, otp, expiresAt, otpSecret);

              if (!transporter) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: 'Verification code generated (local dev mode).',
                  token,
                  previewCode: otp,
                }));
                return;
              }

              const subject = type === 'signup'
                ? 'Your Apni Estate Interiors Verification Code'
                : 'Your Apni Estate Interiors Login Code';

              const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6FA; margin: 0; padding: 40px 20px; color: #111827; }
                    .card { max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 36px 32px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
                    .logo { display: inline-block; padding: 8px 16px; background: #EFF6FF; border-radius: 8px; font-weight: 700; color: #1D4ED8; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
                    h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
                    p { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 24px 0; }
                    .code-box { background: #F8FAFC; border: 1px dashed #BFDBFE; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
                    .code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1D4ED8; }
                    .footer { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 32px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo">APNI ESTATE INTERIORS</div>
                    <h1>${type === 'signup' ? 'Welcome to Your Studio' : 'Sign in to Your Workspace'}</h1>
                    <p>Use the 6-digit verification code below to ${type === 'signup' ? 'complete your registration' : 'securely sign in to your interior studio account'}.</p>
                    <div class="code-box">
                      <div class="code">${otp}</div>
                    </div>
                    <p style="font-size: 12px; color: #6B7280;">This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
                    <div class="footer">
                      © ${new Date().getFullYear()} Apni Estate Interiors. All rights reserved.
                    </div>
                  </div>
                </body>
                </html>
              `;

              try {
                await transporter.sendMail({
                  from: `"Apni Estate Interiors" <${smtpUser}>`,
                  to: cleanEmail,
                  subject,
                  text: `Your Apni Estate Interiors verification code is: ${otp}. Valid for 10 minutes.`,
                  html: htmlContent,
                });
                console.log(`[OTP] Sent code to ${cleanEmail}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Verification code sent to your email.', token }));
              } catch (sendErr: any) {
                console.error('[OTP] SMTP Send Error:', sendErr);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: 'Verification code generated.',
                  token,
                  previewCode: otp,
                }));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message || 'Failed to send OTP.' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/auth/verify-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { email, code } = JSON.parse(body || '{}');
              const cleanEmail = (email || '').toLowerCase().trim();
              const entry = otpStore.get(cleanEmail);

              if (!entry) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No verification code found. Please request a new one.' }));
                return;
              }

              if (Date.now() > entry.expiresAt) {
                otpStore.delete(cleanEmail);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }));
                return;
              }

              if (entry.code !== (code || '').trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid verification code. Please check and try again.' }));
                return;
              }

              otpStore.delete(cleanEmail);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message || 'Failed to verify OTP.' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), otpAuthPlugin(env)],
    server: {
      port: 5173,
      host: true,
    },
  };
});
