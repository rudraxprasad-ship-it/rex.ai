REX AI — NEXT EDITION

Includes:
- Claude-inspired warm ivory interface, Playfair Display headings and optional Lenia Sans font file.
- Animated intro and smoother reduced-motion-aware UI transitions.
- Gemini serverless function (Netlify) with secure environment-variable API key handling.
- Research mode with optional Gemini Google Search grounding, where supported by the configured Gemini model/API.
- Image, PDF and text/code file attachments.
- Markdown, tables, code highlighting and copyable code blocks.
- Local conversation history, chat export, settings, themes and response modes.
- Browser text-to-speech, dictation and a Live Voice toggle that alternates listening and spoken replies.

DEPLOY
1. Extract this folder. Keep index.html, netlify.toml, and netlify/functions/chat.js together.
2. Add your own logo.jpg or logo.jpeg beside index.html.
3. Deploy the entire folder to Netlify.
4. In Netlify site environment variables, set GEMINI_API_KEY to your Gemini API key. Never put the key in index.html.
5. Redeploy after setting the variable.

OPTIONAL FONT
Place a properly licensed lenia-sans.woff2 file beside index.html. Otherwise REX uses DM Sans as a fallback.

VOICE NOTES
- Browser speech synthesis uses the voices installed/available on the device.
- Speech recognition support varies by browser. Chrome usually supports it; microphone permission and a secure origin (localhost or HTTPS) are required.
- Live voice is a turn-based loop, not real-time duplex audio: REX listens, sends the transcript to Gemini, speaks the answer, then listens again.
- If speech recognition is unavailable, use Dictate if supported or type messages.

RESEARCH NOTES
Web search uses Gemini's Google Search tool if enabled in the UI and supported by the selected model. Availability and source results depend on your Gemini API/model access.

SECURITY & LIMITS
The API key remains in Netlify environment variables. Keep attachments small; this app caps each file at 8 MB and sends only a limited amount of extracted text. Do not upload sensitive information to a public demo. Consider adding usage limits before sharing widely.

Made by the Rex Group
