import os
import fitz
from datetime import datetime

# ----------------------------------------
# SUSPICIOUS SOFTWARE LIST
# ----------------------------------------

SUSPICIOUS_SOFTWARE = [

    "photoshop",
    "illustrator",
    "gimp",
    "nitro",
    "canva",
    "pdf editor",
    "foxit",
    "acrobat pro",
    "inkscape",
    "coreldraw"
]

# ----------------------------------------
# FORMAT PDF DATES
# ----------------------------------------

def format_pdf_date(pdf_date):

    try:

        if pdf_date.startswith("D:"):

            pdf_date = pdf_date[2:]

        return datetime.strptime(
            pdf_date[:14],
            "%Y%m%d%H%M%S"
        ).strftime("%Y-%m-%d %H:%M:%S")

    except:

        return "Unknown"

# ----------------------------------------
# MAIN METADATA EXTRACTION FUNCTION
# ----------------------------------------

def extract_metadata(file_path):

    metadata_summary = {

        # ----------------------------------------
        # BASIC FILE INFO
        # ----------------------------------------

        "filename": os.path.basename(file_path),

        "file_extension": os.path.splitext(file_path)[1],

        "file_size_kb": round(
            os.path.getsize(file_path) / 1024,
            2
        ),

        # ----------------------------------------
        # PDF METADATA
        # ----------------------------------------

        "pdf_format": "Unknown",

        "title": "Unknown",

        "author": "Unknown",

        "subject": "Unknown",

        "creator": "Unknown",

        "producer": "Unknown",

        "creation_date": "Unknown",

        "modification_date": "Unknown",

        "page_count": 0,

        "is_encrypted": False,

        # ----------------------------------------
        # FORENSIC FLAGS
        # ----------------------------------------

        "is_edited_externally": False,

        "metadata_missing": False,

        "suspicious_flags": []
    }

    # ----------------------------------------
    # HANDLE PDF FILES
    # ----------------------------------------

    if file_path.lower().endswith(".pdf"):

        try:

            doc = fitz.open(file_path)

            metadata = doc.metadata

            # ----------------------------------------
            # BASIC PDF INFO
            # ----------------------------------------

            metadata_summary["pdf_format"] = metadata.get(
                "format",
                "Unknown"
            )

            metadata_summary["title"] = metadata.get(
                "title",
                "Unknown"
            )

            metadata_summary["author"] = metadata.get(
                "author",
                "Unknown"
            )

            metadata_summary["subject"] = metadata.get(
                "subject",
                "Unknown"
            )

            metadata_summary["creator"] = metadata.get(
                "creator",
                "Unknown"
            )

            metadata_summary["producer"] = metadata.get(
                "producer",
                "Unknown"
            )

            metadata_summary["creation_date"] = format_pdf_date(
                metadata.get("creationDate", "")
            )

            metadata_summary["modification_date"] = format_pdf_date(
                metadata.get("modDate", "")
            )

            metadata_summary["page_count"] = len(doc)

            metadata_summary["is_encrypted"] = doc.is_encrypted

            # ----------------------------------------
            # MISSING METADATA DETECTION
            # ----------------------------------------

            important_fields = [

                metadata_summary["author"],
                metadata_summary["creator"],
                metadata_summary["producer"]
            ]

            missing_count = sum(

                1 for field in important_fields

                if field in ["", "Unknown", None]
            )

            if missing_count >= 2:

                metadata_summary[
                    "metadata_missing"
                ] = True

                metadata_summary[
                    "suspicious_flags"
                ].append(
                    "Important metadata fields missing"
                )

            # ----------------------------------------
            # SUSPICIOUS SOFTWARE DETECTION
            # ----------------------------------------

            producer_lower = str(
                metadata_summary["producer"]
            ).lower()

            creator_lower = str(
                metadata_summary["creator"]
            ).lower()

            for tool in SUSPICIOUS_SOFTWARE:

                if (
                    tool in producer_lower
                    or
                    tool in creator_lower
                ):

                    metadata_summary[
                        "is_edited_externally"
                    ] = True

                    metadata_summary[
                        "suspicious_flags"
                    ].append(
                        f"Edited using {tool}"
                    )

            # ----------------------------------------
            # TIMESTAMP CONSISTENCY CHECK
            # ----------------------------------------

            creation_date = metadata_summary[
                "creation_date"
            ]

            modification_date = metadata_summary[
                "modification_date"
            ]

            if (
                creation_date != "Unknown"
                and
                modification_date != "Unknown"
            ):

                if creation_date != modification_date:

                    metadata_summary[
                        "suspicious_flags"
                    ].append(
                        "Document modified after creation"
                    )

            # ----------------------------------------
            # ENCRYPTION FLAG
            # ----------------------------------------

            if doc.is_encrypted:

                metadata_summary[
                    "suspicious_flags"
                ].append(
                    "PDF is encrypted"
                )

            doc.close()

        except Exception as e:

            metadata_summary[
                "suspicious_flags"
            ].append(
                f"Metadata extraction failed: {str(e)}"
            )

    return metadata_summary