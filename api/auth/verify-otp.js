import crypto from 'crypto';

function verifyOtpToken(token, email, code, secret) {
  if (!token || !token.includes('.')) {
    return { valid: false, error: 'Missing verification session. Please request a new code.' };
  }

  const [payload, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expectedSig) {
    return { valid: false, error: 'Invalid verification session. Please request a new code.' };
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (decoded.email !== email) {
    return { valid: false, error: 'Email mismatch. Please request a new code.' };
  }

  if (Date.now() > decoded.expiresAt) {
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (decoded.code !== code) {
    return { valid: false, error: 'Invalid verification code. Please check and try again.' };
  }

  return { valid: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const cleanEmail = (body.email || '').toLowerCase().trim();
    const cleanCode = (body.code || '').trim();
    const token = body.token || '';

    const smtpPass = process.env.SMTP_APP_PASSWORD || '';
    const otpSecret = process.env.OTP_SECRET || smtpPass || 'apni-estate-interiors-otp-secret';

    const result = verifyOtpToken(token, cleanEmail, cleanCode, otpSecret);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to verify OTP.' });
  }
}

