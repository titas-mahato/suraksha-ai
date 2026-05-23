import re
import nltk

from collections import defaultdict
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# ----------------------------------------
# SAFE NLTK DOWNLOADS
# ----------------------------------------

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
# ----------------------------------------
# STOPWORDS
# ----------------------------------------

stop_words = set(stopwords.words('english'))

# ----------------------------------------
# DOCUMENT CATEGORY DEFINITIONS
# ----------------------------------------

document_categories = {

    "Land Record": {

        "keywords": [
            "deed",
            "land registry",
            "survey number",
            "parcel",
            "property",
            "ownership",
            "mutation",
            "patta",
            "revenue",
            "plot",
            "registry"
        ],

        "fraud_indicators": [
            "edited",
            "overwritten",
            "manual correction",
            "duplicate",
            "tampered"
        ]
    },

    "Legal Document": {

        "keywords": [
            "court",
            "agreement",
            "indemnity",
            "notary",
            "hereby",
            "affidavit",
            "legal",
            "stamp",
            "witness",
            "petition",
            "clause"
        ],

        "fraud_indicators": [
            "tampered",
            "modified",
            "unsigned",
            "missing page",
            "edited"
        ]
    },

    "Financial Statement": {

        "keywords": [
            "bank",
            "transaction",
            "account",
            "balance",
            "credit",
            "debit",
            "ifsc",
            "loan",
            "statement",
            "withdrawal",
            "deposit",
            "interest",
            "payment"
        ],

        "fraud_indicators": [
            "edited",
            "corrected",
            "manual entry",
            "altered amount",
            "modified"
        ]
    }
}

# ----------------------------------------
# TEXT CLEANING FUNCTION
# ----------------------------------------

def clean_text(text):

    # Lowercase
    text = text.lower()

    # Remove special characters
    text = re.sub(r'[^a-zA-Z0-9 ]', ' ', text)

    # Tokenize text
    tokens = word_tokenize(text)

    # Remove stopwords
    filtered_tokens = [

        word for word in tokens

        if word not in stop_words
    ]

    # Join tokens back
    cleaned_text = " ".join(filtered_tokens)

    return cleaned_text


# ----------------------------------------
# DOCUMENT CLASSIFICATION FUNCTION
# ----------------------------------------

def classify_document(text):

    cleaned_text = clean_text(text)

    category_scores = defaultdict(int)

    fraud_flags = []

    # ----------------------------------------
    # CATEGORY ANALYSIS
    # ----------------------------------------

    for category, data in document_categories.items():

        # KEYWORD SCORING
        for keyword in data["keywords"]:

            occurrences = cleaned_text.count(keyword.lower())

            category_scores[category] += occurrences

        # FRAUD INDICATOR DETECTION
        for fraud_word in data["fraud_indicators"]:

            if fraud_word.lower() in cleaned_text:

                fraud_flags.append(fraud_word)

    # ----------------------------------------
    # FIND BEST CATEGORY
    # ----------------------------------------

    best_category = max(
        category_scores,
        key=category_scores.get
    )

    # If all scores are 0
    if category_scores[best_category] == 0:

        best_category = "Unknown Document Type"

    # ----------------------------------------
    # RETURN RESULTS
    # ----------------------------------------

    return {

        "document_type": best_category,

        "category_scores": dict(category_scores),

        "fraud_indicators_found": list(set(fraud_flags))
    }