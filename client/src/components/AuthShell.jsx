import React from 'react';
import { HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import Background3D from './Background3D';

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
      className="min-h-screen text-white relative flex"
      style={{
        background: '#040810'
      }}
    >
      <Background3D />
      
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-10 z-10 w-full">
        
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-[15%] h-[500px] w-[500px] rounded-full bg-teal-500/[0.06] blur-[150px]" />
          <div className="absolute -right-20 bottom-[10%] h-[500px] w-[500px] rounded-full bg-teal-400/[0.04] blur-[150px]" />
        </div>

        {/* Left Panel — Brand */}
        <motion.section 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col justify-between rounded-3xl border border-white/[0.05] bg-white/[0.01] p-6 backdrop-blur-md md:p-8 lg:p-10 shadow-2xl shadow-black/50"
        >
          <div>
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/[0.08] px-4 py-2 text-xs font-medium tracking-wide text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Elite Clinic VIP
            </motion.div>

            <p className="text-xs font-medium tracking-widest text-teal-300/80 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-snug text-white md:text-4xl lg:text-[2.6rem] lg:leading-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-[1.05rem]">
              {description}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid gap-3">
             {highlights.map(({ icon: Icon, title: itemTitle, description: itemDescription }, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                key={itemTitle}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 transition-all duration-300 hover:border-teal-400/30 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(45,212,191,0.1)] group"
              >
                <div className="flex-shrink-0 rounded-xl border border-teal-400/20 bg-teal-400/[0.08] p-2.5 text-teal-300 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-teal-200 transition-colors">{itemTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{itemDescription}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Right Panel — Form */}
        <motion.section 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative flex items-center justify-center perspective-1000"
        >
          <div className="w-full max-w-xl rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 md:p-8 lg:p-10 preserves-3d shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            {children}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
