import { NextRequest } from 'next/server'

interface LeadData {
  name: string
  email: string
  message?: string
  capturedAt: string
  source: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email) {
      return Response.json({ error: 'Name and email required' }, { status: 400 })
    }

    const lead: LeadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message?.trim() || '',
      capturedAt: new Date().toISOString(),
      source: 'anfloy-chat-widget',
    }

    // Log for Vercel function logs (always visible in Vercel dashboard)
    console.log('[LEAD CAPTURED]', JSON.stringify(lead))

    // ── Option 1: Webhook (Make.com, Zapier, Slack, etc.) ──
    const webhookUrl = process.env.LEAD_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      }).catch(e => console.error('[LEAD] Webhook failed:', e))
    }

    // ── Option 2: Slack notification ──
    const slackWebhook = process.env.LEAD_SLACK_WEBHOOK
    if (slackWebhook) {
      const slackMsg = {
        text: `🔥 New lead from Anfloy chat widget!\n*Name:* ${lead.name}\n*Email:* ${lead.email}${lead.message ? `\n*Message:* ${lead.message}` : ''}\n*Time:* ${new Date(lead.capturedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
      }
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMsg),
      }).catch(e => console.error('[LEAD] Slack webhook failed:', e))
    }

    // ── Option 3: Email via Resend ──
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // onboarding@resend.dev works without domain verification on free tier
          from: 'Anfloy Widget <onboarding@resend.dev>',
          to: ['dimabilous@anfloy.com'],
          subject: `🔥 New lead from chat widget: ${lead.name}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #5A1E00, #FF6820); padding: 24px 28px;">
                <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">anfloy.</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">New lead from chat widget</div>
              </div>
              <div style="padding: 28px; background: #111;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #888; font-size: 13px; width: 80px;">Name</td>
                    <td style="padding: 10px 0; color: #fff; font-size: 14px; font-weight: 600;">${lead.name}</td>
                  </tr>
                  <tr style="border-top: 1px solid #222;">
                    <td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td>
                    <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${lead.email}" style="color: #FF6820; text-decoration: none; font-weight: 600;">${lead.email}</a></td>
                  </tr>
                  ${lead.message ? `<tr style="border-top: 1px solid #222;"><td style="padding: 10px 0; color: #888; font-size: 13px;">Message</td><td style="padding: 10px 0; color: #ccc; font-size: 14px;">${lead.message}</td></tr>` : ''}
                  <tr style="border-top: 1px solid #222;">
                    <td style="padding: 10px 0; color: #888; font-size: 13px;">Time</td>
                    <td style="padding: 10px 0; color: #888; font-size: 13px;">${new Date(lead.capturedAt).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })} ET</td>
                  </tr>
                </table>
                <div style="margin-top: 24px;">
                  <a href="mailto:${lead.email}" style="display: inline-block; background: #FF6820; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">Reply to ${lead.name} →</a>
                </div>
              </div>
            </div>
          `,
        }),
      })
      if (!resendRes.ok) {
        const err = await resendRes.text()
        console.error('[LEAD] Resend error:', err)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[LEAD] Error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
