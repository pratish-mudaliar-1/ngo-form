"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Client-side only language detection after hydration
    const savedLang = localStorage.getItem('i18nextLng');
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    const initialLang = savedLang || browserLang;
    
    const finalLang = ['en', 'hi', 'mr'].includes(initialLang) ? initialLang : 'en';
    
    if (finalLang !== 'en') {
      i18n.changeLanguage(finalLang);
    }
    
    document.documentElement.lang = i18n.language || 'en';
    
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
      localStorage.setItem('i18nextLng', lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
