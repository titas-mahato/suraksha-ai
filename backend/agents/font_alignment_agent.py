import cv2
import numpy as np

# ----------------------------------------
# SHARPNESS ANALYSIS
# ----------------------------------------

def calculate_sharpness(image):

    # Variance of Laplacian
    # Higher variance = sharper image

    return cv2.Laplacian(
        image,
        cv2.CV_64F
    ).var()

# ----------------------------------------
# BASELINE SHIFT ANALYSIS
# ----------------------------------------

def detect_baseline_shifts(binary_image):

    # Horizontal projection profile
    horizontal_histogram = np.sum(
        binary_image,
        axis=1
    )

    # Measure sudden spacing variations
    spacing_changes = np.diff(
        horizontal_histogram
    )

    threshold = (

        np.mean(np.abs(spacing_changes))
        +
        3 * np.std(spacing_changes)
    )

    anomaly_count = np.sum(

        np.abs(spacing_changes) > threshold
    )

    return anomaly_count

# ----------------------------------------
# MAIN FONT & ALIGNMENT ANALYSIS
# ----------------------------------------

def analyze_fonts_and_alignment(file_path):

    # ----------------------------------------
    # PDF HANDLING
    # ----------------------------------------

    if file_path.lower().endswith(".pdf"):

        return {

            "baseline_shift_detected": False,

            "sharpness_mismatch": False,

            "font_inconsistency_detected": False,

            "alignment_risk_level": "PDF analysis skipped",

            "raw_sharpness_score": 0,

            "baseline_anomaly_score": 0
        }

    # ----------------------------------------
    # LOAD IMAGE
    # ----------------------------------------

    image = cv2.imread(
        file_path,
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:

        return {

            "baseline_shift_detected": False,

            "sharpness_mismatch": False,

            "font_inconsistency_detected": False,

            "alignment_risk_level": "Analysis Failed",

            "raw_sharpness_score": 0,

            "baseline_anomaly_score": 0
        }

    # ----------------------------------------
    # SHARPNESS ANALYSIS
    # ----------------------------------------

    sharpness_score = calculate_sharpness(
        image
    )

    sharpness_mismatch = (
        sharpness_score > 1500
    )

    # ----------------------------------------
    # THRESHOLD IMAGE
    # ----------------------------------------

    _, threshold_image = cv2.threshold(

        image,

        0,

        255,

        cv2.THRESH_BINARY_INV
        +
        cv2.THRESH_OTSU
    )

    # ----------------------------------------
    # BASELINE ANALYSIS
    # ----------------------------------------

    baseline_anomalies = detect_baseline_shifts(
        threshold_image
    )

    baseline_shift_detected = (
        baseline_anomalies > 50
    )

    # ----------------------------------------
    # FONT INCONSISTENCY LOGIC
    # ----------------------------------------

    font_inconsistency_detected = (

        sharpness_mismatch
        and
        baseline_shift_detected
    )

    # ----------------------------------------
    # RISK LEVEL
    # ----------------------------------------

    if (
        sharpness_mismatch
        and
        baseline_shift_detected
    ):

        risk_level = "High"

    elif (
        sharpness_mismatch
        or
        baseline_shift_detected
    ):

        risk_level = "Medium"

    else:

        risk_level = "Low"

    # ----------------------------------------
    # RETURN RESULTS
    # ----------------------------------------

    return {

        "baseline_shift_detected":
            baseline_shift_detected,

        "sharpness_mismatch":
            sharpness_mismatch,

        "font_inconsistency_detected":
            font_inconsistency_detected,

        "alignment_risk_level":
            risk_level,

        "raw_sharpness_score":
            round(sharpness_score, 2),

        "baseline_anomaly_score":
            int(baseline_anomalies)
    }