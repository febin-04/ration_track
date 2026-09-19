'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from '@/lib/i18n';

interface AccessibilityContextType {
  lang: Language;
  setLang: (l: Language) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  largeText: boolean;
  setLargeText: (val: boolean | ((prev: boolean) => boolean)) => void;
  t: Translations;
  speakText: (text: string, forceLang?: Language) => void;
  stopTextToSpeech: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

let activeAudio: HTMLAudioElement | null = null;

import Preloader from '@/components/Preloader';

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [largeText, setLargeTextState] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // Load persisted settings
    const savedLang = localStorage.getItem('ration_lang') as Language | null;
    if (savedLang && ['en', 'hi', 'ml'].includes(savedLang)) {
      setLangState(savedLang);
    }

    const savedHC = localStorage.getItem('ration_high_contrast');
    if (savedHC === 'true') {
      setHighContrastState(true);
    }

    const savedLT = localStorage.getItem('ration_large_text');
    if (savedLT === 'true') {
      setLargeTextState(true);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('ration_lang', l);
    stopTextToSpeech();
  };

  const setHighContrast = (val: boolean | ((prev: boolean) => boolean)) => {
    setHighContrastState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('ration_high_contrast', String(next));
      return next;
    });
  };

  const setLargeText = (val: boolean | ((prev: boolean) => boolean)) => {
    setLargeTextState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('ration_large_text', String(next));
      return next;
    });
  };

  const speakText = (text: string, forceLang?: Language) => {
    const targetLang = forceLang || lang;

    // Stop any active speech/audio
    stopTextToSpeech();
    setIsSpeaking(true);

    const cleanText = text.slice(0, 190);
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${targetLang}`;

    const audio = new Audio(audioUrl);
    activeAudio = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      activeAudio = null;
    };

    audio.onerror = () => {
      console.warn('Server TTS stream error, falling back to WebSpeech API...');
      fallbackWebSpeech(text, targetLang);
    };

    audio.play().catch((err) => {
      console.warn('Audio play rejection, falling back to WebSpeech API:', err);
      fallbackWebSpeech(text, targetLang);
    });
  };

  const fallbackWebSpeech = (text: string, targetLang: Language) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => 
        v.lang.toLowerCase().includes(targetLang) || 
        v.name.toLowerCase().includes(targetLang === 'ml' ? 'malayalam' : targetLang === 'hi' ? 'hindi' : 'english')
      );

      if (matchVoice) {
        utterance.voice = matchVoice;
        utterance.lang = matchVoice.lang;
      } else {
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ml' ? 'hi-IN' : 'en-IN';
      }

      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopTextToSpeech = () => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const t = translations[lang] || translations.en;

  return (
    <AccessibilityContext.Provider
      value={{
        lang,
        setLang,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        t,
        speakText,
        stopTextToSpeech,
        isSpeaking,
      }}
    >
      <Preloader />
      <div
        className={`${highContrast ? 'high-contrast-mode' : ''} ${
          largeText ? 'large-text-mode' : ''
        } min-h-screen transition-colors duration-200`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
