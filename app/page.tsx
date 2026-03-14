import Widget from './widget/page'

export default function DemoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,104,32,0.15) 0%, transparent 60%), linear-gradient(180deg, #160B04 0%, #0A0A0A 50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      gap: '24px',
    }}>
      {/* Label above */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,104,32,0.7)' }}>
          Live Preview
        </span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
          Anfloy Chat Widget
        </span>
      </div>

      {/* The widget itself */}
      <Widget />

      {/* Embed snippet below */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '14px 20px',
        maxWidth: '380px',
        width: '100%',
      }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
          Embed on any site
        </p>
        <code style={{ fontSize: '11.5px', color: 'rgba(255,104,32,0.85)', wordBreak: 'break-all', display: 'block', lineHeight: 1.6 }}>
          {'<script src="https://anfloy-chat-widget.vercel.app/embed.js"></script>'}
        </code>
      </div>
    </div>
  )
}
