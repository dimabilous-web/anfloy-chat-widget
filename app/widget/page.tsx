'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { helpCollections, blogPosts } from '@/lib/help-content'

type Tab = 'home' | 'messages' | 'help' | 'resources'
type HelpView = 'list' | 'collection' | 'article'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const SERVICES = [
  { emoji: '⚡', label: 'AI Sales Agents',    prompt: 'Tell me about your AI Sales Agents' },
  { emoji: '📝', label: 'Content Engines',    prompt: 'How do your Content Engines work?' },
  { emoji: '📚', label: 'Knowledge Bases',    prompt: 'What is an Internal Knowledge Base?' },
  { emoji: '💬', label: 'AI Chat Assistants', prompt: 'Tell me about the AI Chat Assistant you build' },
]

const ChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const ChevronLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export default function Widget() {
  const [activeTab, setActiveTab]           = useState<Tab>('home')
  const [messages, setMessages]             = useState<Message[]>([{
    id: 'init', role: 'assistant',
    content: "Hi there 👋 I'm Anfloy's AI assistant. Ask me anything about our services, or book a free strategy call with Dima.",
  }])
  const [input, setInput]                   = useState('')
  const [isStreaming, setIsStreaming]       = useState(false)
  const [helpSearch, setHelpSearch]         = useState('')
  const [helpView, setHelpView]             = useState<HelpView>('list')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [activeArticle, setActiveArticle]   = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return
    const userMsg: Message = { role: 'user', content: text.trim(), id: Date.now().toString() }
    const asstId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: asstId }])
    setInput('')
    setIsStreaming(true)
    setActiveTab('messages')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: buf } : m))
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === asstId ? { ...m, content: "Sorry, something went wrong. Email dimabilous@anfloy.com" } : m))
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, messages])

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
    if (tab !== 'help') setHelpView('list')
  }

  return (
    <div className="widget-root">

      {/* ── HEADER ── */}
      <header className="widget-header">
        <div className="header-brand">
          {/* Logo: bare, transparent background, blends with gradient */}
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

            {/* Send us a message card */}
            <button
              className="send-msg-card"
              onClick={() => { setActiveTab('messages'); setTimeout(() => inputRef.current?.focus(), 80) }}
            >
              <div className="smc-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <div className="smc-text">
                <div className="smc-title">Send us a message</div>
                <div className="smc-sub">We typically reply instantly</div>
              </div>
              <span className="smc-chevron">
                <ChevronRight size={16} />
              </span>
            </button>

            {/* Status */}
            <div className="status-row">
              <span className="status-dot" />
              <span className="status-text">Status: AI is online 24/7</span>
            </div>

            {/* Search */}
            <div className="search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                placeholder="Search for help..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    sendMessage(`Help me with: ${(e.target as HTMLInputElement).value.trim()}`)
                  }
                }}
              />
            </div>

            {/* Services list */}
            <div className="section-label">Our Services</div>
            <div className="service-rows">
              {SERVICES.map(s => (
                <button
                  key={s.label}
                  className="service-row"
                  onClick={() => sendMessage(s.prompt)}
                >
                  <div className="row-icon-box">{s.emoji}</div>
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
              {messages.map(m => (
                <div key={m.id} className={`msg-row ${m.role}`}>
                  {m.role === 'assistant' && (
                    <div className="bot-avatar">
                      <Image src="/logo.png" alt="anfloy" width={16} height={16} style={{ filter: 'invert(1)', opacity: 0.9 }} />
                    </div>
                  )}
                  <div className={`bubble ${m.role}`}>
                    {m.content ? (
                      <>
                        {m.content}
                        {m.content.includes('cal.com/anfloy') && (
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
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              className="input-form"
              onSubmit={e => { e.preventDefault(); sendMessage(input) }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about Anfloy..."
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

        {/* ═══ HELP ═══ */}
        {activeTab === 'help' && (
          <div className="tab-content">
            {helpView === 'list' && (
              <>
                <div className="help-header">
                  <h3 className="section-title">Help Center</h3>
                  <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      className="search-input"
                      placeholder="Search help articles..."
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

        {/* ═══ RESOURCES ═══ */}
        {activeTab === 'resources' && (
          <div className="tab-content">
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Latest from Anfloy</h3>
            <div className="blog-list">
              {blogPosts.map(post => (
                <div key={post.id} className="blog-card">
                  <div className="blog-meta">
                    <span className="blog-category">{post.category}</span>
                    <span className="blog-date">{post.date}</span>
                  </div>
                  <div className="blog-title">{post.title}</div>
                  <div className="blog-excerpt">{post.excerpt}</div>
                  <div className="blog-footer">
                    <span className="blog-read">{post.readTime}</span>
                    <button className="link-btn"
                      onClick={() => { setActiveTab('messages'); sendMessage(`Tell me more about: ${post.title}`) }}>
                      Learn more →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="widget-nav">
        {([
          { tab: 'home',      label: 'Home',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { tab: 'messages',  label: 'Messages',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { tab: 'help',      label: 'Help',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
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
