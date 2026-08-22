import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { GeoRadar } from './components/GeoRadar';
import { RiskResultCard } from './components/RiskResultCard';
import { ApiConfigModal } from './components/ApiConfigModal';
import { Dashboard } from './components/Dashboard';
import { DEFAULT_INPUTS, evaluateFraudRisk } from './services/fraudEngine';
import { analyzeTransactionApi, getStoredApiConfig, setStoredApiConfig } from './services/api';
import { ShieldCheck, Info } from 'lucide-react';

export function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  
  // API Configuration state
  const [apiConfig, setApiConfig] = useState(getStoredApiConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Navigation
  const [currentView, setCurrentView] = useState('main');

  // Toast Notification banner
  const [toastMessage, setToastMessage] = useState(null);
  const [bankNotification, setBankNotification] = useState(null);

  // (Removed on-mount useEffect so it starts completely empty)

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePresetSelect = (preset) => {
    setInputs(preset);
    showToast(`Loaded Preset: ${preset.name}`);
  };

  const handleSaveApiConfig = (isLive, url) => {
    setStoredApiConfig(isLive, url);
    setApiConfig({ isLiveBackend: isLive, apiUrl: url });
    showToast(isLive ? `Live Backend Activated: ${url}` : 'Switched to Simulation Engine');
  };

  const handleSubmitRiskAnalysis = async (customPayload = null, isJsonMode = false) => {
    setIsAnalyzing(true);
    // Optional: Clear previous results when starting a new scan
    setResults([]); 

    try {
      const payloadToAnalyze = isJsonMode ? customPayload : inputs;
      const response = await analyzeTransactionApi(
        payloadToAnalyze,
        apiConfig.isLiveBackend,
        apiConfig.apiUrl,
        isJsonMode
      );

      if (response.warning) {
        showToast(response.warning);
      } else {
        showToast(`Analysis Completed via ${response.source}`);
      }

      setResults(response.data);

      const hasHighRisk = response.data.some(res => res && (res.riskStatus === 'HIGH' || res.riskStatus === 'CRITICAL'));
      if (hasHighRisk) {
        setBankNotification("AUTO BANK NOTIFICATION SENT: High risk activity detected. Transaction stopped and bank informed.");
        setTimeout(() => setBankNotification(null), 8000);
      }

      // Save to local storage history
      try {
        const storedHistory = localStorage.getItem('ns_transaction_history');
        const historyArray = storedHistory ? JSON.parse(storedHistory) : [];
        
        response.data.forEach(res => {
          if (!res) return;
          historyArray.unshift({
            timestamp: new Date().toISOString(),
            transaction_id: res.transactionId,
            amount: res.amount ? res.amount.replace('₹', '').replace(/,/g, '') : 0,
            merchant: res.merchant,
            risk_level: res.riskStatus,
            action: res.action
          });
        });
        
        localStorage.setItem('ns_transaction_history', JSON.stringify(historyArray));
      } catch (e) {
        console.error("Failed to save history", e);
      }

    } catch (err) {
      showToast(`Error analyzing transaction: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem 1.5rem 2.5rem', maxWidth: '1600px', margin: '0 auto', position: 'relative' }}>
      
      {/* Optional Scanlines CRT Overlay */}
      {scanlinesEnabled && <div className="scanlines-overlay" />}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(5, 12, 24, 0.95)',
          border: '1px solid var(--cyber-cyan)',
          boxShadow: '0 0 20px var(--cyber-cyan-glow)',
          padding: '0.75rem 1.25rem',
          borderRadius: '4px',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontFamily: 'var(--font-code)',
          fontSize: '0.85rem',
          color: '#fff',
          animation: 'cyberGlowPulse 2s infinite'
        }}>
          <Info size={16} color="var(--cyber-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auto Bank Notification Popup */}
      {bankNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 0, 85, 0.95)',
          border: '2px solid var(--cyber-magenta)',
          boxShadow: '0 0 30px rgba(255, 0, 85, 0.6)',
          padding: '1rem 2rem',
          borderRadius: '4px',
          zIndex: 10002,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontFamily: 'var(--font-code)',
          fontWeight: 'bold',
          color: '#fff',
          animation: 'cyberGlowPulse 1s infinite'
        }}>
          <ShieldCheck size={24} color="#fff" />
          <span>{bankNotification}</span>
        </div>
      )}

      {/* Top Cyber HUD Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        isLiveBackend={apiConfig.isLiveBackend}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <main>
          <Dashboard />
        </main>
      ) : (
      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: 15 Core Input Form Ingestion */}
        <div>
          <InputForm
            inputs={inputs}
            onChange={setInputs}
            onPresetSelect={handlePresetSelect}
            onSubmit={handleSubmitRiskAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right Column: Telemetry Radar & Cyber Terminal Ticket Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Geospatial Radar Distance Visualizer */}
          <GeoRadar
            currentLat={inputs.currentLat}
            currentLong={inputs.currentLong}
            billingLat={inputs.billingLat}
            billingLong={inputs.billingLong}
          />

          {/* Cyber Terminal Ticket Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '800px', overflowY: 'auto' }}>
            {results.length === 0 ? (
              <RiskResultCard result={null} isAnalyzing={isAnalyzing} />
            ) : (
              results.map((res, idx) => (
                <RiskResultCard
                  key={res?.transactionId || idx}
                  result={res}
                  isAnalyzing={isAnalyzing}
                />
              ))
            )}
          </div>

        </div>

      </main>
      )}

      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLiveBackend={apiConfig.isLiveBackend}
        apiUrl={apiConfig.apiUrl}
        onSaveConfig={handleSaveApiConfig}
        currentInputs={inputs}
        currentResult={results[0]}
      />

      {/* Cyber Footer */}
      <footer style={{
        marginTop: '2.5rem',
        borderTop: '1px solid rgba(0, 243, 255, 0.15)',
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-code)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="var(--cyber-cyan)" />
          <span>NEURALSHIELD FRAUD DETECT // SECURE MATRIX v4.0</span>
        </div>
        <div>
          LATENCY: <span style={{ color: 'var(--cyber-green)' }}>14ms</span> | ENCRYPTION: <span style={{ color: 'var(--cyber-cyan)' }}>AES-256-GCM</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
