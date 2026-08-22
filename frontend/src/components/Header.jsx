import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cpu, Wifi, Settings, Eye, EyeOff } from 'lucide-react';

export const Header = ({ onOpenSettings, scanlinesEnabled, onToggleScanlines, isLiveBackend }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC+5:30');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="cyber-card style-header" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.5rem', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'rgba(0, 243, 255, 0.15)',
            border: '1px solid var(--cyber-cyan)',
            borderRadius: '4px',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 0 12px var(--cyber-cyan-glow)'
          }}>
            <ShieldAlert size={28} color="var(--cyber-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: '900',
                letterSpacing: '2px',
                color: '#fff',
                textShadow: '0 0 10px rgba(0, 243, 255, 0.5)'
              }}>
                NEURAL<span style={{ color: 'var(--cyber-cyan)' }}>SHIELD</span>
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-code)',
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid var(--cyber-cyan)',
                color: 'var(--cyber-cyan)',
                padding: '0.1rem 0.4rem',
                borderRadius: '2px'
              }}>
                v4.0.9
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              REAL-TIME TRANSACTION RISK ANALYSIS ENGINE
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
          
          {/* Live Clock */}
          <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem', color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={15} color="var(--cyber-cyan)" />
            <span>{time || '00:00:00'}</span>
          </div>

          {/* Backend Mode Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-display)',
            padding: '0.3rem 0.7rem',
            borderRadius: '2px',
            border: isLiveBackend ? '1px solid var(--cyber-green)' : '1px solid var(--cyber-cyan)',
            background: isLiveBackend ? 'rgba(0, 255, 102, 0.1)' : 'rgba(0, 243, 255, 0.1)',
            color: isLiveBackend ? 'var(--cyber-green)' : 'var(--cyber-cyan)'
          }}>
            <Wifi size={13} />
            <span>{isLiveBackend ? 'LIVE API CONNECTED' : 'SIMULATION MODE'}</span>
          </div>

          {/* Scanline FX Toggle */}
          <button 
            onClick={onToggleScanlines} 
            className="cyber-button preset"
            title="Toggle Retro CRT Scanlines overlay"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {scanlinesEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>CRT SCAN</span>
          </button>

          {/* Backend Settings Button */}
          <button 
            onClick={onOpenSettings} 
            className="cyber-button"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Settings size={15} />
            <span>API CONFIG</span>
          </button>

        </div>

      </div>
    </header>
  );
};
