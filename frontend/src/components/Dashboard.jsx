import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import fakeData from '../data.json';

export const Dashboard = () => {
  const [data, setData] = useState({
    counts: { total_transactions: 0, fraud_detected: 0, suspicious: 0 },
    history: []
  });

  useEffect(() => {
    const loadData = () => {
      const storedHistory = localStorage.getItem('ns_transaction_history');
      let historyData = [];
      
      if (!storedHistory || JSON.parse(storedHistory).length === 0) {
        // Seed with fake data if empty
        historyData = [...fakeData].reverse(); // reverse so newest is on top
        localStorage.setItem('ns_transaction_history', JSON.stringify(historyData));
      } else {
        try {
          historyData = JSON.parse(storedHistory);
        } catch (e) {
          console.error('Failed to parse transaction history', e);
          historyData = [...fakeData].reverse();
        }
      }

      const total_transactions = historyData.length;
      const fraud_detected = historyData.filter(txn => txn.risk_level === 'CRITICAL' || txn.risk_level === 'HIGH').length;
      const suspicious = historyData.filter(txn => txn.risk_level === 'MEDIUM').length;

      setData({
        counts: { total_transactions, fraud_detected, suspicious },
        history: historyData
      });
    };

    loadData();
    
    // Optional: listen for storage changes if updated from another tab
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div className="cyber-card cyber-chamfer" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '50%', color: 'var(--cyber-cyan)' }}>
            <Activity size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>TOTAL TRANSACTIONS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px var(--cyber-cyan-glow)' }}>
              {data.counts.total_transactions}
            </div>
          </div>
        </div>

        <div className="cyber-card cyber-chamfer" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'var(--cyber-magenta)' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 0, 85, 0.1)', borderRadius: '50%', color: 'var(--cyber-magenta)' }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>FRAUDS DETECTED</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff3377', textShadow: '0 0 10px rgba(255, 0, 85, 0.5)' }}>
              {data.counts.fraud_detected}
            </div>
          </div>
        </div>

        <div className="cyber-card cyber-chamfer" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'var(--cyber-amber)' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 170, 0, 0.1)', borderRadius: '50%', color: 'var(--cyber-amber)' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>SUSPICIOUS ACTIVITY</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc433', textShadow: '0 0 10px rgba(255, 170, 0, 0.5)' }}>
              {data.counts.suspicious}
            </div>
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="cyber-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cyber-cyan)', marginBottom: '1rem', letterSpacing: '1px' }}>
          TRANSACTION HISTORY LOG
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cyber-cyan)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '0.8rem' }}>TIMESTAMP</th>
                <th style={{ padding: '0.8rem' }}>TXN ID</th>
                <th style={{ padding: '0.8rem' }}>AMOUNT</th>
                <th style={{ padding: '0.8rem' }}>MERCHANT</th>
                <th style={{ padding: '0.8rem' }}>RISK LEVEL</th>
                <th style={{ padding: '0.8rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {data.history.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    NO DATA AVAILABLE
                  </td>
                </tr>
              ) : (
                data.history.map((txn, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(0, 243, 255, 0.1)', background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent' }}>
                    <td style={{ padding: '0.8rem', color: 'var(--text-main)' }}>{new Date(txn.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--cyber-cyan)' }}>{txn.transaction_id}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-main)' }}>₹{txn.amount.toLocaleString()}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-main)' }}>{txn.merchant}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span className={`badge-${txn.risk_level === 'CRITICAL' || txn.risk_level === 'HIGH' ? 'danger' : txn.risk_level === 'MEDIUM' ? 'warning' : 'success'}`} style={{ padding: '0.2rem 0.5rem', borderRadius: '2px', fontSize: '0.75rem' }}>
                        {txn.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', color: txn.action === 'BLOCK' ? '#ff3377' : txn.action === 'REVIEW' ? '#ffc433' : '#33ff88' }}>
                      {txn.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
