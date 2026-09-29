const TO_EMAIL = 'info@cubicsmartllc.com';
const FROM_EMAIL = 'leads@info.cubicsmartllc.com';

const ISSUE_LABELS = {
  water: 'Water Damage',
  restoration: 'Restoration / Reconstruction',
  storm: 'Storm / Flood',
  fire: 'Minor Fire Damage',
  remodel: 'Bathroom Remodel',
  concrete: 'Concrete / Structural',
  other: 'Other / Not Sure',
};

const URGENCY_LABELS = {
  now: 'Active Emergency — Need Help Now',
  today: 'Today, But Not an Emergency',
  week: 'This Week',
  quote: 'Just Getting a Quote',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const { name, phone, email, address, issue, urgency, message, preferredTime } = data;

  if (!name || !phone || !address || !issue || !urgency) {
    return json({ ok: false, error: 'Missing required fields.' }, 400);
  }

  // RESEND_API_KEY is a Secrets Store binding, not a plain text secret —
  // it exposes an object with an async .get() rather than the value directly.
  const apiKey = env.RESEND_API_KEY ? await env.RESEND_API_KEY.get() : null;
  if (!apiKey) {
    return json({ ok: false, error: 'Server misconfigured.', detail: 'RESEND_API_KEY secret binding is missing or empty.' }, 500);
  }

  const issueLabel = ISSUE_LABELS[issue] || issue;
  const urgencyLabel = URGENCY_LABELS[urgency] || urgency;
  const subject = urgency === 'now'
    ? `EMERGENCY LEAD: ${name} — ${issueLabel}`
    : `New Lead: ${name} — ${issueLabel}`;

  const html = `
    <h2>New callback request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email || '—')}</p>
    <p><strong>Address:</strong> ${escapeHtml(address)}</p>
    <p><strong>Type of Damage:</strong> ${escapeHtml(issueLabel)}</p>
    <p><strong>Urgency:</strong> ${escapeHtml(urgencyLabel)}</p>
    <p><strong>Preferred Contact Time:</strong> ${escapeHtml(preferredTime || '—')}</p>
    <p><strong>Message:</strong><br>${escapeHtml(message || '—').replace(/\n/g, '<br>')}</p>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email ? [email] : undefined,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errText = await resendResponse.text();
    // Never the full key — just enough shape (prefix + length) to tell an
    // empty/truncated/malformed value apart from a genuinely bad one.
    const keyPreview = `${apiKey.slice(0, 6)}... (length ${apiKey.length})`;
    console.error('Resend error:', resendResponse.status, errText, 'Key preview:', keyPreview);
    return json({ ok: false, error: 'Email failed to send.', detail: errText, keyPreview }, 502);
  }

  return json({ ok: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
