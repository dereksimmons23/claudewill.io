// Text-to-speech via ElevenLabs
// Supports multiple voices via `voice` parameter

const VOICES = {
  derek: process.env.ELEVENLABS_DEREK_VOICE_ID,
  // cw: process.env.ELEVENLABS_CW_VOICE_ID,       // Phase 2
  // mirae: process.env.ELEVENLABS_MIRAE_VOICE_ID,  // Phase 3
};

const ALLOWED_ORIGINS = [
  'https://claudewill.io',
  'https://www.claudewill.io',
  'http://localhost:8888',
  'http://localhost:3000'
];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = getCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ElevenLabs not configured' })
    };
  }

  let text, voice;
  try {
    const body = JSON.parse(event.body || '{}');
    text = body.text;
    voice = body.voice || 'derek';
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' })
    };
  }

  if (!text || !text.trim()) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No text provided' })
    };
  }

  const voiceId = VOICES[voice];
  if (!voiceId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Unknown voice: ${voice}` })
    };
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs error:', err);
      return {
        statusCode: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'ElevenLabs error' })
      };
    }

    const audioBuffer = await response.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg'
      },
      body: Buffer.from(audioBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('Speak function error:', err);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
};
