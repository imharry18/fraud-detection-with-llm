import React from 'react';
import { Compass, Navigation, Radio } from 'lucide-react';
import { calculateDistanceKm } from '../services/fraudEngine';

export const GeoRadar = ({ currentLat, currentLong, billingLat, billingLong }) => {
  const cLat = parseFloat(currentLat) || 0;
  const cLong = parseFloat(currentLong) || 0;
  const bLat = parseFloat(billingLat) || 0;
  const bLong = parseFloat(billingLong) || 0;

  const distanceKm = calculateDistanceKm(cLat, cLong, bLat, bLong);
  const isHighMismatch = distanceKm > 150;

  return (
    <div className="cyber-card" style={{ padding: '1rem', borderRadius: '4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Radar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyber-cyan)' }}>
          <Radio size={16} style={{ animation: 'pulse 1.5s infinite' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '1px' }}>
            GEOSPATIAL TELEMETRY RADAR
          </h3>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontFamily: 'var(--font-code)',
          padding: '0.15rem 0.5rem',
          borderRadius: '2px',
          background: isHighMismatch ? 'rgba(255, 0, 85, 0.2)' : 'rgba(0, 255, 102, 0.2)',
          border: isHighMismatch ? '1px solid var(--cyber-magenta)' : '1px solid var(--cyber-green)',
          color: isHighMismatch ? 'var(--cyber-magenta)' : 'var(--cyber-green)'
        }}>
          {isHighMismatch ? '⚠️ HIGH MISMATCH' : '✓ MATCHED'}
        </span>
      </div>

      {/* Radar Canvas Graphics */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        background: 'radial-gradient(circle, rgba(0, 243, 255, 0.08) 0%, rgba(5, 7, 12, 0.95) 75%)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.85rem'
      }}>

        {/* Concentric Circles */}
        <div style={{ position: 'absolute', width: '140px', height: '140px', border: '1px dashed rgba(0, 243, 255, 0.25)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: '90px', height: '90px', border: '1px solid rgba(0, 243, 255, 0.3)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: '40px', height: '40px', border: '1px solid rgba(0, 243, 255, 0.4)', borderRadius: '50%' }} />
        
        {/* Crosshair grid lines */}
        <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(0, 243, 255, 0.2)' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(0, 243, 255, 0.2)' }} />

        {/* Radar Rotating Sweep Hand */}
        <div style={{
          position: 'absolute',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(0, 243, 255, 0.4) 360deg)',
          animation: 'radarSweep 3.5s linear infinite'
        }} />

        {/* Node 1: Current Txn Location (Green Ping) */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '35%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: 'var(--cyber-green)',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--cyber-green)'
          }} />
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-code)', color: 'var(--cyber-green)', marginTop: '2px', background: 'rgba(0,0,0,0.7)', padding: '0 2px' }}>
            Current ({cLat}, {cLong})
          </span>
        </div>

        {/* Node 2: Billing Location (Red/Magenta Ping) */}
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '70%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: isHighMismatch ? 'var(--cyber-magenta)' : 'var(--cyber-cyan)',
            borderRadius: '50%',
            boxShadow: isHighMismatch ? '0 0 10px var(--cyber-magenta)' : '0 0 10px var(--cyber-cyan)'
          }} />
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-code)', color: isHighMismatch ? 'var(--cyber-magenta)' : 'var(--cyber-cyan)', marginTop: '2px', background: 'rgba(0,0,0,0.7)', padding: '0 2px' }}>
            Billing ({bLat}, {bLong})
          </span>
        </div>

        {/* Connecting vector line */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line
            x1="35%" y1="40%"
            x2="70%" y2="65%"
            stroke={isHighMismatch ? 'var(--cyber-magenta)' : 'var(--cyber-cyan)'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

      </div>

      {/* Telemetry Distance Metrics Readout */}
      <div style={{
        marginTop: 'auto',
        background: 'rgba(4, 9, 18, 0.85)',
        border: '1px solid rgba(0, 243, 255, 0.15)',
        padding: '0.75rem',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', display: 'block' }}>
            CALCULATED GEO-DISTANCE
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 'bold', color: isHighMismatch ? 'var(--cyber-magenta)' : 'var(--cyber-cyan)' }}>
            {distanceKm.toLocaleString('en-US')} <span style={{ fontSize: '0.75rem' }}>KM</span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-code)', display: 'block' }}>
            HAVERSINE METRIC
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
            {isHighMismatch ? 'Geo-Fence Alert' : 'Geo-Fence Normal'}
          </span>
        </div>
      </div>

    </div>
  );
};
