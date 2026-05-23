import os
import cv2
import numpy as np

from PIL import (
    Image,
    ImageChops,
    ImageEnhance
)

# ----------------------------------------
# ELA FUNCTION
# ----------------------------------------

def perform_ela(image_path, quality=90):

    temp_path = "temp_ela.jpg"

    # Open original image
    original = Image.open(image_path).convert("RGB")

    # Save compressed temporary version
    original.save(
        temp_path,
        "JPEG",
        quality=quality
    )

    compressed = Image.open(temp_path)

    # Compute difference
    diff = ImageChops.difference(
        original,
        compressed
    )

    # Get maximum difference
    extrema = diff.getextrema()

    max_diff = max(

        ex[1] for ex in extrema
    )

    if max_diff == 0:

        max_diff = 1

    # Enhance brightness of differences
    scale = 255.0 / max_diff

    enhancer = ImageEnhance.Brightness(diff)

    diff = enhancer.enhance(scale)

    # Convert to numpy array
    ela_array = np.array(diff)

    # Cleanup
    if os.path.exists(temp_path):

        os.remove(temp_path)

    return ela_array


# ----------------------------------------
# MAIN CV FRAUD FUNCTION
# ----------------------------------------

def run_cv_fraud_checks(file_path):

    # ----------------------------------------
    # HANDLE PDFs
    # ----------------------------------------

    if file_path.lower().endswith(".pdf"):

        return {

            "ela_anomaly_score": 0.0,

            "splicing_detected": False,

            "compression_variance": "PDF analysis skipped",

            "tampering_probability": "Low",

            "suspicious_regions_detected": 0
        }

    try:

        # ----------------------------------------
        # PERFORM ELA
        # ----------------------------------------

        ela_result = perform_ela(file_path)

        # ----------------------------------------
        # CALCULATE ANOMALY PIXELS
        # ----------------------------------------

        anomaly_pixels = np.sum(
            ela_result > 30
        )

        total_pixels = ela_result.size

        anomaly_ratio = anomaly_pixels / total_pixels

        # ----------------------------------------
        # NORMALIZE SCORE
        # ----------------------------------------

        ela_score = min(
            round(anomaly_ratio * 5, 2),
            1.0
        )

        # ----------------------------------------
        # OPENCV REGION DETECTION
        # ----------------------------------------

        gray = cv2.cvtColor(
            ela_result,
            cv2.COLOR_BGR2GRAY
        )

        _, threshold = cv2.threshold(
            gray,
            50,
            255,
            cv2.THRESH_BINARY
        )

        contours, _ = cv2.findContours(
            threshold,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        suspicious_regions = 0

        for contour in contours:

            area = cv2.contourArea(contour)

            if area > 50:

                suspicious_regions += 1

        # ----------------------------------------
        # DETERMINE RISK
        # ----------------------------------------

        splicing_detected = ela_score > 0.45

        if ela_score > 0.7:

            tampering_probability = "High"

        elif ela_score > 0.4:

            tampering_probability = "Medium"

        else:

            tampering_probability = "Low"

        # ----------------------------------------
        # RETURN RESULTS
        # ----------------------------------------

        return {

            "ela_anomaly_score": ela_score,

            "splicing_detected": splicing_detected,

            "compression_variance": (
                "High Anomaly"
                if ela_score > 0.45
                else "Normal"
            ),

            "tampering_probability": tampering_probability,

            "suspicious_regions_detected": suspicious_regions
        }

    except Exception as e:

        return {

            "ela_anomaly_score": 0.0,

            "splicing_detected": False,

            "compression_variance": "Analysis Failed",

            "tampering_probability": "Unknown",

            "suspicious_regions_detected": 0,

            "error": str(e)
        }