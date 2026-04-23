import { useState, useEffect } from 'react';
import { Letter } from '../types';

export function useLetters() {
  const [letters, setLetters] = useState<Letter[]>(() => {
    try {
      const stored = localStorage.getItem('dear_s_letters');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading letters', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dear_s_letters', JSON.stringify(letters));
  }, [letters]);

  const addLetter = (text: string, type: Letter['type']) => {
    const newLetter: Letter = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text,
      type,
      createdAt: Date.now(),
    };
    setLetters((prev) => [newLetter, ...prev]);
  };

  const deleteLetter = (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLetter = (id: string, text: string, type: Letter['type']) => {
    setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, text, type } : l)));
  };

  return {
    letters,
    addLetter,
    deleteLetter,
    updateLetter,
  };
}
