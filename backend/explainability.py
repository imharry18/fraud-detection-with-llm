# explainability.py
# backend/explainability.py

# ============================================================
# EXPLAINABILITY ENGINE
# ============================================================
import os
import json
from google import genai

def call_gemini_explanation(transaction, risk_score, risk_level, rule_reasons):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
        
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Act as a 100% confident fraud detection expert. Review this transaction and risk result, and provide a short JSON response.
        
        Transaction Amount: {transaction.get('transaction_amount')}
        Risk Score: {risk_score}/100 ({risk_level})
        Anomalies Found: {', '.join([r['title'] for r in rule_reasons]) if rule_reasons else 'None'}
        
        Output a valid JSON object with EXACTLY these two keys:
        - "summary": A short, highly confident 1-2 sentence explanation of the final decision.
        - "reasons": An array of objects, each with a "title", "description" (short), and "severity" ("HIGH", "MEDIUM", or "LOW").

        JSON format only.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        return json.loads(response.text)
    except Exception as e:
        print("Gemini API Error:", e)
        return None


def generate_explanation(
    transaction,
    features,
    rule_result,
    risk_result
):
    """
    Generate human-readable reasons for the fraud decision.
    """

    reasons = []

    # ========================================================
    # 1. HIGH VALUE
    # ========================================================

    amount = float(
        transaction.get(
            "transaction_amount",
            0
        )
    )

    if amount >= 50000:

        reasons.append({
            "type": "HIGH_VALUE",
            "severity": "HIGH",
            "title": "Unusually high transaction value",
            "description": (
                f"Transaction amount is "
                f"₹{amount:,.2f}, exceeding the "
                f"configured high-value threshold."
            )
        })


    # ========================================================
    # 2. AMOUNT DEVIATION
    # ========================================================

    amount_ratio = features.get(
        "amount_vs_card_mean",
        1
    )

    try:
        amount_ratio = float(
            amount_ratio
        )
    except (TypeError, ValueError):
        amount_ratio = 1.0

    if amount_ratio >= 3:

        reasons.append({
            "type": "AMOUNT_ANOMALY",
            "severity": "HIGH",
            "title": "Spending amount is abnormal",
            "description": (
                f"This transaction is "
                f"{amount_ratio:.1f}× higher than "
                f"the card's historical average."
            )
        })


    # ========================================================
    # 3. ODD HOUR
    # ========================================================

    is_night = features.get(
        "is_night",
        0
    )

    if is_night:

        hour = features.get(
            "hour",
            0
        )

        reasons.append({
            "type": "ODD_HOUR",
            "severity": "MEDIUM",
            "title": "Unusual transaction time",
            "description": (
                f"Transaction occurred at "
                f"{int(hour):02d}:00, during "
                f"an unusual activity period."
            )
        })


    # ========================================================
    # 4. GEO MISMATCH
    # ========================================================

    geo_mismatch = features.get(
        "geo_mismatch",
        0
    )

    distance = features.get(
        "geo_distance_km",
        0
    )

    if geo_mismatch:

        reasons.append({
            "type": "GEO_MISMATCH",
            "severity": "HIGH",
            "title": "Location anomaly detected",
            "description": (
                f"Transaction location is approximately "
                f"{float(distance):,.0f} km from the "
                f"billing location."
            )
        })


    # ========================================================
    # 5. NEW DEVICE
    # ========================================================

    new_device = features.get(
        "new_device",
        0
    )

    if new_device:

        reasons.append({
            "type": "NEW_DEVICE",
            "severity": "HIGH",
            "title": "Previously unseen device",
            "description": (
                "The transaction originated from "
                "a device not previously associated "
                "with this card."
            )
        })


    # ========================================================
    # 6. NEW MERCHANT
    # ========================================================

    merchant_frequency = features.get(
        "merchant_frequency",
        0
    )

    transaction_count = features.get(
        "card_transaction_count",
        0
    )

    if (
        transaction_count > 0
        and merchant_frequency == 0
    ):

        reasons.append({
            "type": "NEW_MERCHANT",
            "severity": "MEDIUM",
            "title": "Unusual merchant",
            "description": (
                "This merchant has not appeared "
                "in the card's previous transaction history."
            )
        })


    # ========================================================
    # 7. RULE ENGINE REASONS
    # ========================================================

    triggered_rules = (
        rule_result.get(
            "triggered_rules",
            []
        )
        if rule_result
        else []
    )

    existing_types = {
        r.get("type")
        for r in reasons
    }

    for rule in triggered_rules:

        rule_name = rule.get(
            "rule",
            "UNKNOWN"
        )

        # Avoid duplicating explanations
        if rule_name in existing_types:
            continue

        message = rule.get(
            "message",
            ""
        )

        if isinstance(
            message,
            list
        ):
            message = " ".join(
                str(x)
                for x in message
            )

        if not message:
            message = (
                f"{rule_name.replace('_', ' ').title()} "
                "rule was triggered."
            )

        reasons.append({

            "type":
                rule_name,

            "severity":
                rule.get(
                    "severity",
                    "MEDIUM"
                ),

            "title":
                rule_name
                .replace(
                    "_",
                    " "
                )
                .title(),

            "description":
                str(message)
        })


    # ========================================================
    # 8. SORT BY SEVERITY
    # ========================================================

    severity_order = {
        "CRITICAL": 0,
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 3
    }

    reasons.sort(
        key=lambda x:
            severity_order.get(
                x.get(
                    "severity",
                    "LOW"
                ),
                3
            )
    )


    # ========================================================
    # 9. SUMMARY
    # ========================================================

    risk_score = risk_result.get(
        "risk_score",
        0
    )

    risk_level = risk_result.get(
        "risk_level",
        "LOW"
    )

    if reasons:

        summary = (
            f"{len(reasons)} anomaly signal(s) "
            f"contributed to the {risk_level.lower()} "
            f"risk assessment."
        )

    else:

        summary = (
            "No significant transaction anomalies "
            "were detected."
        )

    # --- GEMINI INTEGRATION ---
    gemini_output = call_gemini_explanation(transaction, risk_score, risk_level, reasons)
    if gemini_output:
        summary = gemini_output.get("summary", summary)
        gemini_reasons = gemini_output.get("reasons", [])
        if gemini_reasons and isinstance(gemini_reasons, list):
            reasons = gemini_reasons


    return {

        "summary":
            summary,

        "reason_count":
            len(reasons),

        "reasons":
            reasons,

        "top_reasons":
            reasons[:5],

        "risk_score":
            risk_score,

        "risk_level":
            risk_level
    }


# ============================================================
# SIMPLE FRONTEND VERSION
# ============================================================

def get_frontend_explanations(
    explanation
):
    """
    Return only the information the frontend
    needs to display.
    """

    reasons = explanation.get(
        "top_reasons",
        []
    )

    return [

        {
            "title":
                reason["title"],

            "description":
                reason["description"],

            "severity":
                reason["severity"]
        }

        for reason in reasons
    ]


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    transaction = {

        "transaction_amount":
            12500
    }

    features = {

        "amount_vs_card_mean":
            5.3,

        "is_night":
            1,

        "hour":
            23,

        "geo_mismatch":
            1,

        "geo_distance_km":
            1450,

        "new_device":
            1,

        "merchant_frequency":
            0,

        "card_transaction_count":
            42
    }

    rule_result = {

        "rules_triggered":
            4,

        "triggered_rules": [

            {
                "rule":
                    "HIGH_VALUE",

                "severity":
                    "HIGH",

                "message":
                    "High value transaction."
            }
        ]
    }

    risk_result = {

        "risk_score":
            91,

        "risk_level":
            "CRITICAL"
    }

    result = generate_explanation(

        transaction,

        features,

        rule_result,

        risk_result
    )

    print("\n")
    print("=" * 60)
    print("FRAUD EXPLANATION")
    print("=" * 60)

    print(
        "\nSummary:",
        result["summary"]
    )

    print(
        "\nReasons:"
    )

    for reason in result["top_reasons"]:

        print(
            f"\n[{reason['severity']}] "
            f"{reason['title']}"
        )

        print(
            reason["description"]
        )