import json
import re
from django.conf import settings


class AIService:
    """Service for AI-powered content generation using Google Gemini."""

    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.client = None
        self._initialized = False

    def _initialize(self):
        """Lazily initialize the Gemini client."""
        if self._initialized:
            return

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not configured in settings")

        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            self._initialized = True
        except ImportError:
            raise ImportError("google-genai package not installed")

    def _generate(self, prompt):
        """Generate content using the Gemini API."""
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text

    def generate_full_post(self, topic, keywords=None, tone='professional'):
        """
        Generate a complete blog post from a topic.

        Args:
            topic: The main topic or title idea
            keywords: Optional list of SEO keywords to include
            tone: Writing tone (professional, friendly, informative)

        Returns:
            Dict with title, content, excerpt, meta_title, meta_description, faq_data
        """
        self._initialize()

        keywords_str = ', '.join(keywords) if keywords else 'tile installation, home improvement'

        prompt = f"""You are a content writer for Tola Tiles, a premium tile installation company in St. Augustine, Florida.
Write a comprehensive blog post about: {topic}

Requirements:
- Write in a {tone} tone
- Include these keywords naturally: {keywords_str}
- Target audience: homeowners considering tile installation or renovation
- Include practical tips and expert advice
- Mention St. Augustine/North Florida region where relevant
- Content should be 800-1200 words

Return your response as valid JSON with this exact structure:
{{
    "title": "Compelling SEO-friendly title (50-60 chars)",
    "content": "Full HTML content with proper headings (h2, h3), paragraphs, and lists. Use <h2> for main sections and <h3> for subsections. Do NOT include h1 tags.",
    "excerpt": "Brief 2-3 sentence summary. STRICT LIMIT: MAXIMUM 300 characters total. Count carefully.",
    "meta_title": "SEO title. STRICT LIMIT: MAXIMUM 60 characters total. Count carefully.",
    "meta_description": "SEO description with call to action. STRICT LIMIT: MAXIMUM 160 characters total. Count carefully.",
    "faq_data": [
        {{"question": "Common question 1?", "answer": "Detailed answer"}},
        {{"question": "Common question 2?", "answer": "Detailed answer"}},
        {{"question": "Common question 3?", "answer": "Detailed answer"}}
    ]
}}

Return ONLY the JSON, no markdown code blocks or additional text."""

        response = self._generate(prompt)
        return self._parse_json_response(response)

    def generate_section(self, section_type, context, existing_content=None):
        """
        Generate a specific section of a blog post.

        Args:
            section_type: intro, body, conclusion, or faq
            context: Topic or description of what to write about
            existing_content: Optional existing content for context

        Returns:
            Dict with the generated content
        """
        self._initialize()

        section_prompts = {
            'intro': f"""Write an engaging introduction for a blog post about: {context}

Requirements:
- 2-3 paragraphs that hook the reader
- Establish expertise and credibility
- Preview what the article will cover
- Include relevant keywords naturally
- Tone: professional but approachable

Return as JSON: {{"content": "HTML intro paragraphs"}}""",

            'body': f"""Write the main body content for a blog post about: {context}

Existing content for context:
{existing_content or 'None provided'}

Requirements:
- 3-5 detailed sections with h2 and h3 headings
- Include practical tips and examples
- Use bullet points and numbered lists where appropriate
- Total: 500-800 words
- Tone: informative and helpful

Return as JSON: {{"content": "HTML body content with headings"}}""",

            'conclusion': f"""Write a strong conclusion for a blog post about: {context}

Requirements:
- Summarize key points
- Include a clear call-to-action
- Encourage readers to contact Tola Tiles
- Mention free estimates or consultations
- 2-3 paragraphs

Return as JSON: {{"content": "HTML conclusion paragraphs"}}""",

            'faq': f"""Generate 4-5 frequently asked questions and answers about: {context}

Requirements:
- Questions homeowners would actually ask
- Detailed, helpful answers (2-4 sentences each)
- Include pricing considerations where relevant
- Include maintenance tips where relevant

Return as JSON:
{{
    "faq_data": [
        {{"question": "Question 1?", "answer": "Answer 1"}},
        {{"question": "Question 2?", "answer": "Answer 2"}}
    ]
}}"""
        }

        prompt = section_prompts.get(section_type)
        if not prompt:
            raise ValueError(f"Invalid section_type: {section_type}")

        response = self._generate(prompt)
        return self._parse_json_response(response)

    def generate_seo(self, title, content):
        """
        Generate SEO meta tags from existing content.

        Args:
            title: The post title
            content: The post content (HTML)

        Returns:
            Dict with meta_title, meta_description, suggested_slug
        """
        self._initialize()

        # Truncate content if too long
        content_preview = content[:3000] if len(content) > 3000 else content

        prompt = f"""Analyze this blog post and generate SEO metadata:

Title: {title}

Content:
{content_preview}

Generate optimized SEO metadata for this tile installation company blog post.

Return as JSON:
{{
    "meta_title": "SEO title. STRICT LIMIT: MAXIMUM 60 characters total. Count carefully.",
    "meta_description": "Compelling description with CTA. STRICT LIMIT: MAXIMUM 160 characters total. Count carefully.",
    "suggested_slug": "url-friendly-slug-with-keywords"
}}

Return ONLY the JSON."""

        response = self._generate(prompt)
        return self._parse_json_response(response)

    def improve_content(self, content, instructions):
        """
        Improve existing content based on instructions.

        Args:
            content: Existing HTML content
            instructions: What improvements to make

        Returns:
            Dict with improved content
        """
        self._initialize()

        prompt = f"""Improve this blog content based on the following instructions:

Instructions: {instructions}

Current content:
{content}

Requirements:
- Maintain the same general structure
- Keep HTML formatting
- Preserve any existing headings hierarchy
- Apply the requested improvements

Return as JSON: {{"content": "Improved HTML content"}}"""

        response = self._generate(prompt)
        return self._parse_json_response(response)

    def _enforce_character_limits(self, data):
        """Enforce character limits on generated fields."""
        limits = {
            'excerpt': 300,
            'meta_title': 60,
            'meta_description': 160,
        }

        for field, max_length in limits.items():
            if field in data and isinstance(data[field], str):
                if len(data[field]) > max_length:
                    # Truncate at word boundary if possible
                    truncated = data[field][:max_length]
                    last_space = truncated.rfind(' ')
                    if last_space > max_length - 20:  # Don't cut too much
                        truncated = truncated[:last_space]
                    # Remove trailing punctuation that looks incomplete
                    truncated = truncated.rstrip(' ,;:-')
                    data[field] = truncated

        return data

    def _parse_json_response(self, text):
        """Parse JSON from AI response, handling potential formatting issues."""
        # Remove markdown code blocks if present
        text = text.strip()
        if text.startswith('```'):
            # Find the end of the code block marker
            lines = text.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]  # Remove opening ```json or ```
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]  # Remove closing ```
            text = '\n'.join(lines)

        # Try to parse JSON
        try:
            data = json.loads(text)
            return self._enforce_character_limits(data)
        except json.JSONDecodeError:
            # Try to find JSON object in text
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                    return self._enforce_character_limits(data)
                except json.JSONDecodeError:
                    pass

            # Return error structure
            return {
                'error': 'Failed to parse AI response',
                'raw_response': text[:500]
            }
