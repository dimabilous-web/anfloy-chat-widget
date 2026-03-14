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
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Anfloy Widget <widget@anfloy.com>',
          to: ['dimabilous@anfloy.com'],
          subject: `New lead: ${lead.name}`,
          html: `
            <h2>New lead from chat widget</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
            ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
            <p><strong>Time:</strong> ${lead.capturedAt}</p>
          `,
        }),
      }).catch(e => console.error('[LEAD] Resend failed:', e))
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[LEAD] Error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
