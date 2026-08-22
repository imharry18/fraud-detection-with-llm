import { evaluateFraudRisk } from './fraudEngine';

const DEFAULT_API_URL = 'http://localhost:8000/api/analyze-transaction';

export const getStoredApiConfig = () => {
  return {
    isLiveBackend: localStorage.getItem('ns_live_backend') === 'true',
    apiUrl: localStorage.getItem('ns_api_url') || DEFAULT_API_URL
  };
};

export const setStoredApiConfig = (isLive, url) => {
  localStorage.setItem('ns_live_backend', isLive ? 'true' : 'false');
  if (url) localStorage.setItem('ns_api_url', url);
};

export const analyzeTransactionApi = async (inputs, isLiveBackend = false, apiUrl = DEFAULT_API_URL) => {
  if (!isLiveBackend) {
    // Offline simulation delay to give realistic cyber analysis feeling
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      source: 'SIMULATED_ENGINE',
      data: evaluateFraudRisk(inputs)
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(inputs.amount),
        transaction_date: inputs.date,
        transaction_time: inputs.time,
        card_id: inputs.cardId,
        merchant_id: inputs.merchantId,
        merchant_category: inputs.merchantCategory,
        payment_type: inputs.paymentType,
        current_latitude: parseFloat(inputs.currentLat),
        current_longitude: parseFloat(inputs.currentLong),
        billing_latitude: parseFloat(inputs.billingLat),
        billing_longitude: parseFloat(inputs.billingLong),
        device_id: inputs.deviceId,
        email_domain: inputs.emailDomain,
        previous_transaction_count: parseInt(inputs.prevTxnCount, 10),
        previous_average_amount: parseFloat(inputs.prevAvgAmount)
      })
    });

    if (!response.ok) {
      throw new Error(`Backend HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      source: 'LIVE_BACKEND_API',
      data: data
    };
  } catch (error) {
    console.warn('Live backend call failed. Falling back to local Fraud Engine:', error);
    // Fallback gracefully so the UI still displays result seamlessly
    const fallbackData = evaluateFraudRisk(inputs);
    return {
      success: true,
      source: 'FALLBACK_SIMULATION',
      warning: `Backend connection to ${apiUrl} failed (${error.message}). Displaying local simulation.`,
      data: fallbackData
    };
  }
};
