'use client'
import { Header } from '@/components/dashboard/Header'
import { AgentPanel } from '@/components/agents/AgentPanel'
import Link from 'next/link'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-terminal-bg">
      <Header />
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-terminal-border bg-terminal-surface text-xs font-mono text-terminal-dim">
        <Link href="/dashboard" className="hover:text-terminal-accent transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-terminal-text">Agent Chat</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <AgentPanel />
      </div>
    </div>
  )
}
