# fraud_rules.py
# backend/fraud_rules.py

from datetime import datetime
from math import radians, sin, cos, sqrt, atan2


# ============================================================
# CONFIGURATION
# ============================================================

# Adjust these during your hackathon demo.
HIGH_AMOUNT_THRESHOLD = 50000

ODD_HOUR_START = 23
ODD_HOUR_END = 6

GEO_DISTANCE_THRESHOLD_KM = 500

UNUSUAL_AMOUNT_MULTIPLIER = 3.0


# ============================================================
# GEO DISTANCE
# ============================================================

def haversine_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculate distance between two coordinates in KM.
    """

    try:
        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)
    except (TypeError, ValueError):
        return 0.0

    R = 6371.0

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    dlat = lat2 - lat1
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c


# ============================================================
# RULE 1 — HIGH TRANSACTION VALUE
# ============================================================

def check_high_value(transaction):

    amount = float(
        transaction.get(
            "transaction_amount",
            0
        )
    )

    if amount >= HIGH_AMOUNT_THRESHOLD:

        return {
            "triggered": True,
            "rule": "HIGH_VALUE",
            "severity": "HIGH",
            "message": (
                f"Transaction amount ₹{amount:,.2f} "
                f"exceeds the ₹{HIGH_AMOUNT_THRESHOLD:,.0f} "
                f"threshold."
            ),
            "score": 25
        }

    return {
        "triggered": False,
        "rule": "HIGH_VALUE",
        "severity": "NONE",
        "score": 0
    }


# ============================================================
# RULE 2 — ODD TRANSACTION HOUR
# ============================================================

def check_odd_hour(transaction):

    timestamp = transaction.get(
        "transaction_time"
    )

    try:
        dt = datetime.fromisoformat(
            timestamp
        )

        hour = dt.hour

    except (TypeError, ValueError):

        return {
            "triggered": False,
            "rule": "ODD_HOUR",
            "severity": "NONE",
            "score": 0
        }

    if hour >= ODD_HOUR_START or hour < ODD_HOUR_END:

        return {
            "triggered": True,
            "rule": "ODD_HOUR",
            "severity": "MEDIUM",
            "message": (
                f"Transaction occurred at "
                f"{dt.strftime('%H:%M')}, "
                f"outside normal transaction hours."
            ),
            "score": 15
        }

    return {
        "triggered": False,
        "rule": "ODD_HOUR",
        "severity": "NONE",
        "score": 0
    }


# ============================================================
# RULE 3 — GEO MISMATCH
# ============================================================

def check_geo_mismatch(transaction):

    distance = haversine_distance(

        transaction.get(
            "latitude"
        ),

        transaction.get(
            "longitude"
        ),

        transaction.get(
            "billing_latitude"
        ),

        transaction.get(
            "billing_longitude"
        )
    )

    if distance >= GEO_DISTANCE_THRESHOLD_KM:

        return {
            "triggered": True,
            "rule": "GEO_MISMATCH",
            "severity": "HIGH",
            "message": (
                f"Transaction location is "
                f"{distance:,.0f} km from the "
                f"billing location."
            ),
            "distance_km": round(
                distance,
                2
            ),
            "score": 25
        }

    return {
        "triggered": False,
        "rule": "GEO_MISMATCH",
        "severity": "NONE",
        "distance_km": round(
            distance,
            2
        ),
        "score": 0
    }


# ============================================================
# RULE 4 — UNUSUAL PURCHASE PATTERN
# ============================================================

def check_purchase_pattern(
    transaction,
    history_features
):

    transaction_count = history_features.get(
        "card_transaction_count",
        0
    )

    amount_ratio = history_features.get(
        "amount_vs_card_mean",
        1
    )

    merchant_frequency = history_features.get(
        "merchant_frequency",
        0
    )

    new_device = history_features.get(
        "new_device",
        0
    )

    reasons = []
    score = 0

    # Amount significantly higher than normal
    if (
        transaction_count > 0
        and amount_ratio >= UNUSUAL_AMOUNT_MULTIPLIER
    ):

        reasons.append(
            f"Transaction amount is "
            f"{amount_ratio:.1f}× the user's "
            f"historical average."
        )

        score += 15

    # New merchant
    if (
        transaction_count > 0
        and merchant_frequency == 0
    ):

        reasons.append(
            "Merchant has not appeared in "
            "the user's previous transactions."
        )

        score += 10

    # New device
    if new_device:

        reasons.append(
            "Transaction originated from "
            "a previously unseen device."
        )

        score += 10

    if reasons:

        return {
            "triggered": True,
            "rule": "PURCHASE_PATTERN",
            "severity": "HIGH",
            "message": reasons,
            "score": min(
                score,
                30
            )
        }

    return {
        "triggered": False,
        "rule": "PURCHASE_PATTERN",
        "severity": "NONE",
        "message": [],
        "score": 0
    }


# ============================================================
# RUN ALL RULES
# ============================================================

def run_fraud_rules(
    transaction,
    history_features=None
):

    if history_features is None:
        history_features = {}

    results = []

    # Rule 1
    results.append(
        check_high_value(
            transaction
        )
    )

    # Rule 2
    results.append(
        check_odd_hour(
            transaction
        )
    )

    # Rule 3
    results.append(
        check_geo_mismatch(
            transaction
        )
    )

    # Rule 4
    results.append(
        check_purchase_pattern(
            transaction,
            history_features
        )
    )

    # Only triggered rules
    triggered_rules = [
        rule
        for rule in results
        if rule["triggered"]
    ]

    total_rule_score = sum(
        rule.get("score", 0)
        for rule in triggered_rules
    )

    return {
        "rules_checked": len(results),

        "rules_triggered": len(
            triggered_rules
        ),

        "rule_score": min(
            total_rule_score,
            100
        ),

        "triggered_rules":
            triggered_rules
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    transaction = {

        "transaction_amount": 125000,

        "transaction_time":
            "2026-08-22 23:47:00",

        "latitude":
            18.5204,

        "longitude":
            73.8567,

        "billing_latitude":
            32.7266,

        "billing_longitude":
            74.8570
    }

    history = {

        "card_transaction_count": 42,

        "amount_vs_card_mean": 5.3,

        "merchant_frequency": 0,

        "new_device": 1
    }

    result = run_fraud_rules(
        transaction,
        history
    )

    print("\nFRAUD RULE RESULTS")
    print("=" * 50)

    print(
        "Rules triggered:",
        result["rules_triggered"]
    )

    print(
        "Rule score:",
        result["rule_score"]
    )

    for rule in result["triggered_rules"]:

        print(
            "\n🚨",
            rule["rule"]
        )

        print(
            rule.get(
                "message",
                ""
            )
        )