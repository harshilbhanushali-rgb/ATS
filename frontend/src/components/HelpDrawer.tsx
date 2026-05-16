// frontend/src/components/HelpDrawer.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { HELP_SECTIONS } from '../data/helpContent';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIPELINE_STAGES = [
  { label: 'Source',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { label: 'AI Match',  color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { label: 'Interview', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  { label: 'Offer',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  { label: 'Hired',     color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
];

const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveSection(0);
  }, [isOpen]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isOpen);
    return () => { document.body.classList.remove('overflow-hidden'); };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const section = HELP_SECTIONS[activeSection];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="help-backdrop"
            className="fixed inset-0 bg-slate-900/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="help-drawer"
            className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="User Guide"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">User Guide</h2>
                <p className="text-xs text-slate-500 mt-0.5">AI Hiring System — Quick Reference</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors mt-0.5"
                aria-label="Close guide"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Section nav strip */}
              <nav className="w-[148px] shrink-0 bg-slate-50 border-r border-slate-100 overflow-y-auto py-3 px-2 custom-scrollbar">
                {HELP_SECTIONS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === activeSection;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(i)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent'
                      }`}
                    >
                      <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                      <span className="leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Content pane */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  >
                    {/* Role badges + intro */}
                    <div className="mb-4">
                      {section.roles && section.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {section.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-slate-600 leading-relaxed">{section.intro}</p>
                    </div>

                    {/* Pipeline diagram (section 0 only) */}
                    {section.id === 'pipeline' && (
                      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          End-to-End Flow
                        </p>
                        <div className="flex items-center">
                          {PIPELINE_STAGES.map((stage, i) => (
                            <React.Fragment key={stage.label}>
                              <div className="flex flex-col items-center gap-1.5">
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold"
                                  style={{
                                    background: stage.bg,
                                    border: `1px solid ${stage.color}30`,
                                    color: stage.color,
                                  }}
                                >
                                  {i + 1}
                                </div>
                                <span
                                  className="text-[9px] font-semibold"
                                  style={{ color: stage.color }}
                                >
                                  {stage.label}
                                </span>
                              </div>
                              {i < PIPELINE_STAGES.length - 1 && (
                                <div
                                  className="flex-1 mx-1 mb-4"
                                  style={{
                                    height: 1,
                                    background: `linear-gradient(90deg, ${stage.color}30, ${PIPELINE_STAGES[i + 1].color}30)`,
                                  }}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feature cards */}
                    <div className="space-y-2.5">
                      {section.features.map((feature) => (
                        <div
                          key={feature.title}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <p className="text-xs font-bold text-slate-800 mb-1">{feature.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tip callout */}
                    {section.tip && (
                      <div className="mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                        <Lightbulb style={{ width: 14, height: 14, color: '#3B82F6', flexShrink: 0, marginTop: 1 }} />
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">{section.tip}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelpDrawer;
