import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { GeoRadar } from './components/GeoRadar';
import { RiskResultCard } from './components/RiskResultCard';
import { ApiConfigModal } from './components/ApiConfigModal';
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

  // Toast Notification banner
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const initialResult = evaluateFraudRisk(DEFAULT_INPUTS);
    setResults([initialResult]);
  }, []);

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

      {/* Top Cyber HUD Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        isLiveBackend={apiConfig.isLiveBackend}
      />

      {/* Main Grid Content */}
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
            {results.map((res, idx) => (
              <RiskResultCard
                key={res?.transactionId || idx}
                result={res}
                isAnalyzing={isAnalyzing}
              />
            ))}
          </div>

        </div>

      </main>

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
