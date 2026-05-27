import { audioMap } from './audioMap.js';

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
const MODEL_ID = 'eleven_multilingual_v2';
const API_KEY = (import.meta.env.VITE_ELEVENLABS_API_KEY || '').trim();

export const VOICE_SETTINGS = {
  // Polite / measured settings: slightly higher stability, gentler style values
  celebration:   { stability: 0.22, similarity_boost: 0.40, style: 0.55, use_speaker_boost: true },
  encouragement: { stability: 0.24, similarity_boost: 0.45, style: 0.50, use_speaker_boost: true },
  question:      { stability: 0.28, similarity_boost: 0.48, style: 0.45, use_speaker_boost: true },
  emphasis:      { stability: 0.22, similarity_boost: 0.45, style: 0.50, use_speaker_boost: true },
  thinking:      { stability: 0.30, similarity_boost: 0.55, style: 0.30, use_speaker_boost: true },
  statement:     { stability: 0.28, similarity_boost: 0.48, style: 0.40, use_speaker_boost: true },
  instruction:   { stability: 0.26, similarity_boost: 0.48, style: 0.40, use_speaker_boost: true },
};

// ── Segment helpers ──────────────────────────────────────────────────────────
export const say       = (text) => ({ text, style: 'statement' });
export const ask       = (text) => ({ text, style: 'question' });
export const cheer     = (text) => ({ text, style: 'encouragement' });
export const emphasize = (text) => ({ text, style: 'emphasis' });
export const think     = (text) => ({ text, style: 'thinking' });
export const celebrate = (text) => ({ text, style: 'celebration' });
export const instruct  = (text) => ({ text, style: 'instruction' });

// ── Internal queue state ─────────────────────────────────────────────────────
let currentAudio        = null;
let currentQueueSymbol  = null;
let userHasInteracted   = false;

if (typeof window !== 'undefined') {
  const mark = () => { userHasInteracted = true; };
  window.addEventListener('click',      mark, { once: true });
  window.addEventListener('keydown',    mark, { once: true });
  window.addEventListener('touchstart', mark, { once: true });
}

/**
 * Resolve audio URL for a text+style pair.
 * 1. Check pre-generated audioMap (zero latency).
 * 2. Fall back to ElevenLabs API (dynamic).
 */
export async function getAudioUrl(text, style) {
  // 1 — static asset cache
  if (audioMap[text]) {
    return audioMap[text];
  }

  // 2 — dynamic ElevenLabs request
  if (!API_KEY) {
    console.warn('ElevenLabs API key not found; using browser speech fallback.');
    return null;
  }

  try {
    const vs  = VOICE_SETTINGS[style] || VOICE_SETTINGS.statement;
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key':   API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id:       MODEL_ID,
          voice_settings: vs,
        }),
      }
    );

    if (!res.ok) {
      console.warn('ElevenLabs request failed:', res.status, await res.text());
      return null;
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('ElevenLabs fetch error:', error);
    return null;
  }
}

/**
 * Speak text through the browser if ElevenLabs audio is unavailable.
 */
function speakText(text, style = 'statement') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();

  // Map pipeline styles to Web Speech parameters to approximate the ElevenLabs voice
  const SPEECH_PARAMS = {
    // Polite defaults: slower, softer, slightly warmer pitch where appropriate
    celebration:   { rate: 0.98, pitch: 1.06, volume: 0.96 },
    encouragement: { rate: 0.95, pitch: 1.06, volume: 0.96 },
    question:      { rate: 0.92, pitch: 1.04, volume: 0.95 },
    emphasis:      { rate: 0.94, pitch: 1.08, volume: 0.96 },
    thinking:      { rate: 0.88, pitch: 0.98, volume: 0.92 },
    statement:     { rate: 0.92, pitch: 1.02, volume: 0.95 },
    instruction:   { rate: 0.90, pitch: 1.00, volume: 0.95 },
  };

  const params = SPEECH_PARAMS[style] || SPEECH_PARAMS.statement;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = params.rate;
    utterance.pitch = params.pitch;
    utterance.volume = params.volume;

    // Prefer an English female-sounding voice if available to approximate 'Alice'
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      let pick = voices.find(v => /female|alice|samantha|victoria|google uk english female/i.test(v.name));
      if (!pick) pick = voices.find(v => /^en(-|$)/i.test(v.lang) && /female/i.test(v.name));
      if (!pick) pick = voices.find(v => /^en(-|$)/i.test(v.lang));
      if (pick) utterance.voice = pick;
    } catch (e) {
      // ignore voice selection errors
    }

    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play an array of narration segments sequentially.
 * Eager-preloads the next segment while the current one plays.
 * A new call to narrate() immediately cancels any in-progress queue.
 *
 * @param {Array<{text: string, style: string}>} segments
 * @param {boolean} audioEnabled
 */
export async function narrate(segments, audioEnabled = true) {
  if (!audioEnabled || !segments?.length || !userHasInteracted) return;

  const sym       = Symbol();
  currentQueueSymbol = sym;

  // Stop whatever is currently playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  for (let i = 0; i < segments.length; i++) {
    if (currentQueueSymbol !== sym) break; // preempted

    const seg = segments[i];
    const url = await getAudioUrl(seg.text, seg.style);
    if (currentQueueSymbol !== sym) break;

    if (url) {
      // Preload the next segment while this one plays
      if (i + 1 < segments.length) {
        getAudioUrl(segments[i + 1].text, segments[i + 1].style);
      }

      await new Promise((resolve) => {
        const audio   = new Audio(url);
        currentAudio  = audio;
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    } else {
      await speakText(seg.text, seg.style);
    }
  }
}

/**
 * Immediately halt all narration.
 */
export function stopNarration() {
  currentQueueSymbol = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}