# ----------------------------------------
# MAIN RISK SCORING FUNCTION
# ----------------------------------------

def calculate_final_risk(

    doc_type,
    ocr_data,
    metadata,
    cv_results,
    alignment_results

):

    score = 0.0

    triggers = []

    confidence = 0.50

    # ----------------------------------------
    # METADATA ANALYSIS
    # ----------------------------------------

    if metadata.get("is_edited_externally"):

        score += 0.25

        confidence += 0.10

        triggers.append(
            "Document metadata indicates usage of external editing software"
        )

    if metadata.get("metadata_missing"):

        score += 0.10

        triggers.append(
            "Important metadata fields are missing"
        )

    if metadata.get("is_encrypted"):

        score += 0.05

        triggers.append(
            "Encrypted PDF detected"
        )

    # ----------------------------------------
    # CV FRAUD ANALYSIS
    # ----------------------------------------

    if cv_results.get("splicing_detected"):

        score += 0.35

        confidence += 0.15

        triggers.append(
            "Potential image splicing detected through ELA analysis"
        )

    ela_score = cv_results.get(
        "ela_anomaly_score",
        0
    )

    if ela_score > 0.70:

        score += 0.20

        confidence += 0.10

        triggers.append(
            "Severe ELA anomaly regions detected"
        )

    elif ela_score > 0.40:

        score += 0.10

        triggers.append(
            "Moderate ELA anomalies observed"
        )

    suspicious_regions = cv_results.get(
        "suspicious_regions_detected",
        0
    )

    if suspicious_regions > 10:

        score += 0.10

        triggers.append(
            "Multiple suspicious visual regions identified"
        )

    # ----------------------------------------
    # FONT & ALIGNMENT ANALYSIS
    # ----------------------------------------

    if alignment_results.get(
        "baseline_shift_detected"
    ):

        score += 0.15

        triggers.append(
            "Irregular baseline alignment detected"
        )

    if alignment_results.get(
        "sharpness_mismatch"
    ):

        score += 0.10

        triggers.append(
            "Sharpness inconsistencies detected"
        )

    if alignment_results.get(
        "font_inconsistency_detected"
    ):

        score += 0.15

        confidence += 0.05

        triggers.append(
            "Possible font inconsistency or pasted text detected"
        )

    # ----------------------------------------
    # OCR / NLP ANALYSIS
    # ----------------------------------------

    fraud_keywords = ocr_data.get(
        "fraud_indicators_found",
        []
    )

    if len(fraud_keywords) > 0:

        score += 0.10

        triggers.append(
            f"Suspicious textual indicators found: {', '.join(fraud_keywords)}"
        )

    # ----------------------------------------
    # DOCUMENT TYPE RISK
    # ----------------------------------------

    HIGH_RISK_DOCS = [

        "Financial Statement",
        "Land Record"
    ]

    if doc_type in HIGH_RISK_DOCS:

        score += 0.05

    # ----------------------------------------
    # NORMALIZE SCORE
    # ----------------------------------------

    final_score = min(
        round(score, 2),
        1.0
    )

    confidence = min(
        round(confidence, 2),
        0.99
    )

    # ----------------------------------------
    # FINAL RECOMMENDATION
    # ----------------------------------------

    if final_score >= 0.75:

        recommendation = (
            "REJECT / HIGH FRAUD RISK"
        )

        risk_level = "Critical"

    elif final_score >= 0.50:

        recommendation = (
            "FLAG FOR MANUAL INVESTIGATION"
        )

        risk_level = "High"

    elif final_score >= 0.25:

        recommendation = (
            "REQUIRES ADDITIONAL VERIFICATION"
        )

        risk_level = "Medium"

    else:

        recommendation = (
            "PASSED AUTOMATED UNDERWRITING"
        )

        risk_level = "Low"

    # ----------------------------------------
    # RETURN RESULTS
    # ----------------------------------------

    return {

        "fraud_score":
            final_score,

        "confidence":
            confidence,

        "risk_level":
            risk_level,

        "recommendation":
            recommendation,

        "risk_triggers":
            triggers
    }