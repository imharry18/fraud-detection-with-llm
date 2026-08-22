import { evaluateFraudRisk } from './fraudEngine';

const DEFAULT_API_URL = 'http://127.0.0.1:8000/predict';

export const getStoredApiConfig = () => {
  const storedLive = localStorage.getItem('ns_live_backend');
  return {
    isLiveBackend: storedLive !== null ? storedLive === 'true' : true,
    apiUrl: localStorage.getItem('ns_api_url') || DEFAULT_API_URL
  };
};

export const setStoredApiConfig = (isLive, url) => {
  localStorage.setItem('ns_live_backend', isLive ? 'true' : 'false');
  if (url) localStorage.setItem('ns_api_url', url);
};

const mapManualToPayload = (inputs) => {
  const count = parseInt(inputs.prevTxnCount, 10) || 0;
  const avgAmt = parseFloat(inputs.prevAvgAmount) || 0;
  // Construct a dummy history array so the backend can compute the historical average
  const history = Array.from({ length: Math.min(count, 5) }).map(() => ({
    amount: avgAmt,
    merchant: "VARIOUS_MERCHANTS",
    category: "General",
    time: "2026-08-01 12:00:00"
  }));

  return {
    transaction_amount: parseFloat(inputs.amount),
    transaction_time: `${inputs.date} ${inputs.time}:00`,
    card_id: inputs.cardId,
    merchant_id: inputs.merchantId,
    merchant_category: inputs.merchantCategory,
    payment_type: inputs.paymentType,
    latitude: parseFloat(inputs.currentLat),
    longitude: parseFloat(inputs.currentLong),
    billing_latitude: parseFloat(inputs.billingLat),
    billing_longitude: parseFloat(inputs.billingLong),
    device_id: inputs.deviceId,
    email_domain: inputs.emailDomain,
    billing_address: "Unknown",
    history: history
  };
};

const mapResponseToCard = (data) => {
  if (!data || !data.success) return null;
  return {
    transactionId: `#TXN-${Math.floor(Math.random() * 90000) + 10000}`,
    amount: '₹' + data.transaction?.amount?.toLocaleString(),
    merchant: data.transaction?.merchant || 'Unknown',
    location: 'N/A', // Omitted in backend response
    time: data.transaction?.time || 'Unknown',
    riskStatus: data.prediction?.risk_level || 'LOW',
    riskScore: data.prediction?.risk_score || 0,
    mlScore: data.prediction?.ml_score || 0,
    ruleViolationsCount: data.rules?.rules_triggered || 0,
    reasons: data.explanation?.reasons?.map(r => r.description) || [],
    action: data.decision?.action || 'ALLOW'
  };
};

export const analyzeTransactionApi = async (inputData, isLiveBackend = false, apiUrl = DEFAULT_API_URL, isJsonMode = false) => {
  
  // Convert input to an array of payloads
  let payloads = [];
  if (isJsonMode) {
    payloads = Array.isArray(inputData) ? inputData : [inputData];
  } else {
    payloads = [mapManualToPayload(inputData)];
  }

  if (!isLiveBackend) {
    // Offline simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Simulated engine only handles one item gracefully out of the box in our current setup, but we'll map all
    const results = payloads.map(p => evaluateFraudRisk(isJsonMode ? {} : inputData)); // Fallback uses default inputs for JSON mode
    return {
      success: true,
      source: 'SIMULATED_ENGINE',
      data: results
    };
  }

  try {
    const results = [];
    for (const payload of payloads) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Backend HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      results.push(mapResponseToCard(data));
    }
    
    return {
      success: true,
      source: 'LIVE_BACKEND_API',
      data: results
    };
  } catch (error) {
    console.warn('Live backend call failed. Falling back to local Fraud Engine:', error);
    const fallbackData = [evaluateFraudRisk(isJsonMode ? {} : inputData)];
    return {
      success: true,
      source: 'FALLBACK_SIMULATION',
      warning: `Backend connection failed (${error.message}). Displaying local simulation.`,
      data: fallbackData
    };
  }
};
