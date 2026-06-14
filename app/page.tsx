import Link from 'next/link'
import {
  ArrowRight,
  Network,
  BrainCircuit,
  ShieldCheck,
  Activity,
  LineChart,
  CircleDollarSign,
  AlertTriangle,
  Lock,
  Bot,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { HeroPipeline } from '@/components/landing/hero-pipeline'
import { LivePreview } from '@/components/landing/live-preview'
import { SiteFooter } from '@/components/site-footer'

const WHY_CARDS = [
  {
    icon: Activity,
    title: 'Market opportunities are noisy',
    body: 'Perp microstructure is fast and easy to misread. Raw signals rarely justify execution on their own.',
  },
  {
    icon: BrainCircuit,
    title: 'LLMs are creative but unsafe alone',
    body: 'The LLM transforms market state into conditional strategy templates, but creativity needs guardrails.',
  },
  {
    icon: ShieldCheck,
    title: 'Verifiers reject bad strategies',
    body: 'Formal checks, cost/risk gates, and walk-forward evidence block weak trades before any execution.',
  },
]

const PIPELINE_STAGES = [
  { n: 1, label: 'Data ingestion', icon: Network },
  { n: 2, label: 'Market features', icon: LineChart },
  { n: 3, label: 'Direction & sentiment', icon: Activity },
  { n: 4, label: 'LLM strategy generation', icon: BrainCircuit },
  { n: 5, label: 'Formal verification', icon: ShieldCheck },
  { n: 6, label: 'Scenario & risk validation', icon: AlertTriangle },
  { n: 7, label: 'Walk-forward / overfit', icon: LineChart },
  { n: 8, label: 'Portfolio decision', icon: CircleDollarSign },
  { n: 9, label: 'Paper execution', icon: Lock },
]

const ARCH_LAYERS = [
  { label: 'Frontend', value: 'Next.js · v0 · Vercel', icon: LineChart, tone: 'text-xcyan' },
  { label: 'Backend', value: 'FastAPI xZro agent', icon: Bot, tone: 'text-xaccent-strong' },
  { label: 'Venues', value: 'Orderly / Mantle · Hyperliquid', icon: Network, tone: 'text-xtext-soft' },
  { label: 'AI', value: 'SiliconFlow DeepSeek + Elfa', icon: BrainCircuit, tone: 'text-xviolet' },
  { label: 'Safety', value: 'Deterministic verifier', icon: ShieldCheck, tone: 'text-xaccent-strong' },
]

export default function LandingPage() {
  return (
    <div className="grid-bg relative min-h-screen">
      <LandingNav />

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-[1240px] px-4 pb-20 pt-16 sm:px-6 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-xborder bg-xpanel-2 px-3 py-1 font-mono text-xs text-xaccent-strong">
                Turing Hack 2026 · Track 1
              </span>
              <h1 className="mt-6 text-balance font-heading text-4xl font-bold leading-tight tracking-tight text-xtext sm:text-5xl md:text-6xl">
                AI strategy generation, governed by deterministic verification.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-xtext-soft md:text-lg">
                xZro scans perp markets, asks an LLM to propose conditional strategies, then lets
                formal checks, cost/risk gates, and paper execution decide whether anything is
                worth trading.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app/run"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Run Agent Cycle
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#pipeline"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-xborder bg-transparent px-6 py-3 text-sm font-semibold text-xtext-soft transition-colors hover:border-xborder-strong hover:text-xtext"
                >
                  View Pipeline
                </a>
              </div>
              <p className="mt-6 font-mono text-xs text-xtext-muted">
                AI proposes. The verifier decides. Paper execution only — no real funds are moved.
              </p>
            </div>

            <HeroPipeline />
          </div>

          <div className="mt-12">
            <LivePreview />
          </div>
        </section>

        {/* Why xZro */}
        <section id="why" className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-xtext md:text-3xl">Why xZro</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-xtext-muted">
            Built for agentic strategy research, not blind automation.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {WHY_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="x-panel rounded-2xl p-6">
                  <span className="grid size-11 place-items-center rounded-xl border border-xborder bg-xpanel-2 text-xaccent-strong">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-xtext">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-xtext-muted">{card.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Pipeline */}
        <section id="pipeline" className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-xtext md:text-3xl">
            The verification pipeline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-xtext-muted">
            Every cycle flows through nine deterministic stages. A trade only appears if a
            candidate survives all of them.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.n}
                  className="x-panel flex items-center gap-4 rounded-2xl p-5"
                >
                  <span className="font-mono text-sm text-xtext-muted">
                    {String(stage.n).padStart(2, '0')}
                  </span>
                  <span className="grid size-10 place-items-center rounded-xl border border-xborder bg-xpanel-2 text-xaccent-strong">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-medium text-xtext-soft">{stage.label}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-xtext md:text-3xl">
            Hackathon architecture
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {ARCH_LAYERS.map((layer) => {
              const Icon = layer.icon
              return (
                <div key={layer.label} className="x-panel rounded-2xl p-5">
                  <Icon className={`size-5 ${layer.tone}`} strokeWidth={1.5} />
                  <p className="mt-3 text-xs uppercase tracking-wide text-xtext-muted">
                    {layer.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-xtext-soft">{layer.value}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <div className="x-panel x-glow flex flex-col items-center gap-6 rounded-3xl px-6 py-14 text-center">
            <h2 className="max-w-2xl text-balance font-heading text-3xl font-semibold text-xtext md:text-4xl">
              Run the agent. Watch it reject bad trades.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-xtext-muted">
              No trade is a valid outcome. xZro is designed to refuse weak edges as confidently as
              it executes strong ones.
            </p>
            <Link
              href="/app/run"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Run Agent Cycle
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
