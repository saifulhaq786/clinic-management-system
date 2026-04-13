import React from 'react';
import { HeartPulse, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';

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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(12,74,110,0.35),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.28),_transparent_26%),linear-gradient(135deg,#04111f_0%,#081725_45%,#0d1b2a_100%)] text-white">
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-6 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-[6%] right-[8%] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <section className="relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8 lg:p-10">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
              <Sparkles size={14} />
              Elite Clinic
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {highlights.map(({ icon: Icon, title: itemTitle, description: itemDescription }) => (
              <div
                key={itemTitle}
                className="flex items-start gap-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4"
              >
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{itemTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{itemDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8 lg:p-10">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
