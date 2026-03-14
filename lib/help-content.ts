export interface HelpArticle {
  id: string
  title: string
  excerpt: string
  content: string
}

export interface HelpCollection {
  id: string
  title: string
  emoji: string
  description: string
  articles: HelpArticle[]
}

export const helpCollections: HelpCollection[] = [
  {
    id: 'about',
    title: 'What is Anfloy?',
    emoji: '🏢',
    description: 'Learn about who we are and how we work',
    articles: [
      {
        id: 'about-1',
        title: 'What Anfloy builds and how we work',
        excerpt: 'Custom AI systems, built and owned by you.',
        content: 'Anfloy builds custom AI agent systems, automation infrastructure, and AI-powered software. Everything we build is 100% client-owned — the code, the agents, the infrastructure. No black boxes, no vendor lock-in.',
      },
      {
        id: 'about-2',
        title: 'Our 3-step process',
        excerpt: 'Discovery → Build → Launch in 2–3 weeks.',
        content: 'We start with a Strategic Discovery call to understand your processes and identify the highest-ROI automation opportunities. Then we build and train your custom AI systems. Then we deploy, train your team, and continuously optimize.',
      },
      {
        id: 'about-3',
        title: 'What makes Anfloy different?',
        excerpt: 'Custom systems, full ownership, real ROI.',
        content: 'Unlike generic AI tools or expensive agencies, Anfloy delivers custom AI automation built specifically for your business. You own everything. Average build time is 2–3 weeks. Average ROI in year 1 is 3x+.',
      },
    ],
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    emoji: '⚡',
    description: 'Sales, operations, and customer experience agents',
    articles: [
      {
        id: 'agents-1',
        title: 'Sales & Revenue Agents',
        excerpt: 'Agents that fill your pipeline automatically.',
        content: 'Signal-Based Prospecting, Inbound Lead Routing, Pre-Call Research, Proposal Generation, Follow-Up & Nurture. These agents monitor signals, enrich contacts, write personalised outreach, and route leads — all on autopilot.',
      },
      {
        id: 'agents-2',
        title: 'Internal Operations Agents',
        excerpt: 'Eliminate the manual work eating your team\'s time.',
        content: 'Meeting notes & CRM updates, reporting & data sync, client onboarding automation, internal knowledge bases. Clients typically save 10–20 hours per week on admin.',
      },
      {
        id: 'agents-3',
        title: 'Customer Experience Agents',
        excerpt: 'Faster responses, better retention.',
        content: 'AI Chat Assistants, Renewal & Retention Agents, Feedback & Review Agents. These systems improve how customers interact with your business — available 24/7, consistent quality.',
      },
      {
        id: 'agents-4',
        title: 'How long does it take to deploy an agent?',
        excerpt: '2–3 weeks from discovery to live.',
        content: 'Most agent builds take 2–3 weeks from the initial discovery call to live deployment. More complex multi-agent systems may take longer. We\'ll scope it clearly before starting.',
      },
    ],
  },
  {
    id: 'content-engines',
    title: 'Content Engines',
    emoji: '📝',
    description: 'AI-powered content pipelines for LinkedIn & Instagram',
    articles: [
      {
        id: 'content-1',
        title: 'What is a Content Engine?',
        excerpt: 'Weekly content ideas generated automatically from trending topics.',
        content: 'A Content Engine is an automated pipeline that monitors trending posts and topics in your industry, identifies the best content opportunities, and generates LinkedIn and Instagram content ideas weekly — tailored to your brand voice.',
      },
      {
        id: 'content-2',
        title: 'How does content get generated?',
        excerpt: 'Trending topics → AI-generated ideas → delivered weekly.',
        content: 'The system ingests trending posts from LinkedIn, Reddit, industry RSS feeds, and Twitter. It scores by engagement, extracts top themes, then uses AI to generate post ideas for each platform — with hooks, body angle, CTA, and hashtags. Delivered to a Google Sheet or Notion database.',
      },
    ],
  },
  {
    id: 'knowledge-bases',
    title: 'Knowledge Bases',
    emoji: '📚',
    description: 'Custom AI trained on your internal docs and SOPs',
    articles: [
      {
        id: 'kb-1',
        title: 'What is an Internal Knowledge Base?',
        excerpt: 'Your company\'s brain, powered by AI.',
        content: 'A custom AI trained on your internal playbooks, process docs, and SOPs. Your team asks questions in plain language and gets accurate, sourced answers — instead of digging through shared drives or waiting for colleagues.',
      },
      {
        id: 'kb-2',
        title: 'What results can I expect?',
        excerpt: '80% fewer internal interruptions. Faster onboarding.',
        content: 'Clients typically see 80% fewer internal questions to senior staff, significantly faster onboarding for new hires, and better preservation of tribal knowledge. It connects to your existing tools (Notion, Google Drive, Confluence, etc.).',
      },
    ],
  },
  {
    id: 'demo',
    title: 'Book a Demo',
    emoji: '📅',
    description: 'Schedule a free 30-min strategy call',
    articles: [
      {
        id: 'demo-1',
        title: 'Book a free 30-minute strategy call',
        excerpt: 'Walk away with a custom AI roadmap.',
        content: 'Book a free 30-minute call with Dima to discuss your processes, identify automation opportunities, and get a tailored AI roadmap. No sales pressure — just a strategic conversation. Book at cal.com/anfloy/30min',
      },
    ],
  },
]

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'How a Barbershop Cut Admin Time by 10+ Hours a Week with AI',
    excerpt: 'A full AI call-handler that books appointments, answers FAQs, and texts clients — automatically.',
    category: 'Case Study',
    readTime: '3 min read',
    date: 'Mar 2025',
  },
  {
    id: 'blog-2',
    title: 'Signal-Based Prospecting: From 2% to 7% Reply Rates',
    excerpt: 'How monitoring funding rounds and hiring signals transformed outbound for a B2B sales team.',
    category: 'Sales Agents',
    readTime: '4 min read',
    date: 'Feb 2025',
  },
  {
    id: 'blog-3',
    title: 'The Inbound Lead Router: How to Respond in Under 60 Seconds',
    excerpt: '5x faster lead response, 3x more meetings booked monthly. Here\'s how it works.',
    category: 'Automation',
    readTime: '3 min read',
    date: 'Feb 2025',
  },
  {
    id: 'blog-4',
    title: 'Why We Build Custom Instead of Using Off-the-Shelf AI Tools',
    excerpt: 'Generic tools hit generic ceilings. Here\'s the Anfloy philosophy on ownership and custom systems.',
    category: 'Philosophy',
    readTime: '5 min read',
    date: 'Jan 2025',
  },
]
