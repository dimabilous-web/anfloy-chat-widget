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

const SUGGESTED_TOPICS = [
  { emoji: '⚡', label: 'AI Sales Agents', prompt: 'Tell me about your AI Sales Agents' },
  { emoji: '📝', label: 'Content Engines', prompt: 'How do your Content Engines work?' },
  { emoji: '📚', label: 'Knowledge Bases', prompt: 'What is an Internal Knowledge Base?' },
  { emoji: '💬', label: 'AI Chat Assistants', prompt: 'Tell me about the AI Chat Assistant you build' },
]

export default function Widget() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hi there 👋 I'm Anfloy's AI assistant. Ask me anything about our services, or book a free strategy call with Dima.",
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [helpSearch, setHelpSearch] = useState('')
  const [helpView, setHelpView] = useState<HelpView>('list')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim(), id: Date.now().toString() }
    const assistantId = (Date.now() + 1).toString()

    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '', id: assistantId }])
    setInput('')
    setIsStreaming(true)
    setActiveTab('messages')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error('API error')
      if (!res.body) throw new Error('No body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, content: accumulated } : m))
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I hit a snag. Try again or email dimabilous@anfloy.com" }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const collection = helpCollections.find(c => c.id === activeCollection)
  const article = collection?.articles.find(a => a.id === activeArticle)

  const filteredCollections = helpSearch
    ? helpCollections.filter(
        c =>
          c.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
          c.articles.some(a => a.title.toLowerCase().includes(helpSearch.toLowerCase()))
      )
    : helpCollections

  return (
    <div className="widget-root">
      {/* Header */}
      <div className="widget-header">
        <div className="header-left">
          <div className="logo-wrap">
            <Image src="/logo.png" alt="Anfloy" width={28} height={28} className="logo-img" />
          </div>
          <div>
            <div className="header-brand">anfloy.</div>
            <div className="header-status">
              <span className="status-dot" />
              AI Assistant online
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="widget-body">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="tab-content">
            <div className="home-hero">
              <div className="home-logo-wrap">
                <Image src="/logo.png" alt="Anfloy" width={48} height={48} className="home-logo" />
              </div>
              <h2 className="home-greeting">Hey there 👋</h2>
              <p className="home-sub">How can we help you today?</p>
            </div>

            <button
              className="cta-button"
              onClick={() => {
                setActiveTab('messages')
                setTimeout(() => inputRef.current?.focus(), 100)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send us a message
            </button>

            <div className="section-label">Our Services</div>
            <div className="topics-grid">
              {SUGGESTED_TOPICS.map(t => (
                <button
                  key={t.label}
                  className="topic-card"
                  onClick={() => sendMessage(t.prompt)}
                >
                  <span className="topic-emoji">{t.emoji}</span>
                  <span className="topic-label">{t.label}</span>
                  <svg className="topic-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="home-footer-link">
              <button onClick={() => setActiveTab('help')} className="link-btn">
                Browse Help Center →
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="messages-wrap">
            <div className="messages-list">
              {messages.map(m => (
                <div key={m.id} className={`msg-row ${m.role}`}>
                  {m.role === 'assistant' && (
                    <div className="bot-avatar">
                      <Image src="/logo.png" alt="Anfloy" width={20} height={20} />
                    </div>
                  )}
                  <div className={`bubble ${m.role}`}>
                    {m.content || (
                      <span className="typing-dots">
                        <span />
                        <span />
                        <span />
                      </span>
                    )}
                    {m.content?.includes('cal.com/anfloy') && (
                      <a
                        href="https://cal.com/anfloy/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-link"
                      >
                        📅 Book a free 30-min call →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-form">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* HELP TAB */}
        {activeTab === 'help' && (
          <div className="tab-content">
            {helpView === 'list' && (
              <>
                <div className="help-header">
                  <h3 className="section-title">Help Center</h3>
                  <div className="search-wrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search help articles..."
                      value={helpSearch}
                      onChange={e => setHelpSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                <div className="collections-list">
                  {filteredCollections.map(c => (
                    <button
                      key={c.id}
                      className="collection-card"
                      onClick={() => {
                        setActiveCollection(c.id)
                        setHelpView('collection')
                      }}
                    >
                      <span className="coll-emoji">{c.emoji}</span>
                      <div className="coll-info">
                        <div className="coll-title">{c.title}</div>
                        <div className="coll-desc">{c.articles.length} articles</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}

            {helpView === 'collection' && collection && (
              <>
                <button className="back-btn" onClick={() => setHelpView('list')}>
                  ← Back
                </button>
                <div className="coll-header">
                  <span className="coll-header-emoji">{collection.emoji}</span>
                  <h3 className="section-title">{collection.title}</h3>
                  <p className="coll-header-desc">{collection.description}</p>
                </div>
                <div className="articles-list">
                  {collection.articles.map(a => (
                    <button
                      key={a.id}
                      className="article-card"
                      onClick={() => {
                        setActiveArticle(a.id)
                        setHelpView('article')
                      }}
                    >
                      <div>
                        <div className="article-title">{a.title}</div>
                        <div className="article-excerpt">{a.excerpt}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}

            {helpView === 'article' && article && (
              <>
                <button className="back-btn" onClick={() => setHelpView('collection')}>
                  ← Back
                </button>
                <div className="article-full">
                  <h3 className="article-full-title">{article.title}</h3>
                  <p className="article-full-content">{article.content}</p>
                  <div className="article-cta">
                    <p className="article-cta-text">Still have questions?</p>
                    <button
                      className="cta-button small"
                      onClick={() => {
                        setActiveTab('messages')
                        sendMessage(`I have a question about: ${article.title}`)
                      }}
                    >
                      Ask our AI →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* RESOURCES TAB */}
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
                    <button
                      className="link-btn"
                      onClick={() => {
                        setActiveTab('messages')
                        sendMessage(`Tell me more about: ${post.title}`)
                      }}
                    >
                      Learn more →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="widget-nav">
        {(
          [
            {
              tab: 'home',
              label: 'Home',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
            {
              tab: 'messages',
              label: 'Messages',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
            {
              tab: 'help',
              label: 'Help',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ),
            },
            {
              tab: 'resources',
              label: 'Resources',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              ),
            },
          ] as Array<{ tab: Tab; label: string; icon: React.ReactNode }>
        ).map(({ tab, label, icon }) => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab)
              if (tab !== 'help') {
                setHelpView('list')
              }
            }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
