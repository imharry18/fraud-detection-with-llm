# risk_engine.py
# backend/risk_engine.py

# ============================================================
# RISK ENGINE
# Combines:
#   1. ML fraud probability
#   2. Rule-engine score
#   3. Behavioral signals
#
# Output:
#   - Risk score 0–100
#   - Risk level
#   - Recommended action
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

ML_WEIGHT = 0.70
RULE_WEIGHT = 0.30

# Risk thresholds
LOW_THRESHOLD = 30
MEDIUM_THRESHOLD = 60
HIGH_THRESHOLD = 80


# ============================================================
# NORMALIZE ML SCORE
# ============================================================

def normalize_ml_score(
    fraud_probability
):
    """
    Convert ML probability (0–1)
    into score (0–100).
    """

    try:
        probability = float(
            fraud_probability
        )
    except (TypeError, ValueError):
        probability = 0.0

    probability = max(
        0.0,
        min(
            probability,
            1.0
        )
    )

    return probability * 100


# ============================================================
# CALCULATE FINAL SCORE
# ============================================================

def calculate_risk_score(
    fraud_probability,
    rule_score
):
    """
    Combine ML and rule scores.

    ML:
        70%

    Rules:
        30%
    """

    ml_score = normalize_ml_score(
        fraud_probability
    )

    try:
        rule_score = float(
            rule_score
        )
    except (TypeError, ValueError):
        rule_score = 0.0

    rule_score = max(
        0.0,
        min(
            rule_score,
            100.0
        )
    )

    final_score = (
        ml_score * ML_WEIGHT
        +
        rule_score * RULE_WEIGHT
    )

    return round(
        max(
            0.0,
            min(
                final_score,
                100.0
            )
        ),
        2
    )


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(
    risk_score
):

    if risk_score >= HIGH_THRESHOLD:
        return "CRITICAL"

    if risk_score >= MEDIUM_THRESHOLD:
        return "HIGH"

    if risk_score >= LOW_THRESHOLD:
        return "MEDIUM"

    return "LOW"


# ============================================================
# RECOMMENDED ACTION
# ============================================================

def get_recommended_action(
    risk_score,
    rules_triggered=0
):

    # Extremely high risk
    if risk_score >= 90:

        return {
            "action": "BLOCK",
            "code": "BLOCK_TRANSACTION",
            "description":
                "Transaction should be blocked immediately."
        }

    # High risk
    if risk_score >= 80:

        return {
            "action": "STEP_UP_AUTHENTICATION",
            "code": "STEP_UP",
            "description":
                "Require additional authentication before approval."
        }

    # Medium/high risk
    if risk_score >= 60:

        return {
            "action": "MANUAL_REVIEW",
            "code": "REVIEW",
            "description":
                "Send transaction for fraud analyst review."
        }

    # Some rules triggered even when ML score is low
    if rules_triggered >= 2:

        return {
            "action": "STEP_UP_AUTHENTICATION",
            "code": "STEP_UP",
            "description":
                "Multiple anomaly rules were triggered."
        }

    # Normal
    return {
        "action": "APPROVE",
        "code": "APPROVE",
        "description":
            "Transaction appears low risk."
    }


# ============================================================
# COMPLETE RISK ANALYSIS
# ============================================================

def calculate_risk(
    fraud_probability,
    rule_result
):
    """
    Main risk-engine function.

    Parameters
    ----------
    fraud_probability:
        LightGBM output between 0 and 1.

    rule_result:
        Output from run_fraud_rules().
    """

    if rule_result is None:
        rule_result = {}

    rule_score = rule_result.get(
        "rule_score",
        0
    )

    rules_triggered = rule_result.get(
        "rules_triggered",
        0
    )

    # Calculate final score
    risk_score = calculate_risk_score(
        fraud_probability,
        rule_score
    )

    # Level
    risk_level = get_risk_level(
        risk_score
    )

    # Action
    action = get_recommended_action(
        risk_score,
        rules_triggered
    )

    # ML score for display
    ml_score = normalize_ml_score(
        fraud_probability
    )

    return {

        "risk_score":
            risk_score,

        "risk_level":
            risk_level,

        "ml_score":
            round(
                ml_score,
                2
            ),

        "rule_score":
            round(
                float(rule_score),
                2
            ),

        "rules_triggered":
            rules_triggered,

        "action":
            action["action"],

        "action_code":
            action["code"],

        "action_description":
            action["description"]
    }


# ============================================================
# DEMO TEST
# ============================================================

if __name__ == "__main__":

    # Example:
    # LightGBM says 93% fraud probability
    fraud_probability = 0.93

    # Rule engine found multiple anomalies
    rule_result = {

        "rules_triggered": 4,

        "rule_score": 75,

        "triggered_rules": []
    }

    result = calculate_risk(
        fraud_probability,
        rule_result
    )

    print("\n")
    print("=" * 55)
    print("RISK ENGINE RESULT")
    print("=" * 55)

    for key, value in result.items():

        print(
            f"{key:<25}: {value}"
        )

    print("=" * 55)