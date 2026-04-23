import React, { createContext, useContext, useEffect, useState } from 'react';

interface BackgroundContextType {
 desktopBg: string | null;
 mobileBg: string | null;
 setDesktopBg: (bg: string | null) => void;
 setMobileBg: (bg: string | null) => void;
 resetBackgrounds: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
 const [desktopBg, setDesktopBgState] = useState<string | null>(
 localStorage.getItem('dearS_bg_desktop')
 );
 const [mobileBg, setMobileBgState] = useState<string | null>(
 localStorage.getItem('dearS_bg_mobile')
 );

 const setDesktopBg = (bg: string | null) => {
 if (bg) {
 localStorage.setItem('dearS_bg_desktop', bg);
 } else {
 localStorage.removeItem('dearS_bg_desktop');
 }
 setDesktopBgState(bg);
 };

 const setMobileBg = (bg: string | null) => {
 if (bg) {
 localStorage.setItem('dearS_bg_mobile', bg);
 } else {
 localStorage.removeItem('dearS_bg_mobile');
 }
 setMobileBgState(bg);
 };

 const resetBackgrounds = () => {
 setDesktopBg(null);
 setMobileBg(null);
 };

 useEffect(() => {
 const handleResize = () => {
 // Just a trigger for any components relying on window size if necessary.
 // We will handle CSS via a global style injection directly in this provider.
 };
 
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, []);

 return (
 <BackgroundContext.Provider value={{ desktopBg, mobileBg, setDesktopBg, setMobileBg, resetBackgrounds }}>
 {children}
 <style>
 {`
 body {
 ${desktopBg ? `background-image: url('${desktopBg}') !important;` : ''}
 }
 @media (max-width: 768px) {
 body {
 ${mobileBg ? `background-image: url('${mobileBg}') !important;` : desktopBg ? `background-image: url('${desktopBg}') !important;` : ''}
 }
 }
 `}
 </style>
 </BackgroundContext.Provider>
 );
}

export function useBackground() {
 const context = useContext(BackgroundContext);
 if (!context) throw new Error('useBackground must be used within BackgroundProvider');
 return context;
}
