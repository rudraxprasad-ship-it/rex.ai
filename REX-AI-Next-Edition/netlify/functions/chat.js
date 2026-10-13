exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: {'Content-Type':'application/json'}, body: JSON.stringify({error:'Method not allowed'}) };
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { statusCode: 500, headers: {'Content-Type':'application/json'}, body: JSON.stringify({error:'GEMINI_API_KEY is not configured in Netlify.'}) };
  try {
    const payload = JSON.parse(event.body || '{}');
    if (!Array.isArray(payload.messages) || payload.messages.length === 0) throw new Error('No messages provided');
    const valid = payload.messages.slice(-24).filter(m => ['user','assistant'].includes(m.role) && typeof m.content === 'string');
    const contents = valid.map((m) => {
      const parts = [{text: m.content.slice(0,12000)}];
      if (m.role === 'user' && Array.isArray(m.attachments)) {
        for (const f of m.attachments.slice(0,4)) {
          if (typeof f.base64 === 'string' && typeof f.mime === 'string' && f.mime.startsWith('image/') && f.base64.length < 11_000_000) {
            parts.push({inlineData:{mimeType:f.mime,data:f.base64}});
          } else if (typeof f.text === 'string') {
            parts.push({text:f.text.slice(0,45000)});
          }
        }
      }
      return {role:m.role === 'assistant' ? 'model' : 'user', parts};
    });
    const mode = ['General','Learn','Research','Code','Creative'].includes(payload.mode) ? payload.mode : 'General';
    const style = ['Balanced','Concise','Detailed'].includes(payload.responseStyle) ? payload.responseStyle : 'Balanced';
    const preferences = typeof payload.preferences === 'string' ? payload.preferences.slice(0,800) : '';
    const systemInstruction = `You are REX, a helpful, thoughtful AI assistant. Be accurate, clear, warm, and useful. Never claim to be ChatGPT or Gemini. Current focus mode: ${mode}. Response style: ${style}. ${style === 'Concise' ? 'Prefer concise answers unless the user asks for detail.' : style === 'Detailed' ? 'Explain carefully with examples and useful structure.' : 'Use enough detail to answer well without unnecessary padding.'} ${mode === 'Learn' ? 'Teach step by step, explain concepts simply, and use examples.' : ''} ${mode === 'Research' ? 'Compare evidence, distinguish uncertainty, and cite sources when available.' : ''} ${mode === 'Code' ? 'Give correct, runnable code and explain where it belongs.' : ''} ${mode === 'Creative' ? 'Be imaginative, specific, and original.' : ''} ${preferences ? 'User preferences: ' + preferences : ''} If you cannot access live information, say so honestly.`;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const body = {systemInstruction:{parts:[{text:systemInstruction}]},contents,generationConfig:{maxOutputTokens:4096,temperature:0.7}};
    if (payload.webSearch === true) body.tools = [{google_search:{}}];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
    const data = await response.json();
    if (!response.ok) return {statusCode:response.status,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:data.error?.message || 'Gemini request failed'})};
    const reply = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    const grounding = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = grounding.map(g => g.web).filter(w => w && w.uri).map(w => ({uri:w.uri,title:w.title || w.uri}));
    return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({reply:reply || 'I could not generate a response. Please try again.',sources})};
  } catch (err) {
    return {statusCode:400,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:err.message || 'Invalid request'})};
  }
};
