# feature_engineering.py
# backend/feature_engineering.py

import numpy as np
import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

# These are the human-readable inputs your frontend can send.
REQUIRED_INPUTS = [
    "transaction_amount",
    "transaction_time",
    "card_id",
    "merchant_id",
    "merchant_category",
    "payment_type",
    "latitude",
    "longitude",
    "billing_latitude",
    "billing_longitude",
    "device_id",
    "email_domain",
]


# ============================================================
# SAFE VALUE HELPERS
# ============================================================

def safe_value(data, key, default=np.nan):
    """Safely get a value from transaction data."""
    value = data.get(key, default)

    if value is None or value == "":
        return default

    return value


def safe_float(value, default=np.nan):
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


# ============================================================
# TIME FEATURES
# ============================================================

def create_time_features(transaction):
    """
    Generate time-related ML features.
    """

    timestamp = pd.to_datetime(
        safe_value(
            transaction,
            "transaction_time"
        ),
        errors="coerce"
    )

    if pd.isna(timestamp):

        return {
            "hour": 12,
            "day": 0,
            "weekday": 0,
            "week": 0,
            "is_night": 0,
            "hour_sin": 0.0,
            "hour_cos": 1.0,
        }

    hour = timestamp.hour

    # Number of days since Unix epoch.
    # This is only a real-time approximation because
    # TransactionDT in IEEE-CIS is dataset-relative.
    day = (
        timestamp.value //
        (10**9 * 86400)
    )

    weekday = timestamp.weekday()

    week = day // 7

    is_night = int(
        hour < 6 or hour >= 23
    )

    hour_sin = np.sin(
        2 * np.pi * hour / 24
    )

    hour_cos = np.cos(
        2 * np.pi * hour / 24
    )

    return {
        "hour": int(hour),
        "day": int(day),
        "weekday": int(weekday),
        "week": int(week),
        "is_night": is_night,
        "hour_sin": float(hour_sin),
        "hour_cos": float(hour_cos),
    }


# ============================================================
# AMOUNT FEATURES
# ============================================================

def create_amount_features(transaction):
    """
    Generate transaction amount features.
    """

    amount = safe_float(
        transaction.get(
            "transaction_amount"
        ),
        0.0
    )

    amount = max(amount, 0.0)

    log_amount = np.log1p(amount)

    amount_decimal = (
        amount - np.floor(amount)
    )

    return {
        "TransactionAmt": amount,
        "log_amount": float(log_amount),
        "amount_decimal": float(amount_decimal),
    }


# ============================================================
# BEHAVIORAL IDENTIFIERS
# ============================================================

def create_behavioral_features(transaction):
    """
    Create identifiers used for behavioral/frequency features.
    """

    card = str(
        safe_value(
            transaction,
            "card_id",
            "UNKNOWN"
        )
    )

    address = str(
        safe_value(
            transaction,
            "billing_address",
            "UNKNOWN"
        )
    )

    email = str(
        safe_value(
            transaction,
            "email_domain",
            "UNKNOWN"
        )
    )

    device = str(
        safe_value(
            transaction,
            "device_id",
            "UNKNOWN"
        )
    )

    uid_card_addr = (
        card + "_" + address
    )

    uid_card_email = (
        card + "_" + email
    )

    uid_card_device = (
        card + "_" + device
    )

    return {
        "UID_card_addr": uid_card_addr,
        "UID_card_email": uid_card_email,
        "UID_card_device": uid_card_device,
    }


# ============================================================
# LOCATION FEATURES
# ============================================================

def haversine_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculate distance between two GPS coordinates in km.
    """

    lat1 = safe_float(lat1)
    lon1 = safe_float(lon1)
    lat2 = safe_float(lat2)
    lon2 = safe_float(lon2)

    if any(
        np.isnan(x)
        for x in [lat1, lon1, lat2, lon2]
    ):
        return np.nan

    radius = 6371.0

    lat1 = np.radians(lat1)
    lat2 = np.radians(lat2)

    dlat = lat2 - lat1

    dlon = np.radians(
        lon2 - lon1
    )

    a = (
        np.sin(dlat / 2) ** 2
        +
        np.cos(lat1)
        * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    c = 2 * np.arcsin(
        np.sqrt(a)
    )

    return float(radius * c)


def create_location_features(transaction):

    distance = haversine_distance(
        transaction.get("latitude"),
        transaction.get("longitude"),
        transaction.get("billing_latitude"),
        transaction.get("billing_longitude"),
    )

    return {
        "geo_distance_km": distance
        if not np.isnan(distance)
        else 0.0,

        "geo_mismatch": int(
            distance > 500
        )
        if not np.isnan(distance)
        else 0,
    }


# ============================================================
# HISTORY FEATURES
# ============================================================

def create_history_features(
    transaction,
    history=None
):
    """
    Generate behavioral features from previous
    transactions for this card/user.

    history should be a list of dictionaries.
    """

    if history is None:
        history = []

    amount = safe_float(
        transaction.get(
            "transaction_amount"
        ),
        0.0
    )

    card_history = [
        h for h in history
        if str(
            h.get("card_id")
        ) == str(
            transaction.get("card_id")
        )
    ]

    if not card_history:

        return {
            "card_transaction_count": 0,
            "card_amount_mean": amount,
            "card_amount_std": 0.0,
            "card_amount_median": amount,
            "amount_vs_card_mean": 1.0,
            "amount_vs_card_median": 1.0,
            "card_amount_zscore": 0.0,
            "new_device": 1,
            "merchant_frequency": 0,
        }

    amounts = np.array([
        safe_float(
            h.get(
                "transaction_amount"
            ),
            0.0
        )
        for h in card_history
    ])

    mean_amount = float(
        np.mean(amounts)
    )

    std_amount = float(
        np.std(amounts)
    )

    median_amount = float(
        np.median(amounts)
    )

    amount_vs_mean = (
        amount /
        (mean_amount + 1e-6)
    )

    amount_vs_median = (
        amount /
        (median_amount + 1e-6)
    )

    zscore = (
        (amount - mean_amount)
        /
        (std_amount + 1e-6)
    )

    current_device = str(
        transaction.get(
            "device_id",
            ""
        )
    )

    previous_devices = {
        str(
            h.get(
                "device_id",
                ""
            )
        )
        for h in card_history
    }

    current_merchant = str(
        transaction.get(
            "merchant_id",
            ""
        )
    )

    merchant_frequency = sum(
        str(
            h.get(
                "merchant_id",
                ""
            )
        ) == current_merchant
        for h in card_history
    )

    return {
        "card_transaction_count":
            len(card_history),

        "card_amount_mean":
            mean_amount,

        "card_amount_std":
            std_amount,

        "card_amount_median":
            median_amount,

        "amount_vs_card_mean":
            float(
                np.clip(
                    amount_vs_mean,
                    0,
                    100
                )
            ),

        "amount_vs_card_median":
            float(
                np.clip(
                    amount_vs_median,
                    0,
                    100
                )
            ),

        "card_amount_zscore":
            float(
                np.clip(
                    zscore,
                    -100,
                    100
                )
            ),

        "new_device":
            int(
                current_device
                not in previous_devices
            ),

        "merchant_frequency":
            merchant_frequency,
    }


# ============================================================
# RULE-READY FEATURES
# ============================================================

def create_rule_features(
    transaction,
    history_features
):
    """
    Features that will also be used by the
    separate rule engine.
    """

    amount = safe_float(
        transaction.get(
            "transaction_amount"
        ),
        0.0
    )

    timestamp = pd.to_datetime(
        transaction.get(
            "transaction_time"
        ),
        errors="coerce"
    )

    hour = (
        timestamp.hour
        if not pd.isna(timestamp)
        else 12
    )

    return {

        "high_value_transaction":
            int(amount >= 50000),

        "odd_hour_transaction":
            int(
                hour < 6 or hour >= 23
            ),

        "unusual_amount":
            int(
                history_features[
                    "amount_vs_card_mean"
                ] >= 3
            ),

        "new_device":
            history_features[
                "new_device"
            ],

        "unusual_merchant":
            int(
                history_features[
                    "merchant_frequency"
                ] == 0
                and
                history_features[
                    "card_transaction_count"
                ] > 0
            ),
    }


# ============================================================
# MAIN FEATURE ENGINEERING FUNCTION
# ============================================================

def engineer_transaction_features(
    transaction,
    history=None
):
    """
    Main function.

    Input:
        transaction = dictionary from frontend

    Output:
        dictionary containing all real-time
        engineered features.
    """

    if history is None:
        history = []

    features = {}

    # Amount
    features.update(
        create_amount_features(
            transaction
        )
    )

    # Time
    features.update(
        create_time_features(
            transaction
        )
    )

    # Behavioral IDs
    behavioral = (
        create_behavioral_features(
            transaction
        )
    )

    # Don't directly send raw UID strings
    # into LightGBM; use them for application logic.
    features.update(
        behavioral
    )

    # Location
    features.update(
        create_location_features(
            transaction
        )
    )

    # Historical behavior
    history_features = (
        create_history_features(
            transaction,
            history
        )
    )

    features.update(
        history_features
    )

    # Rules
    rule_features = (
        create_rule_features(
            transaction,
            history_features
        )
    )

    features.update(
        rule_features
    )

    return features


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    example_transaction = {

        "transaction_amount": 12500,

        "transaction_time":
            "2026-08-22 23:47:00",

        "card_id":
            "CARD_10293",

        "merchant_id":
            "MERCHANT_8392",

        "merchant_category":
            "Electronics",

        "payment_type":
            "Credit",

        "latitude":
            18.5204,

        "longitude":
            73.8567,

        "billing_latitude":
            32.7266,

        "billing_longitude":
            74.8570,

        "device_id":
            "DEVICE_9281",

        "email_domain":
            "gmail.com",
    }

    example_history = [

        {
            "card_id":
                "CARD_10293",

            "transaction_amount":
                2200,

            "merchant_id":
                "MERCHANT_100",

            "device_id":
                "DEVICE_100"
        },

        {
            "card_id":
                "CARD_10293",

            "transaction_amount":
                2800,

            "merchant_id":
                "MERCHANT_200",

            "device_id":
                "DEVICE_100"
        }
    ]

    result = engineer_transaction_features(
        example_transaction,
        example_history
    )

    print("\nGenerated features:\n")

    for key, value in result.items():
        print(
            f"{key:<30} : {value}"
        )