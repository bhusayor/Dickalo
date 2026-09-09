import 'server-only';

import { Resend } from 'resend';
import { siteConfig } from '@/config/site';
import { BUDGET_OPTIONS, PROJECT_TYPE_OPTIONS } from '@/lib/constants';
import type { ContactInput } from './validation';

/**
 * Transactional email.
 *
 * Two messages go out per enquiry:
 *  1. A notification to the studio, built for scanning — the reply-to is set to
 *     the sender so hitting Reply just works.
 *  2. An acknowledgement to the visitor that repeats what they wrote, so they
 *     have a record and know it arrived.
 *
 * Both are hand-written HTML with inline styles. Email clients strip <style>
 * blocks, and a table-free layout with inline CSS is the only thing that renders
 * the same in Gmail, Outlook and Apple Mail.
 */

const resendApiKey = process.env.RESEND_API_KEY ?? '';
export const isEmailConfigured = resendApiKey.startsWith('re_');

const resend = isEmailConfigured ? new Resend(resendApiKey) : null;

const FROM = process.env.EMAIL_FROM ?? `DICKALO <studio@${new URL(siteConfig.url).hostname}>`;
const TO = process.env.EMAIL_TO ?? siteConfig.contact.email;

const GOLD = '#FFD700';
const BLACK = '#000000';
const INK = '#8A8A83';

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Escape user input before it goes into an HTML email. */
function esc(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Preserve the visitor's paragraph breaks without allowing markup through. */
function paragraphs(text: string): string {
  return esc(text)
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 14px;line-height:1.65;">${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function labelFor(list: { value: string; label: string }[], value?: string): string {
  if (!value) return '—';
  return list.find((item) => item.value === value)?.label ?? value;
}

// ---------------------------------------------------------------------------
// Shared shell
// ---------------------------------------------------------------------------

function shell(title: string, body: string, footer: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BLACK};">
  <!-- Preheader: shown in the inbox list, hidden in the message body. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(title)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${BLACK};padding:28px 32px;">
              <span style="color:${GOLD};font-size:20px;font-weight:700;letter-spacing:0.18em;">DICKALO</span>
              <div style="color:#8A8A83;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin-top:6px;">
                Architecture &amp; Construction — Nigeria
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#fafaf8;padding:22px 32px;border-top:1px solid #eaeae6;font-size:12px;line-height:1.6;color:${INK};">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #eaeae6;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${INK};width:36%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid #eaeae6;font-size:15px;color:${BLACK};vertical-align:top;">${value}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Studio notification
// ---------------------------------------------------------------------------

export function buildStudioNotification(input: ContactInput): { subject: string; html: string; text: string } {
  const projectType = labelFor(PROJECT_TYPE_OPTIONS, input.projectType);
  const budget = labelFor(BUDGET_OPTIONS, input.budget);

  // Subject carries the facts, so the inbox list alone is triage-able.
  const subject = `New enquiry — ${input.name} · ${projectType}${input.budget ? ` · ${budget}` : ''}`;

  const body = `
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${INK};">New enquiry</p>
    <h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;">${esc(input.name)} wants to talk about ${esc(projectType.toLowerCase())}.</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eaeae6;margin-bottom:24px;">
      ${detailRow('Email', `<a href="mailto:${esc(input.email)}" style="color:${BLACK};">${esc(input.email)}</a>`)}
      ${input.phone ? detailRow('Phone', `<a href="tel:${esc(input.phone)}" style="color:${BLACK};">${esc(input.phone)}</a>`) : ''}
      ${input.company ? detailRow('Company', esc(input.company)) : ''}
      ${detailRow('Project type', esc(projectType))}
      ${input.budget ? detailRow('Budget', esc(budget)) : ''}
      ${input.location ? detailRow('Location', esc(input.location)) : ''}
    </table>

    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${INK};">What they wrote</p>
    <div style="background:#fafaf8;border-left:3px solid ${GOLD};padding:16px 18px;border-radius:0 6px 6px 0;font-size:15px;">
      ${paragraphs(input.message)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td style="background:${BLACK};border-radius:6px;">
          <a href="mailto:${esc(input.email)}?subject=Re:%20your%20enquiry%20to%20DICKALO"
             style="display:inline-block;padding:13px 26px;color:${GOLD};font-size:15px;font-weight:600;text-decoration:none;">
            Reply to ${esc(input.name.split(' ')[0] ?? input.name)}
          </a>
        </td>
      </tr>
    </table>`;

  const footer = `Sent from the contact form on ${esc(siteConfig.url)}. Reply-to is set to the sender, so hitting Reply goes straight to them.`;

  const text = [
    `New enquiry from ${input.name}`,
    '',
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : '',
    input.company ? `Company: ${input.company}` : '',
    `Project type: ${projectType}`,
    input.budget ? `Budget: ${budget}` : '',
    input.location ? `Location: ${input.location}` : '',
    '',
    'Message:',
    input.message,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html: shell(subject, body, footer), text };
}

// ---------------------------------------------------------------------------
// Visitor acknowledgement
// ---------------------------------------------------------------------------

export function buildAcknowledgement(input: ContactInput): { subject: string; html: string; text: string } {
  const firstName = input.name.split(' ')[0] ?? input.name;
  const subject = 'We have your enquiry — DICKALO';

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Thanks, ${esc(firstName)}. We have it.</h1>

    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">
      Your message is with the studio. Someone who can actually answer it — not an
      auto-responder — will reply ${esc(siteConfig.contact.responseTime)}.
    </p>

    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${INK};">What you sent us</p>
    <div style="background:#fafaf8;border-left:3px solid ${GOLD};padding:16px 18px;border-radius:0 6px 6px 0;font-size:15px;color:#33332F;">
      ${paragraphs(input.message)}
    </div>

    <p style="margin:24px 0 0;font-size:16px;line-height:1.65;">
      If anything has changed since you wrote, just reply to this email and it will
      reach the same person.
    </p>

    <p style="margin:24px 0 0;font-size:16px;line-height:1.65;">
      — The team at DICKALO<br>
      <span style="color:${INK};font-size:14px;">${esc(siteConfig.address.street)}, ${esc(siteConfig.address.district)}, ${esc(siteConfig.address.city)}</span>
    </p>`;

  const footer = `You are receiving this because you sent an enquiry through ${esc(siteConfig.url)}. We only use your details to answer it.`;

  const text = [
    `Thanks, ${firstName}. We have it.`,
    '',
    `Your message is with the studio. Someone will reply ${siteConfig.contact.responseTime}.`,
    '',
    'What you sent us:',
    input.message,
    '',
    '— The team at DICKALO',
    `${siteConfig.address.street}, ${siteConfig.address.district}, ${siteConfig.address.city}`,
  ].join('\n');

  return { subject, html: shell(subject, body, footer), text };
}

// ---------------------------------------------------------------------------
// Newsletter welcome
// ---------------------------------------------------------------------------

export function buildSubscribeWelcome(email: string): { subject: string; html: string; text: string } {
  const subject = 'You are on the list — DICKALO';

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">You are on the list.</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.65;">
      We email when a building finishes. That is roughly twice a year. No
      newsletters, no offers, no drip campaign.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.65;">
      Until then, our finished work lives at
      <a href="${esc(siteConfig.url)}/projects" style="color:${BLACK};font-weight:600;">${esc(siteConfig.url.replace(/^https?:\/\//, ''))}/projects</a>.
    </p>`;

  const footer = `Sent to ${esc(email)} because you subscribed at ${esc(siteConfig.url)}. Reply "unsubscribe" and you are off the list the same day.`;

  const text = `You are on the list.\n\nWe email when a building finishes — roughly twice a year. No newsletters, no offers.\n\nOur finished work: ${siteConfig.url}/projects`;

  return { subject, html: shell(subject, body, footer), text };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

/**
 * Send one email. Never throws: a failed send is reported to the caller so the
 * enquiry can still be stored and the visitor still sees a success state.
 */
async function send(options: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY is not set; skipping send.', { subject: options.subject });
    return { ok: false, error: 'Email is not configured.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('[email] send failed', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    console.error('[email] send threw', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown email error.' };
  }
}

/**
 * Send both enquiry emails. The studio notification is the one that matters, so
 * its result determines `ok`; a failed acknowledgement is logged and tolerated.
 */
export async function sendContactEmails(input: ContactInput): Promise<SendResult> {
  const notification = buildStudioNotification(input);
  const acknowledgement = buildAcknowledgement(input);

  const [studio, visitor] = await Promise.all([
    send({
      to: TO,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      replyTo: input.email,
    }),
    send({
      to: input.email,
      subject: acknowledgement.subject,
      html: acknowledgement.html,
      text: acknowledgement.text,
      replyTo: TO,
    }),
  ]);

  if (!visitor.ok) {
    console.warn('[email] acknowledgement failed but enquiry was delivered.', visitor.error);
  }

  return studio;
}

export async function sendSubscribeWelcome(email: string): Promise<SendResult> {
  const message = buildSubscribeWelcome(email);
  return send({ to: email, subject: message.subject, html: message.html, text: message.text });
}
