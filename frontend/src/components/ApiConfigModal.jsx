import React, { useState } from 'react';
import { X, Server, Code, CheckCircle, Copy, Check } from 'lucide-react';

export const ApiConfigModal = ({ isOpen, onClose, isLiveBackend, apiUrl, onSaveConfig, currentInputs, currentResult }) => {
  const [liveMode, setLiveMode] = useState(isLiveBackend);
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [activeTab, setActiveTab] = useState('config');
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen) return null;

  const sampleRequestPayload = {
    transaction_amount: parseFloat(currentInputs.amount) || 12500,
    transaction_date: currentInputs.date || '2026-08-22',
    transaction_time: currentInputs.time || '23:47',
    card_id: currentInputs.cardId || 'CARD_10293',
    merchant_id: currentInputs.merchantId || 'MER_8392',
    merchant_category: currentInputs.merchantCategory || 'Electronics',
    payment_type: currentInputs.paymentType || 'Credit/Debit',
    current_latitude: parseFloat(currentInputs.currentLat) || 18.52,
    current_longitude: parseFloat(currentInputs.currentLong) || 73.85,
    billing_latitude: parseFloat(currentInputs.billingLat) || 32.72,
    billing_longitude: parseFloat(currentInputs.billingLong) || 74.85,
    device_id: currentInputs.deviceId || 'DEV_9281',
    email_domain: currentInputs.emailDomain || 'gmail.com',
    previous_transaction_count: parseInt(currentInputs.prevTxnCount, 10) || 42,
    previous_average_amount: parseFloat(currentInputs.prevAvgAmount) || 2350
  };

  const handleSave = () => {
    onSaveConfig(liveMode, urlInput);
    onClose();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleRequestPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(2, 4, 8, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="cyber-card cyber-chamfer" style={{
        width: '100%',
        maxWidth: '650px',
        background: '#080d1a',
        border: '1px solid var(--cyber-cyan)',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 0 40px var(--cyber-cyan-glow)'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyber-cyan)' }}>
            <Server size={20} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '2px', color: '#fff' }}>
              BACKEND INTEGRATION BRIDGE
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('config')}
            className={`cyber-button preset ${activeTab === 'config' ? 'active' : ''}`}
            style={{
              borderColor: activeTab === 'config' ? 'var(--cyber-cyan)' : 'transparent',
              color: activeTab === 'config' ? 'var(--cyber-cyan)' : 'var(--text-muted)'
            }}
          >
            <Server size={14} style={{ marginRight: '0.4rem' }} />
            CONNECTION SETTINGS
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`cyber-button preset ${activeTab === 'json' ? 'active' : ''}`}
            style={{
              borderColor: activeTab === 'json' ? 'var(--cyber-cyan)' : 'transparent',
              color: activeTab === 'json' ? 'var(--cyber-cyan)' : 'var(--text-muted)'
            }}
          >
            <Code size={14} style={{ marginRight: '0.4rem' }} />
            API PAYLOAD SCHEMAS
          </button>
        </div>

        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Mode Switcher */}
            <div>
              <label className="cyber-label" style={{ marginBottom: '0.6rem' }}>
                CHOOSE BACKEND PROCESSING ENGINE
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                
                {/* Option 1: Simulated */}
                <div
                  onClick={() => setLiveMode(false)}
                  style={{
                    padding: '0.85rem',
                    border: !liveMode ? '1px solid var(--cyber-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: !liveMode ? 'rgba(0, 243, 255, 0.1)' : 'rgba(5, 10, 20, 0.6)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#fff' }}>
                      SIMULATED ENGINE
                    </span>
                    {!liveMode && <CheckCircle size={15} color="var(--cyber-cyan)" />}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Runs instant evaluation engine inside the browser. No backend required. Perfect for immediate hackathon demos.
                  </p>
                </div>

                {/* Option 2: Live Backend */}
                <div
                  onClick={() => setLiveMode(true)}
                  style={{
                    padding: '0.85rem',
                    border: liveMode ? '1px solid var(--cyber-green)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: liveMode ? 'rgba(0, 255, 102, 0.1)' : 'rgba(5, 10, 20, 0.6)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: liveMode ? 'var(--cyber-green)' : '#fff' }}>
                      LIVE API BACKEND
                    </span>
                    {liveMode && <CheckCircle size={15} color="var(--cyber-green)" />}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Dispatches POST requests directly to your custom REST backend endpoint (e.g. FastAPI, Express, Django).
                  </p>
                </div>

              </div>
            </div>

            {/* API Endpoint Input */}
            <div>
              <label className="cyber-label">
                BACKEND API ENDPOINT URL
              </label>
              <input
                type="text"
                className="cyber-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000/api/analyze-transaction"
                disabled={!liveMode}
                style={{ opacity: !liveMode ? 0.5 : 1 }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                Default: <code>http://localhost:8000/api/analyze-transaction</code>
              </span>
            </div>

          </div>
        )}

        {/* Tab 2: JSON Payload Schema */}
        {activeTab === 'json' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-code)', color: 'var(--cyber-cyan)' }}>
                POST REQUEST PAYLOAD (15 CORE INPUTS):
              </span>
              <button
                onClick={handleCopyPayload}
                className="cyber-button preset"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.5rem' }}
              >
                {copiedPayload ? <Check size={12} color="var(--cyber-green)" /> : <Copy size={12} />}
                <span>{copiedPayload ? 'COPIED' : 'COPY JSON'}</span>
              </button>
            </div>
            
            <pre style={{
              background: '#040711',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              padding: '1rem',
              borderRadius: '4px',
              color: '#00f3ff',
              fontFamily: 'var(--font-code)',
              fontSize: '0.78rem',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(sampleRequestPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(0, 243, 255, 0.2)', paddingTop: '1rem' }}>
          <button onClick={onClose} className="cyber-button preset" style={{ padding: '0.6rem 1.2rem' }}>
            CANCEL
          </button>
          <button onClick={handleSave} className="cyber-button" style={{ padding: '0.6rem 1.2rem' }}>
            SAVE CONFIGURATION
          </button>
        </div>

      </div>
    </div>
  );
};
