"""
LLM Grounded Explanation & Multilingual Service.
Owned by: Member 1 (AI + RAG + Data)

Provides grounded, citation-backed answers to user queries using Google Gemini,
strictly enforcing that the LLM does NOT determine eligibility.
Falls back cleanly to context synthesis when offline or without API key.
Supports conversation history for follow-up questions.
"""

import logging
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.rag.language import (
    get_disclaimer,
    get_language_config,
    get_llm_language_instruction,
    get_no_results_message,
)

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = """You are SchemeSaathi AI, an authoritative, helpful, and empathetic assistant for Indian government schemes, scholarships, and citizen welfare programs.

CRITICAL OPERATIONAL RULES & CONSTRAINTS:
1. GROUNDED IN CONTEXT: Answer strictly and exclusively using the provided Verified Scheme Context. Do not invent, extrapolate, or hallucinate benefits, dates, criteria, or eligibility requirements.
2. NO ELIGIBILITY DETERMINATION: You must NOT make any definitive eligibility determinations (e.g., never say 'You are eligible' or 'You are ineligible'). Eligibility is solely determined by the deterministic Rules Engine and competent government authorities. Instead, say: 'Based on official guidelines, you may meet criteria such as...' and refer them to official verification.
3. CITATION OF SOURCES: Always explicitly reference the scheme name, governing ministry/department, and official portal link from the provided context.
4. HONEST UNCERTAINTY: If the provided context does not contain the answer, explicitly state that verified guidelines on this point are not available in the current database, and advise the citizen to check the official portal.
5. MULTILINGUAL SUPPORT: Respond in the requested language (English, Hindi, or Kannada) with natural, respectful phrasing.
6. FOLLOW-UP AWARENESS: When conversation history is provided, use it to understand the user's ongoing inquiry context and provide coherent follow-up answers.
"""


class LLMService:
    """Service for generating grounded scheme explanations via Gemini API."""

    @staticmethod
    def build_grounded_prompt(
        query: str,
        context_chunks: List[Dict[str, Any]],
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Construct a grounded prompt combining retrieved context, conversation
        history, and user query.
        """
        context_parts = []
        for i, ch in enumerate(context_chunks, 1):
            meta = ch.get("metadata", {})
            scheme_name = meta.get("scheme_name", "Scheme")
            dept = meta.get("department", "Government Department")
            state = meta.get("state", "All India")
            source_url = meta.get("source_url", "")
            source_title = meta.get("source_title", scheme_name)
            section = ch.get("section_title", "Information")
            content = ch.get("content", "")

            context_parts.append(
                f"--- SOURCE {i} ---\n"
                f"Scheme: {scheme_name}\n"
                f"Department: {dept} ({state})\n"
                f"Section: {section}\n"
                f"Official Portal: {source_url} ({source_title})\n"
                f"Content:\n{content}\n"
            )

        context_str = "\n".join(context_parts) if context_parts else "No matching scheme context found."

        lang_instruction = get_llm_language_instruction(language)

        # Build conversation history section
        history_str = ""
        if conversation_history:
            history_parts = []
            for msg in conversation_history[-5:]:  # Last 5 turns max
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if content:
                    history_parts.append(f"{'User' if role == 'user' else 'Assistant'}: {content}")
            if history_parts:
                history_str = (
                    "\nCONVERSATION HISTORY (for follow-up context):\n"
                    + "\n".join(history_parts)
                    + "\n"
                )

        prompt = f"""VERIFIED SCHEME CONTEXT:
{context_str}
{history_str}
USER QUESTION:
{query}

INSTRUCTIONS FOR YOUR RESPONSE:
{lang_instruction}
- Summarize the relevant scheme(s) matching the user's query.
- Highlight concrete benefits and eligibility criteria from the context.
- Mention required documents and where to apply.
- Explicitly cite the official portal URL(s).
- Include the standard disclaimer that final eligibility is verified deterministically by the official Rules Engine.
"""
        return prompt

    @staticmethod
    def _fallback_generate(
        query: str,
        context_chunks: List[Dict[str, Any]],
        language: str = "en",
    ) -> str:
        """
        Deterministic, template-based synthesis when Gemini API key is missing or offline.
        Ensures the system never breaks and returns fully grounded information.
        """
        if not context_chunks:
            return get_no_results_message(language)

        # Collect unique schemes
        seen_schemes: Dict[str, Dict[str, Any]] = {}
        for ch in context_chunks:
            meta = ch.get("metadata", {})
            sid = ch.get("scheme_id") or meta.get("scheme_id")
            if sid and sid not in seen_schemes:
                seen_schemes[sid] = {
                    "name": meta.get("scheme_name", "Government Scheme"),
                    "dept": meta.get("department", "State / Central Government"),
                    "state": meta.get("state", "All India"),
                    "url": meta.get("source_url", "https://www.india.gov.in/"),
                    "title": meta.get("source_title", "Official Portal"),
                    "snippet": ch.get("content", "").split("\n")[-1],
                }

        lines = [
            f'Here is verified government scheme information matching your inquiry: **"{query}"**\n'
        ]

        for i, (sid, info) in enumerate(seen_schemes.items(), 1):
            lines.append(f"### {i}. {info['name']}")
            lines.append(f"- **Department / Ministry**: {info['dept']} ({info['state']})")
            lines.append(f"- **Key Details**: {info['snippet']}")
            lines.append(f"- **Official Portal**: [{info['title']}]({info['url']})")
            lines.append("")

        lines.append(f"\n> {get_disclaimer(language)}")

        return "\n".join(lines)

    @classmethod
    def generate_explanation(
        cls,
        query: str,
        context_chunks: List[Dict[str, Any]],
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        **kwargs: Any,
    ) -> str:
        """
        Generate a grounded scheme explanation using Gemini API,
        or fall back gracefully to template synthesis if unavailable.

        Args:
            query: The user's natural-language question.
            context_chunks: Retrieved scheme chunks with metadata.
            language: Response language code (en, hi, kn).
            conversation_history: Optional list of prior conversation turns.
        """
        api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

        if not api_key:
            logger.info("No GEMINI_API_KEY found; using structured fallback explanation.")
            return cls._fallback_generate(query, context_chunks, language=language)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = cls.build_grounded_prompt(
                query=query,
                context_chunks=context_chunks,
                language=language,
                conversation_history=conversation_history,
            )

            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,  # Low temperature for strict factual grounding
                max_output_tokens=1024,
            )

            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=config,
            )

            if response and response.text:
                return response.text.strip()
            else:
                return cls._fallback_generate(query, context_chunks, language=language)

        except Exception as e:
            logger.warning(
                f"Gemini LLM generation failed ({e}); falling back to grounded template synthesis."
            )
            return cls._fallback_generate(query, context_chunks, language=language)
