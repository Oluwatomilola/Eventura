'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Settings as SettingsIcon, Bell, Globe, Moon, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';

export default function SettingsPage() {
  const { restartOnboarding } = useOnboardingStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');

  const handleRestartOnboarding = () => {
    restartOnboarding();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-mono uppercase tracking-wider">Return</span>
            </Link>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-lg font-bold tracking-tight text-white">SETTINGS_CONFIG</span>
            </div>
          </div>
          <ConnectButton />
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* General Section */}
          <section>
            <h2 className="text-xs font-mono text-cyan-500 mb-4 tracking-widest uppercase border-b border-zinc-800 pb-2">
              // System Preferences
            </h2>
            
            <div className="grid gap-4">
              {/* Onboarding */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1 tracking-wide group-hover:text-cyan-400 transition-colors">TOUR PROTOCOL</h3>
                    <p className="text-sm text-zinc-500">Re-initialize the welcome sequence and feature walkthrough.</p>
                  </div>
                  <button
                    onClick={handleRestartOnboarding}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-zinc-600 hover:border-cyan-500 hover:text-cyan-400 text-zinc-300 text-xs font-mono uppercase transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    REBOOT
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                    <div>
                      <h3 className="text-white font-bold mb-1 tracking-wide group-hover:text-cyan-400 transition-colors">LANGUAGE DATA</h3>
                      <p className="text-sm text-zinc-500">Select interface communication dialect.</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 text-white text-sm px-4 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="en">ENGLISH [EN]</option>
                    <option value="es">ESPAÑOL [ES]</option>
                    <option value="fr">FRANÇAIS [FR]</option>
                  </select>
                </div>
              </div>

              {/* Theme */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Moon className="w-5 h-5 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                    <div>
                      <h3 className="text-white font-bold mb-1 tracking-wide group-hover:text-cyan-400 transition-colors">VISUAL INTERFACE</h3>
                      <p className="text-sm text-zinc-500">Adjust display output parameters.</p>
                    </div>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 text-white text-sm px-4 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="dark">DARK MODE</option>
                    <option value="light">LIGHT MODE</option>
                    <option value="system">SYSTEM SYNC</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2 className="text-xs font-mono text-cyan-500 mb-4 tracking-widest uppercase border-b border-zinc-800 pb-2">
              // Signal Transmission
            </h2>
            
            <div className="grid gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-cyan-500/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                    <div>
                      <h3 className="text-white font-bold mb-1 tracking-wide group-hover:text-cyan-400 transition-colors">EMAIL UPLINK</h3>
                      <p className="text-sm text-zinc-500">Receive status updates for events and assets.</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 border transition-colors relative ${
                      notificationsEnabled 
                        ? 'bg-cyan-900/30 border-cyan-500' 
                        : 'bg-zinc-950 border-zinc-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 bottom-0.5 w-4 transition-all ${
                      notificationsEnabled
                        ? 'right-0.5 bg-cyan-400'
                        : 'left-0.5 bg-zinc-600'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
