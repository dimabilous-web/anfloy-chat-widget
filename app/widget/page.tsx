'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { helpCollections } from '@/lib/help-content'

// Resources tab = renamed Help tab (blog/Resources tab deleted)
type Tab = 'home' | 'messages' | 'resources'
type HelpView = 'list' | 'collection' | 'article'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface LeadFormMessage {
  type: 'lead-form'
  id: string
  submitted: boolean
}

type Message = ChatMessage | LeadFormMessage

function isChat(m: Message): m is ChatMessage {
  return (m as ChatMessage).role !== undefined
}

const SERVICES = [
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    label: 'AI Sales Agents',    prompt: 'Tell me about AI Sales Agents',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    label: 'Content Engines',    prompt: 'How do Content Engines work?',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    label: 'Knowledge Bases',    prompt: 'What is an Internal Knowledge Base?',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    label: 'AI Chat Assistants', prompt: 'Tell me about the AI Chat Assistants you build',
  },
]

const ChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
)
const ChevronLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
)

// Strip [LEAD: ...] tags from AI output before display
function stripLeadTag(text: string): string {
  return text.replace(/\[LEAD:[^\]]*\]/g, '').trim()
}

// Extract lead data from AI message
function extractLead(text: string): { name: string; email: string } | null {
  const match = text.match(/\[LEAD:\s*name="([^"]+)"\s*email="([^"]+)"\]/)
  if (match) return { name: match[1], email: match[2] }
  return null
}

export default function Widget() {
  const [activeTab, setActiveTab]     = useState<Tab>('home')
  const [messages, setMessages]       = useState<Message[]>([{
    id: 'init', role: 'assistant',
    content: "Hey! I'm Anfloy's AI. Ask me anything about what we build, or just tell me what problem you're trying to solve.",
  } as ChatMessage])
  const [input, setInput]             = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [leadShown, setLeadShown]     = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [helpView, setHelpView]       = useState<HelpView>('list')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [activeArticle, setActiveArticle]       = useState<string | null>(null)
  const [helpSearch, setHelpSearch]   = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), id: Date.now().toString() }
    const asstId = (Date.now() + 1).toString()
    const newExchangeCount = exchangeCount + 1

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: asstId } as ChatMessage])
    setInput('')
    setIsStreaming(true)
    setActiveTab('messages')
    setExchangeCount(newExchangeCount)

    try {
      const chatHistory = messages
        .filter(isChat)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatHistory, { role: userMsg.role, content: userMsg.content }] }),
      })
      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          isChat(m) && m.id === asstId ? { ...m, content: buf } : m
        ))
      }

      // Auto-submit lead if AI collected it
      const lead = extractLead(buf)
      if (lead && !leadSubmitted) {
        setLeadSubmitted(true)
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: lead.name, email: lead.email }),
        }).catch(() => {})
      }

      // Show lead form card after 2nd exchange (if not yet shown/submitted)
      if (newExchangeCount === 2 && !leadShown && !leadSubmitted) {
        setLeadShown(true)
        setMessages(prev => [...prev, { type: 'lead-form', id: `lead-${Date.now()}`, submitted: false }])
      }
    } catch {
      setMessages(prev => prev.map(m =>
        isChat(m) && m.id === asstId
          ? { ...m, content: "Something went wrong on my end — email dimabilous@anfloy.com and Dima will sort you out." }
          : m
      ))
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, messages, exchangeCount, leadShown, leadSubmitted])

  const collection = helpCollections.find(c => c.id === activeCollection)
  const article    = collection?.articles.find(a => a.id === activeArticle)
  const filteredCollections = helpSearch
    ? helpCollections.filter(c =>
        c.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
        c.articles.some(a => a.title.toLowerCase().includes(helpSearch.toLowerCase()))
      )
    : helpCollections

  const navTo = (tab: Tab) => {
    setActiveTab(tab)
    if (tab !== 'resources') setHelpView('list')
  }

  return (
    <div className="widget-root">

      {/* ── HEADER ── */}
      <header className="widget-header">
        <div className="header-brand">
          <Image src="/logo.png" alt="anfloy" width={30} height={30} className="header-logo" />
          <span className="header-name">anfloy.</span>
        </div>
        <div className="header-right">
          <div className="avatar-stack">
            <div className="avatar avatar-1">D</div>
            <div className="avatar avatar-2">A</div>
            <div className="avatar avatar-3">AI</div>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="widget-body">

        {/* ═══ HOME ═══ */}
        {activeTab === 'home' && (
          <div className="tab-content">
            <h2 className="home-greeting">Hi there 👋</h2>
            <p className="home-subtitle">How can we help you today?</p>

            <button
              className="send-msg-card"
              onClick={() => { setActiveTab('messages'); setTimeout(() => inputRef.current?.focus(), 80) }}
            >
              <div className="smc-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <div className="smc-text">
                <div className="smc-title">Send us a message</div>
                <div className="smc-sub">We typically reply instantly</div>
              </div>
              <span className="smc-chevron"><ChevronRight size={16} /></span>
            </button>

            <div className="status-row">
              <span className="status-dot" />
              <span className="status-text">Status: AI is online 24/7</span>
            </div>

            <div className="search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                placeholder="Search for help..."
                onKeyDown={e => {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (e.key === 'Enter' && val) sendMessage(`Help me with: ${val}`)
                }}
              />
            </div>

            <div className="section-label">Our Services</div>
            <div className="service-rows">
              {SERVICES.map(s => (
                <button key={s.label} className="service-row" onClick={() => sendMessage(s.prompt)}>
                  <div className="row-icon-box" style={{ color: 'var(--orange)' }}>{s.icon}</div>
                  <span className="row-label">{s.label}</span>
                  <span className="row-chevron"><ChevronRight /></span>
                </button>
              ))}
            </div>

            <p className="powered-by">Powered by <strong>anfloy.</strong></p>
          </div>
        )}

        {/* ═══ MESSAGES ═══ */}
        {activeTab === 'messages' && (
          <div className="messages-wrap">
            <div className="messages-list">
              {messages.map(m => {
                // Lead form card
                if (!isChat(m)) {
                  return (
                    <LeadFormCard
                      key={m.id}
                      messageId={m.id}
                      submitted={leadSubmitted}
                      onSubmit={async (name, email) => {
                        setLeadSubmitted(true)
                        setMessages(prev => prev.map(msg =>
                          !isChat(msg) && msg.id === m.id ? { ...msg, submitted: true } : msg
                        ))
                        await fetch('/api/lead', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name, email }),
                        })
                      }}
                    />
                  )
                }

                const displayContent = stripLeadTag(m.content)

                return (
                  <div key={m.id} className={`msg-row ${m.role}`}>
                    {m.role === 'assistant' && (
                      <div className="bot-avatar">
                        <Image src="/logo.png" alt="anfloy" width={16} height={16} style={{ filter: 'invert(1)', opacity: 0.9 }} />
                      </div>
                    )}
                    <div className={`bubble ${m.role}`}>
                      {displayContent ? (
                        <>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{displayContent}</span>
                          {displayContent.includes('cal.com/anfloy') && (
                            <a href="https://cal.com/anfloy/30min" target="_blank" rel="noopener noreferrer" className="book-link">
                              📅 Book a free 30-min call →
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="typing-dots"><span /><span /><span /></span>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="input-form" onSubmit={e => { e.preventDefault(); sendMessage(input) }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="chat-input"
                disabled={isStreaming}
              />
              <button type="submit" disabled={isStreaming || !input.trim()} className="send-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* ═══ RESOURCES (formerly Help) ═══ */}
        {activeTab === 'resources' && (
          <div className="tab-content">
            {helpView === 'list' && (
              <>
                <div className="help-header">
                  <h3 className="section-title">Resources</h3>
                  <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      className="search-input"
                      placeholder="Search articles..."
                      value={helpSearch}
                      onChange={e => setHelpSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="collections-list">
                  {filteredCollections.map(c => (
                    <button key={c.id} className="collection-card"
                      onClick={() => { setActiveCollection(c.id); setHelpView('collection') }}>
                      <span className="coll-emoji">{c.emoji}</span>
                      <div className="coll-info">
                        <div className="coll-title">{c.title}</div>
                        <div className="coll-desc">{c.articles.length} articles</div>
                      </div>
                      <ChevronRight />
                    </button>
                  ))}
                </div>
              </>
            )}

            {helpView === 'collection' && collection && (
              <>
                <button className="back-btn" onClick={() => setHelpView('list')}>
                  <ChevronLeft /> Back
                </button>
                <div className="coll-header">
                  <span className="coll-header-emoji">{collection.emoji}</span>
                  <h3 className="section-title">{collection.title}</h3>
                  <p className="coll-header-desc">{collection.description}</p>
                </div>
                <div className="articles-list">
                  {collection.articles.map(a => (
                    <button key={a.id} className="article-card"
                      onClick={() => { setActiveArticle(a.id); setHelpView('article') }}>
                      <div>
                        <div className="article-title">{a.title}</div>
                        <div className="article-excerpt">{a.excerpt}</div>
                      </div>
                      <ChevronRight />
                    </button>
                  ))}
                </div>
              </>
            )}

            {helpView === 'article' && article && (
              <>
                <button className="back-btn" onClick={() => setHelpView('collection')}>
                  <ChevronLeft /> Back
                </button>
                <div className="article-full">
                  <h3 className="article-full-title">{article.title}</h3>
                  <p className="article-full-content">{article.content}</p>
                  <div className="article-cta">
                    <p className="article-cta-text">Still have questions?</p>
                    <button className="cta-btn-small"
                      onClick={() => { setActiveTab('messages'); sendMessage(`Question about: ${article.title}`) }}>
                      Ask our AI →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV (3 tabs) ── */}
      <nav className="widget-nav">
        {([
          { tab: 'home', label: 'Home',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { tab: 'messages', label: 'Messages',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { tab: 'resources', label: 'Resources',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
        ] as Array<{ tab: Tab; label: string; icon: React.ReactNode }>).map(({ tab, label, icon }) => (
          <button key={tab} className={`nav-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => navTo(tab)}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ── Lead Form Card Component ── */
function LeadFormCard({ messageId, submitted, onSubmit }: {
  messageId: string
  submitted: boolean
  onSubmit: (name: string, email: string) => Promise<void>
}) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(submitted)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    await onSubmit(name.trim(), email.trim())
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="lead-card success">
        <div className="lead-success-icon">✓</div>
        <div>
          <div className="lead-success-title">Got it, {name || 'thanks'}!</div>
          <div className="lead-success-sub">Dima will reach out personally.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div className="lead-card-title">Stay in touch</div>
        <div className="lead-card-sub">Drop your details and Dima will follow up personally.</div>
      </div>
      <form className="lead-form" onSubmit={handleSubmit}>
        <input
          className="lead-input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="lead-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className="lead-form-actions">
          <button type="submit" className="lead-submit-btn" disabled={loading || !name || !email}>
            {loading ? 'Sending...' : 'Send →'}
          </button>
          <a
            href="https://cal.com/anfloy/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="lead-cal-btn"
          >
            📅 Book a call instead
          </a>
        </div>
      </form>
    </div>
  )
}
