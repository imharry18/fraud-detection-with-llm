# app.py
# backend/app.py

# ============================================================
# REAL-TIME FRAUD DETECTION API
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware

from feature_engineering import (
    engineer_transaction_features
)

from model_adapter import (
    analyze_transaction
)

from fraud_rules import (
    run_fraud_rules
)

from risk_engine import (
    calculate_risk
)

from explainability import (
    generate_explanation
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Real-Time Transaction Fraud Detection",
    description=(
        "Rules + LightGBM hybrid fraud detection API"
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class TransactionRequest(BaseModel):

    transaction_amount: float = Field(
        ...,
        ge=0,
        description="Transaction amount"
    )

    transaction_time: str = Field(
        ...,
        description="ISO transaction timestamp"
    )

    card_id: str

    merchant_id: str

    merchant_category: str

    payment_type: str

    latitude: float

    longitude: float

    billing_latitude: float

    billing_longitude: float

    device_id: str

    email_domain: str

    billing_address: Optional[str] = "UNKNOWN"

    # Optional frontend history
    history: Optional[
        List[Dict[str, Any]]
    ] = []


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "service":
            "Real-Time Transaction Fraud Detection",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model": "LightGBM",
        "engine": "Rules + ML"
    }


# ============================================================
# MAIN FRAUD DETECTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(
    transaction: TransactionRequest
):

    try:

        # Convert Pydantic object → dictionary
        transaction_data = (
            transaction.model_dump()
        )

        history = transaction_data.pop(
            "history",
            []
        )

        # ====================================================
        # STEP 1 — FEATURE ENGINEERING
        # ====================================================

        features = (
            engineer_transaction_features(
                transaction_data,
                history
            )
        )

        # ====================================================
        # STEP 2 — ML MODEL
        # ====================================================

        ml_result = analyze_transaction(
            features
        )

        fraud_probability = (
            ml_result[
                "fraud_probability"
            ] / 100
        )

        # ====================================================
        # STEP 3 — RULE ENGINE
        # ====================================================

        history_features = {

            "card_transaction_count":
                features.get(
                    "card_transaction_count",
                    0
                ),

            "amount_vs_card_mean":
                features.get(
                    "amount_vs_card_mean",
                    1
                ),

            "merchant_frequency":
                features.get(
                    "merchant_frequency",
                    0
                ),

            "new_device":
                features.get(
                    "new_device",
                    0
                )
        }

        rule_result = run_fraud_rules(
            transaction_data,
            history_features
        )

        # ====================================================
        # STEP 4 — RISK ENGINE
        # ====================================================

        risk_result = calculate_risk(
            fraud_probability,
            rule_result
        )

        # ====================================================
        # STEP 5 — EXPLAINABILITY
        # ====================================================

        explanation = (
            generate_explanation(
                transaction_data,
                features,
                rule_result,
                risk_result
            )
        )

        # ====================================================
        # FINAL RESPONSE
        # ====================================================

        return {

            "success": True,

            "transaction": {

                "amount":
                    transaction_data[
                        "transaction_amount"
                    ],

                "merchant":
                    transaction_data[
                        "merchant_id"
                    ],

                "category":
                    transaction_data[
                        "merchant_category"
                    ],

                "time":
                    transaction_data[
                        "transaction_time"
                    ]
            },

            "prediction": {

                "fraud_probability":
                    ml_result[
                        "fraud_probability"
                    ],

                "ml_score":
                    risk_result[
                        "ml_score"
                    ],

                "risk_score":
                    risk_result[
                        "risk_score"
                    ],

                "risk_level":
                    risk_result[
                        "risk_level"
                    ]
            },

            "rules": {

                "rules_checked":
                    rule_result[
                        "rules_checked"
                    ],

                "rules_triggered":
                    rule_result[
                        "rules_triggered"
                    ],

                "rule_score":
                    rule_result[
                        "rule_score"
                    ],

                "triggered_rules":
                    rule_result[
                        "triggered_rules"
                    ]
            },

            "explanation": {

                "summary":
                    explanation[
                        "summary"
                    ],

                "reason_count":
                    explanation[
                        "reason_count"
                    ],

                "reasons":
                    explanation[
                        "top_reasons"
                    ]
            },

            "decision": {

                "action":
                    risk_result[
                        "action"
                    ],

                "action_code":
                    risk_result[
                        "action_code"
                    ],

                "description":
                    risk_result[
                        "action_description"
                    ]
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(e)
            }
        )


# ============================================================
# DEMO TRANSACTION ENDPOINT
# ============================================================

@app.get("/demo")
def demo():

    demo_transaction = {

        "transaction_amount":
            125000,

        "transaction_time":
            "2026-08-22 23:47:00",

        "card_id":
            "CARD_DEMO_001",

        "merchant_id":
            "MERCHANT_ELECTRONICS_001",

        "merchant_category":
            "Electronics",

        "payment_type":
            "Credit Card",

        "latitude":
            18.5204,

        "longitude":
            73.8567,

        "billing_latitude":
            32.7266,

        "billing_longitude":
            74.8570,

        "device_id":
            "NEW_DEVICE_9281",

        "email_domain":
            "gmail.com",

        "billing_address":
            "Jammu",

        "history": [

            {
                "card_id":
                    "CARD_DEMO_001",

                "transaction_amount":
                    2200,

                "merchant_id":
                    "MERCHANT_001",

                "device_id":
                    "OLD_DEVICE_001"
            },

            {
                "card_id":
                    "CARD_DEMO_001",

                "transaction_amount":
                    2800,

                "merchant_id":
                    "MERCHANT_002",

                "device_id":
                    "OLD_DEVICE_001"
            }
        ]
    }

    request = TransactionRequest(
        **demo_transaction
    )

    return predict(request)