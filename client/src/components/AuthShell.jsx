import React from 'react';
import { HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';

const defaultHighlights = [
  {
    icon: ShieldCheck,
    title: 'Trusted Access',
    description: 'Protected authentication flows for patients and healthcare teams.'
  },
  {
    icon: HeartPulse,
    title: 'Unified Care',
    description: 'Appointments, records, payments, and communication in one place.'
  },
  {
    icon: Stethoscope,
    title: 'Premium Experience',
    description: 'Designed to feel calm, reliable, and clinical without feeling cold.'
  }
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  highlights = defaultHighlights
}) {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, rgba(20,184,166,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(13,148,136,0.06) 0%, transparent 50%), #060b18'
      }}
    >
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-10">
        
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-[15%] h-72 w-72 rounded-full bg-teal-500/[0.04] blur-[100px]" />
          <div className="absolute -right-20 bottom-[10%] h-80 w-80 rounded-full bg-teal-400/[0.03] blur-[120px]" />
        </div>

        {/* Left Panel — Brand */}
        <section className="relative flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8 lg:p-10">
          <div>
            {/* Badge */}
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-teal-400/15 bg-teal-400/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-teal-300">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Elite Clinic
            </div>

            <p className="text-xs font-medium tracking-widest text-teal-300/70 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-snug text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 md:text-[1.05rem]">
              {description}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid gap-3">
            {highlights.map(({ icon: Icon, title: itemTitle, description: itemDescription }) => (
              <div
                key={itemTitle}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 transition-colors duration-200 hover:border-white/[0.08]"
              >
                <div className="flex-shrink-0 rounded-xl border border-teal-400/10 bg-teal-400/[0.06] p-2.5 text-teal-300">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{itemTitle}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{itemDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Panel — Form */}
        <section className="relative flex items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-white/[0.06] bg-[#0c1222]/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8 lg:p-10">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
