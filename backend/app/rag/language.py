"""
Multilingual i18n Support for RAG Responses.
Owned by: Member 1 (AI + RAG + Data)

Provides language detection, translation prompts, and locale-specific
formatting for English, Hindi, and Kannada. Designed to be extensible
for additional Indian languages.
"""

import logging
import re
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Supported language codes and their display names
SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en": {
        "name": "English",
        "native_name": "English",
        "script": "Latin",
        "instruction": "Please respond in clear, accessible English.",
        "disclaimer": (
            "🔒 **Official Eligibility Notice**: SchemeSaathi's AI assistant provides "
            "informational summaries only. Final binding eligibility is deterministically "
            "verified using the SchemeSaathi Rules Engine against your official uploaded documentation."
        ),
        "no_results": (
            "We could not find any verified government schemes matching your inquiry. "
            "Please verify your search keywords or visit the National Scholarship Portal "
            "(https://scholarships.gov.in/) or your State Portal for official information."
        ),
        "greeting": "How can I help you find government schemes today?",
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "script": "Devanagari",
        "instruction": (
            "कृपया स्पष्ट और सुलभ हिन्दी (देवनागरी लिपि) में उत्तर दें। "
            "तकनीकी शब्दों के लिए अंग्रेजी शब्दों का प्रयोग करें जहाँ हिन्दी शब्द आम नहीं हैं।"
        ),
        "disclaimer": (
            "🔒 **आधिकारिक पात्रता सूचना**: SchemeSaathi का AI सहायक केवल सूचनात्मक सारांश प्रदान करता है। "
            "अंतिम पात्रता SchemeSaathi Rules Engine द्वारा आपके आधिकारिक दस्तावेजों के आधार पर निर्धारित की जाती है।"
        ),
        "no_results": (
            "आपकी पूछताछ से मेल खाने वाली कोई सत्यापित सरकारी योजना नहीं मिली। "
            "कृपया अपने खोज शब्दों की जाँच करें या राष्ट्रीय छात्रवृत्ति पोर्टल "
            "(https://scholarships.gov.in/) पर जाएँ।"
        ),
        "greeting": "आज मैं आपकी सरकारी योजनाओं के बारे में कैसे मदद कर सकता हूँ?",
    },
    "kn": {
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "script": "Kannada",
        "instruction": (
            "ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟ ಮತ್ತು ಸುಲಭವಾದ ಕನ್ನಡದಲ್ಲಿ (ಕನ್ನಡ ಲಿಪಿ) ಉತ್ತರಿಸಿ। "
            "ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ ಸಾಮಾನ್ಯವಲ್ಲದ ಕನ್ನಡ ಪದಗಳ ಬದಲು ಆಂಗ್ಲ ಪದಗಳನ್ನು ಬಳಸಿ."
        ),
        "disclaimer": (
            "🔒 **ಅಧಿಕೃತ ಅರ್ಹತೆ ಸೂಚನೆ**: SchemeSaathi ನ AI ಸಹಾಯಕವು ಮಾಹಿತಿ ಸಾರಾಂಶಗಳನ್ನು ಮಾತ್ರ ಒದಗಿಸುತ್ತದೆ. "
            "ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು SchemeSaathi Rules Engine ನಿಮ್ಮ ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ನಿರ್ಧರಿಸುತ್ತದೆ."
        ),
        "no_results": (
            "ನಿಮ್ಮ ವಿಚಾರಣೆಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. "
            "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹುಡುಕಾಟ ಪದಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ "
            "(https://scholarships.gov.in/) ಗೆ ಭೇಟಿ ನೀಡಿ."
        ),
        "greeting": "ಇಂದು ನಾನು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    },
}

DEFAULT_LANGUAGE = "en"


def get_language_config(language_code: str) -> Dict[str, str]:
    """
    Get the full language configuration for a given language code.
    Falls back to English if language is not supported.
    """
    code = language_code.lower().strip() if language_code else DEFAULT_LANGUAGE
    if code not in SUPPORTED_LANGUAGES:
        logger.info(f"Language '{code}' not supported, falling back to English.")
        code = DEFAULT_LANGUAGE
    return SUPPORTED_LANGUAGES[code]


def get_llm_language_instruction(language_code: str) -> str:
    """Get the LLM instruction for responding in a specific language."""
    config = get_language_config(language_code)
    return config["instruction"]


def get_disclaimer(language_code: str) -> str:
    """Get the localized disclaimer text."""
    config = get_language_config(language_code)
    return config["disclaimer"]


def get_no_results_message(language_code: str) -> str:
    """Get the localized 'no results found' message."""
    config = get_language_config(language_code)
    return config["no_results"]


def detect_language(text: str) -> str:
    """
    Simple heuristic language detection based on Unicode script ranges.
    Returns 'en', 'hi', or 'kn'. Defaults to 'en'.

    This is a lightweight detector for routing purposes;
    the LLM handles the actual multilingual generation.
    """
    if not text:
        return DEFAULT_LANGUAGE

    # Count characters in different script ranges
    devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
    kannada_count = len(re.findall(r"[\u0C80-\u0CFF]", text))
    latin_count = len(re.findall(r"[a-zA-Z]", text))

    total = devanagari_count + kannada_count + latin_count
    if total == 0:
        return DEFAULT_LANGUAGE

    if kannada_count / total > 0.3:
        return "kn"
    if devanagari_count / total > 0.3:
        return "hi"
    return "en"


def is_language_supported(language_code: str) -> bool:
    """Check if a language code is currently supported."""
    return language_code.lower().strip() in SUPPORTED_LANGUAGES


def list_supported_languages() -> list:
    """Return a list of supported language codes with their names."""
    return [
        {"code": code, "name": config["name"], "native_name": config["native_name"]}
        for code, config in SUPPORTED_LANGUAGES.items()
    ]
