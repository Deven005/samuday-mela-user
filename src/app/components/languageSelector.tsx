'use client';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { auth } from '../config/firebase.config';

const LanguageSelector = () => {
  const [selectedLang, setSelectedLang] = useState('en');

  const languages: { [key: string]: string } = {
    en: 'English',
    hi: 'हिन्दी',
    gu: 'ગુજરાતી',
    mr: 'मराठी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    bn: 'বাংলা',
    pa: 'ਪੰਜਾਬੀ',
    ur: 'اردو',
  };

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') || 'hi';
    setSelectedLang(saved);
    auth.languageCode = saved;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    auth.languageCode = lang;
    localStorage.setItem('preferredLanguage', lang);
    console.log('Language set to:', lang);
  };

  return (
    <select value={selectedLang} onChange={handleChange}>
      {Object.entries(languages).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
