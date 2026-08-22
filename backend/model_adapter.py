# backend/model_adapter.py

import os
import joblib
import pandas as pd
import numpy as np


# ============================================================
# MODEL CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "ieee_cis_fraud_model_FINAL.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

package = joblib.load(MODEL_PATH)

MODEL = package["model"]

FEATURE_NAMES = package["feature_names"]

CATEGORICAL_FEATURES = package.get(
    "categorical_features",
    []
)

print("✅ Fraud model loaded")
print("Features expected:", len(FEATURE_NAMES))


# ============================================================
# FEATURE NAME ALIASES
# ============================================================

ALIASES = {

    "transaction_amount":
        "TransactionAmt",

    "amount":
        "TransactionAmt",

    "transaction_id":
        "TransactionID",

    "device":
        "DeviceInfo",

    "email":
        "P_emaildomain",
}


# ============================================================
# BUILD MODEL INPUT
# ============================================================

def build_model_input(features):
    """
    Convert real-time engineered features into
    the EXACT feature structure expected by LightGBM.
    """

    mapped = {}

    # Apply aliases
    for key, value in features.items():

        final_key = ALIASES.get(
            key,
            key
        )

        mapped[final_key] = value

    # --------------------------------------------------------
    # Create dataframe with EXACT training columns
    # --------------------------------------------------------

    row = {}

    for feature in FEATURE_NAMES:

        if feature in mapped:
            row[feature] = mapped[feature]

        else:
            # Missing features are represented as NaN.
            row[feature] = np.nan

    X = pd.DataFrame(
        [row],
        columns=FEATURE_NAMES
    )

    # --------------------------------------------------------
    # Restore categorical dtype
    # --------------------------------------------------------

    for feature in CATEGORICAL_FEATURES:

        if feature in X.columns:

            X[feature] = (
                X[feature]
                .astype("category")
            )

    return X


# ============================================================
# PREDICT FRAUD
# ============================================================

def predict_fraud(features):
    """
    Return fraud probability from the trained model.
    """

    X = build_model_input(
        features
    )

    probability = MODEL.predict_proba(
        X
    )[0][1]

    probability = float(
        np.clip(
            probability,
            0.0,
            1.0
        )
    )

    return probability


# ============================================================
# RISK SCORE
# ============================================================

def probability_to_risk_score(
    probability
):
    """
    Convert model probability into 0–100 score.
    """

    return int(
        round(
            probability * 100
        )
    )


def risk_level(score):

    if score >= 80:
        return "CRITICAL"

    if score >= 60:
        return "HIGH"

    if score >= 30:
        return "MEDIUM"

    return "LOW"


# ============================================================
# COMPLETE MODEL PREDICTION
# ============================================================

def analyze_transaction(features):

    probability = predict_fraud(
        features
    )

    score = probability_to_risk_score(
        probability
    )

    level = risk_level(
        score
    )

    return {

        "fraud_probability":
            round(
                probability * 100,
                2
            ),

        "risk_score":
            score,

        "risk_level":
            level
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    test_features = {

        "TransactionAmt": 12500,

        "hour": 23,

        "is_night": 1,

        "log_amount":
            np.log1p(12500),

        "amount_decimal":
            0.0,

        "geo_distance_km":
            1450,

        "geo_mismatch":
            1,

        "card_transaction_count":
            42,

        "card_amount_mean":
            2350,

        "card_amount_std":
            800,

        "card_amount_median":
            2100,

        "amount_vs_card_mean":
            5.32,

        "amount_vs_card_median":
            5.95,

        "card_amount_zscore":
            12.0,

        "new_device":
            1,

        "merchant_frequency":
            0
    }

    result = analyze_transaction(
        test_features
    )

    print("\nMODEL RESULT")
    print("=" * 40)

    for key, value in result.items():

        print(
            f"{key:<25}: {value}"
        )