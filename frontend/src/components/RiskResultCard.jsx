import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, AlertOctagon, Terminal, Copy, Check } from 'lucide-react';

export const RiskResultCard = ({ result, isAnalyzing }) => {
  const [copied, setCopied] = React.useState(false);

  if (isAnalyzing) {
    return (
      <div className="cyber-card cyber-chamfer" style={{ padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '3px solid rgba(0, 243, 255, 0.2)',
          borderTopColor: 'var(--cyber-cyan)',
          borderRightColor: 'var(--cyber-magenta)',
          borderRadius: '50%',
          animation: 'radarSweep 1s linear infinite',
          marginBottom: '1.5rem',
          boxShadow: '0 0 20px var(--cyber-cyan-glow)'
        }} />
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cyber-cyan)', letterSpacing: '2px', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          EVALUATING NEURAL FRAUD MATRIX...
        </h3>
        <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Executing Rule Engine & Geospatial Haversine Telemetry
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="cyber-card" style={{ padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Terminal size={48} color="var(--cyber-cyan)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '1px' }}>
          AWAITING TRANSACTION SCAN
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '300px', marginTop: '0.5rem' }}>
          Fill in the 15 transaction metrics or select a demo preset, then click "RUN RISK ASSESSMENT".
        </p>
      </div>
    );
  }

  const {
    transactionId = '#TXN839291',
    amount = '₹12,500',
    merchant = 'Electronics',
    location = 'Pune',
    time = '23:47',
    riskStatus = 'HIGH',
    riskScore = 96,
    mlScore = 93,
    ruleViolationsCount = 4,
    reasons = ['Unusual amount', 'Odd transaction hour', 'Location mismatch', 'New device'],
    action = '🔴 BLOCK / STEP-UP AUTHENTICATION'
  } = result;

  const isHigh = riskStatus === 'HIGH';
  const isMedium = riskStatus === 'MEDIUM';
  
  const statusColor = isHigh ? 'var(--cyber-magenta)' : isMedium ? 'var(--cyber-amber)' : 'var(--cyber-green)';
  const statusGlow = isHigh ? 'var(--cyber-magenta-glow)' : isMedium ? 'var(--cyber-amber-glow)' : 'var(--cyber-green-glow)';

  const handleCopyReceipt = () => {
    const textReceipt = `
╔══════════════════════════════════════╗
║        TRANSACTION ${transactionId}        ║
╠══════════════════════════════════════╣
║ Amount:              ${amount.padEnd(16)}║
║ Merchant:            ${merchant.padEnd(16)}║
║ Location:            ${location.padEnd(16)}║
║ Time:                ${time.padEnd(16)}║
╠══════════════════════════════════════╣
║                                      ║
║       ${isHigh ? '🚨 HIGH FRAUD RISK' : isMedium ? '🟡 MEDIUM RISK' : '🟢 LOW FRAUD RISK'}             ║
║                                      ║
║          RISK SCORE                  ║
║             ${riskScore}/100                   ║
║                                      ║
║ ML SCORE:             ${mlScore}%            ║
║ RULE VIOLATIONS:       ${ruleViolationsCount}             ║
╠══════════════════════════════════════╣
║ WHY?                                 ║
║                                      ║
${reasons.map(r => `║ • ${r.padEnd(35)}║`).join('\n')}
╠══════════════════════════════════════╣
║ ACTION:                              ║
║ ${action.padEnd(37)}║
╚══════════════════════════════════════╝
    `;
    navigator.clipboard.writeText(textReceipt.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card cyber-chamfer" style={{
      padding: '1.25rem',
      borderColor: statusColor,
      boxShadow: `0 0 25px ${statusGlow}`,
      borderRadius: '4px',
      position: 'relative'
    }}>
      
      {/* Corner Glow Accents */}
      <div className="corner-tl" style={{ borderColor: statusColor }} />
      <div className="corner-tr" style={{ borderColor: statusColor }} />
      <div className="corner-bl" style={{ borderColor: statusColor }} />
      <div className="corner-br" style={{ borderColor: statusColor }} />

      {/* Top Header Ticket Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px dashed ${statusColor}`,
        paddingBottom: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} color={statusColor} />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: '900',
            letterSpacing: '2px',
            color: '#fff'
          }}>
            TRANSACTION {transactionId}
          </h2>
        </div>

        <button
          onClick={handleCopyReceipt}
          className="cyber-button preset"
          title="Copy ASCII Receipt Ticket"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem' }}
        >
          {copied ? <Check size={13} color="var(--cyber-green)" /> : <Copy size={13} />}
          <span>{copied ? 'COPIED' : 'COPY TICKET'}</span>
        </button>
      </div>

      {/* Transaction Details Summary Box */}
      <div style={{
        background: 'rgba(4, 9, 18, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        fontFamily: 'var(--font-code)',
        fontSize: '0.85rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem 1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{amount}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Merchant: </span>
          <span style={{ color: 'var(--cyber-cyan)' }}>{merchant}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Location: </span>
          <span style={{ color: '#fff' }}>{location}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Time: </span>
          <span style={{ color: 'var(--cyber-cyan)' }}>{time}</span>
        </div>
      </div>

      {/* Risk Status Banner */}
      <div style={{
        padding: '0.75rem',
        borderRadius: '4px',
        textAlign: 'center',
        marginBottom: '1.2rem',
        background: isHigh ? 'rgba(255, 0, 85, 0.15)' : isMedium ? 'rgba(255, 170, 0, 0.15)' : 'rgba(0, 255, 102, 0.15)',
        border: `1px solid ${statusColor}`,
        boxShadow: `0 0 15px ${statusGlow}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '900',
          letterSpacing: '2px',
          color: statusColor
        }}>
          {isHigh ? (
            <>
              <ShieldAlert size={22} />
              <span>🚨 HIGH FRAUD RISK</span>
            </>
          ) : isMedium ? (
            <>
              <AlertTriangle size={22} />
              <span>🟡 SUSPICIOUS RISK DETECTED</span>
            </>
          ) : (
            <>
              <CheckCircle size={22} />
              <span>🟢 LOW FRAUD RISK</span>
            </>
          )}
        </div>
      </div>

      {/* Gauges & Metric Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: '1rem',
        alignItems: 'center',
        background: 'rgba(4, 9, 18, 0.8)',
        border: '1px solid rgba(0, 243, 255, 0.15)',
        padding: '0.85rem',
        borderRadius: '4px',
        marginBottom: '1.2rem'
      }}>
        
        {/* Radial Risk Score Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="90" height="90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={statusColor}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * riskScore) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              textAlign: 'center'
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: '900',
                color: statusColor,
                display: 'block',
                lineHeight: '1'
              }}>
                {riskScore}
              </span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)' }}>
                / 100
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
            RISK SCORE
          </span>
        </div>

        {/* ML Score & Rule Violations Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* ML Score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-code)', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>ML SCORE:</span>
              <span style={{ color: statusColor, fontWeight: 'bold' }}>{mlScore}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${mlScore}%`,
                height: '100%',
                background: statusColor,
                boxShadow: `0 0 10px ${statusGlow}`,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>

          {/* Rule Violations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-code)', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>RULE VIOLATIONS:</span>
              <span style={{
                color: ruleViolationsCount > 0 ? 'var(--cyber-magenta)' : 'var(--cyber-green)',
                fontWeight: 'bold',
                background: ruleViolationsCount > 0 ? 'rgba(255,0,85,0.2)' : 'rgba(0,255,102,0.2)',
                padding: '0.1rem 0.4rem',
                borderRadius: '2px'
              }}>
                {ruleViolationsCount}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, ruleViolationsCount * 25)}%`,
                height: '100%',
                background: ruleViolationsCount > 2 ? 'var(--cyber-magenta)' : 'var(--cyber-amber)',
                transition: 'width 1s ease'
              }} />
            </div>
          </div>

        </div>

      </div>

      {/* WHY Section (Bulleted Risk Rationale) */}
      <div style={{
        background: 'rgba(4, 9, 18, 0.9)',
        border: '1px solid rgba(0, 243, 255, 0.15)',
        padding: '0.85rem',
        borderRadius: '4px',
        marginBottom: '1.2rem'
      }}>
        <h4 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '1.5px',
          color: 'var(--cyber-cyan)',
          marginBottom: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <AlertOctagon size={14} />
          WHY? (RISK RATIONALE)
        </h4>

        <ul style={{ listStyle: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {reasons.map((reason, idx) => (
            <li key={idx} style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.82rem',
              color: '#e2f1ff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: statusColor, fontWeight: 'bold' }}>•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTION Section */}
      <div style={{
        background: isHigh ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 243, 255, 0.05)',
        border: `1px solid ${statusColor}`,
        padding: '0.85rem',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <span style={{
          fontSize: '0.68rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: '1.5px',
          color: 'var(--text-muted)',
          display: 'block',
          marginBottom: '0.3rem'
        }}>
          RECOMMENDED SYSTEM ACTION:
        </span>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          color: statusColor,
          textShadow: `0 0 10px ${statusGlow}`
        }}>
          {action}
        </div>
      </div>

    </div>
  );
};
