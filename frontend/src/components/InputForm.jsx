import React from 'react';
import { CreditCard, MapPin, Smartphone, Activity, Zap, RefreshCw, Layers } from 'lucide-react';
import { PRESETS } from '../services/fraudEngine';

export const InputForm = ({ inputs, onChange, onPresetSelect, onSubmit, isAnalyzing }) => {
  
  const handleInputChange = (field, value) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <div className="cyber-card" style={{ padding: '1.25rem', borderRadius: '4px' }}>
      
      {/* Form Header & Presets Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
        paddingBottom: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--cyber-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '1px', color: '#fff' }}>
            TRANSACTION INGESTION MATRIX
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-code)' }}>
            [15 CORE METRICS]
          </span>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            LOAD PRESET:
          </span>
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              type="button"
              className="cyber-button preset"
              onClick={() => onPresetSelect(PRESETS[key])}
            >
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        
        {/* Module Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          
          {/* Module 1: Transaction Core */}
          <div style={{
            background: 'rgba(5, 12, 24, 0.6)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyber-cyan)', marginBottom: '0.85rem' }}>
              <CreditCard size={16} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '1px' }}>
                1. TRANSACTION CORE METRICS
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* 1. Transaction Amount */}
              <div>
                <label className="cyber-label">
                  <span className="num">#1</span> Amount (₹)
                </label>
                <input
                  type="number"
                  className="cyber-input"
                  value={inputs.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="e.g. 12500"
                  required
                />
              </div>

              {/* 2 & 3. Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="cyber-label">
                    <span className="num">#2</span> Date
                  </label>
                  <input
                    type="date"
                    className="cyber-input"
                    value={inputs.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="cyber-label">
                    <span className="num">#3</span> Time
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={inputs.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    placeholder="23:47"
                    required
                  />
                </div>
              </div>

              {/* 4 & 5. Card ID & Merchant ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="cyber-label">
                    <span className="num">#4</span> Card ID
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={inputs.cardId}
                    onChange={(e) => handleInputChange('cardId', e.target.value)}
                    placeholder="CARD_10293"
                  />
                </div>
                <div>
                  <label className="cyber-label">
                    <span className="num">#5</span> Merchant ID
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={inputs.merchantId}
                    onChange={(e) => handleInputChange('merchantId', e.target.value)}
                    placeholder="MER_8392"
                  />
                </div>
              </div>

              {/* 6 & 7. Category & Payment Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="cyber-label">
                    <span className="num">#6</span> Category
                  </label>
                  <select
                    className="cyber-input"
                    value={inputs.merchantCategory}
                    onChange={(e) => handleInputChange('merchantCategory', e.target.value)}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Travel">Travel</option>
                    <option value="Luxury Goods">Luxury Goods</option>
                  </select>
                </div>
                <div>
                  <label className="cyber-label">
                    <span className="num">#7</span> Payment Type
                  </label>
                  <select
                    className="cyber-input"
                    value={inputs.paymentType}
                    onChange={(e) => handleInputChange('paymentType', e.target.value)}
                  >
                    <option value="Credit/Debit">Credit/Debit</option>
                    <option value="UPI">UPI</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Module 2: Geolocation Telemetry */}
          <div style={{
            background: 'rgba(5, 12, 24, 0.6)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyber-cyan)', marginBottom: '0.85rem' }}>
              <MapPin size={16} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '1px' }}>
                2. GEOLOCATION TELEMETRY
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* 8 & 9. Current Coordinates */}
              <div>
                <label className="cyber-label">
                  <span className="num">#8 & #9</span> Current Location (Lat / Long)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    className="cyber-input"
                    value={inputs.currentLat}
                    onChange={(e) => handleInputChange('currentLat', e.target.value)}
                    placeholder="Lat (e.g. 18.52)"
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="cyber-input"
                    value={inputs.currentLong}
                    onChange={(e) => handleInputChange('currentLong', e.target.value)}
                    placeholder="Long (e.g. 73.85)"
                  />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                  Default: 18.52, 73.85 (Pune Region)
                </span>
              </div>

              {/* 10 & 11. Billing Coordinates */}
              <div>
                <label className="cyber-label">
                  <span className="num">#10 & #11</span> Billing Address (Lat / Long)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    className="cyber-input"
                    value={inputs.billingLat}
                    onChange={(e) => handleInputChange('billingLat', e.target.value)}
                    placeholder="Lat (e.g. 32.72)"
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="cyber-input"
                    value={inputs.billingLong}
                    onChange={(e) => handleInputChange('billingLong', e.target.value)}
                    placeholder="Long (e.g. 74.85)"
                  />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                  Default: 32.72, 74.85 (Jammu Region)
                </span>
              </div>

            </div>
          </div>

          {/* Module 3 & 4: Device & Velocity */}
          <div style={{
            background: 'rgba(5, 12, 24, 0.6)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            padding: '1rem',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            
            {/* Device & Email */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyber-cyan)', marginBottom: '0.75rem' }}>
                <Smartphone size={16} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  3. DEVICE & IDENTITY MATRIX
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="cyber-label">
                    <span className="num">#12</span> Device ID
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={inputs.deviceId}
                    onChange={(e) => handleInputChange('deviceId', e.target.value)}
                    placeholder="DEV_9281"
                  />
                </div>
                <div>
                  <label className="cyber-label">
                    <span className="num">#13</span> Email Domain
                  </label>
                  <input
                    type="text"
                    className="cyber-input"
                    value={inputs.emailDomain}
                    onChange={(e) => handleInputChange('emailDomain', e.target.value)}
                    placeholder="gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Historical Profile & Velocity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyber-cyan)', marginBottom: '0.75rem' }}>
                <Activity size={16} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  4. HISTORICAL PROFILE & VELOCITY
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="cyber-label">
                    <span className="num">#14</span> Prev Txn Count
                  </label>
                  <input
                    type="number"
                    className="cyber-input"
                    value={inputs.prevTxnCount}
                    onChange={(e) => handleInputChange('prevTxnCount', e.target.value)}
                    placeholder="42"
                  />
                </div>
                <div>
                  <label className="cyber-label">
                    <span className="num">#15</span> Prev Avg Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="cyber-input"
                    value={inputs.prevAvgAmount}
                    onChange={(e) => handleInputChange('prevAvgAmount', e.target.value)}
                    placeholder="2350"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Action Button & Cyber Submit */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          
          <button
            type="button"
            className="cyber-button preset"
            onClick={() => onPresetSelect(PRESETS.HIGH_RISK)}
            style={{ padding: '0.75rem 1rem' }}
          >
            <RefreshCw size={14} style={{ marginRight: '0.4rem' }} />
            RESET TO DEFAULTS
          </button>

          <button
            type="submit"
            className="cyber-button danger"
            disabled={isAnalyzing}
            style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="spin-icon" style={{ animation: 'cyberSweep 1s linear infinite' }} />
                <span>ANALYZING MATRIX...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>RUN RISK ASSESSMENT</span>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};
