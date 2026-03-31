/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Download, 
  RotateCcw, 
  X,
  ChevronRight,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { domToPng } from 'modern-screenshot';
import { QRCodeCanvas } from 'qrcode.react';

// --- Constants ---
const BTS_COLORS = {
  purple: '#6D319A', // Official BTS Purple
  lightPurple: '#BB86FC',
  deepPurple: '#3700B3',
  gold: '#D4AF37',
  black: '#121212',
  white: '#FFFFFF',
  pink: '#FF80AB',
  blue: '#82B1FF',
};

const FILTERS = [
  { 
    name: 'Normal', 
    filter: 'brightness(1.05) contrast(1.05) saturate(1.1)',
    atmosphere: 'none'
  },
  { 
    name: 'Dynamite 🪩', 
    filter: 'brightness(1.05) contrast(1.05)',
    atmosphere: 'radial-gradient(circle, transparent 35%, rgba(255, 128, 171, 0.25) 90%)',
    backdropFilter: 'sepia(35%) saturate(220%) brightness(1.1)'
  },
  { 
    name: 'Butter 🧈', 
    filter: 'brightness(1.05) contrast(1.05)',
    atmosphere: 'radial-gradient(circle, transparent 30%, rgba(212, 175, 55, 0.25) 85%)',
    backdropFilter: 'sepia(45%) saturate(180%) brightness(1.1)'
  },
  { 
    name: 'Spring Day 🌸', 
    filter: 'brightness(1.08) contrast(0.95)',
    atmosphere: 'radial-gradient(circle, transparent 40%, rgba(130, 177, 255, 0.2) 95%)',
    backdropFilter: 'brightness(1.25) saturate(0.6) blur(0.8px)'
  },
  { 
    name: 'Black Swan 🖤', 
    filter: 'brightness(1.0) contrast(1.1)',
    atmosphere: 'radial-gradient(circle, transparent 25%, rgba(0, 0, 0, 0.7) 95%)',
    backdropFilter: 'grayscale(100%) contrast(160%) brightness(0.8)'
  },
  {
    name: 'DNA 🧬',
    filter: 'brightness(1.08) contrast(1.1) saturate(1.2)',
    atmosphere: `
      radial-gradient(circle at center, transparent 40%, rgba(0,255,255,0.12) 100%)
    `,
    glitch: true
  },
  { 
    name: 'Love Yourself 💕', 
    filter: 'brightness(1.1) contrast(0.98)',
    atmosphere: 'radial-gradient(circle, transparent 25%, rgba(255, 182, 193, 0.3) 80%)',
    backdropFilter: 'saturate(0.9) sepia(0.1) brightness(1.1)'
  },
  { 
    name: 'Stage Light 🎤', 
    filter: 'brightness(1.05) contrast(1.1)',
    atmosphere: 'radial-gradient(circle, transparent 20%, rgba(255, 255, 255, 0.2) 70%, rgba(109, 49, 154, 0.3) 100%)',
    backdropFilter: 'contrast(1.2) saturate(1.3)'
  },
];

interface BTSQuote {
  text: string;
  url?: string;
}

const BTS_QUOTES: BTSQuote[] = [

  // ===== SPEECH / NON-SONG =====
  { text: "No matter who you are, where you're from, your skin color, your gender identity: speak yourself." },
  { text: "I have come to love myself for who I am, for who I was, and for who I hope to become."},
  { text: "You're too young to let the world break you." },
  { text: "Even if you're not perfect, you're a limited edition." },
  { text: "I purple you. 💜" },

  // ===== GLOBAL HITS =====
  { text: "Cause I, I, I'm in the stars tonight. ✨", url: "https://www.youtube.com/watch?v=gdZLi9oWNZg" }, // Dynamite
  { text: "I'm diamond, you know I glow up.", url: "https://www.youtube.com/watch?v=gdZLi9oWNZg" },

  { text: "Smooth like butter, like a criminal undercover.", url: "https://www.youtube.com/watch?v=WMweEpGlu_U" }, // Butter
  { text: "We gon' make it rock and you say yeah.", url: "https://www.youtube.com/watch?v=WMweEpGlu_U" },

  { text: "We don't need permission to dance.", url: "https://www.youtube.com/watch?v=CuklIb9d3fI" }, // PTD

  { text: "You can't stop me lovin' myself.", url: "https://www.youtube.com/watch?v=pBuZEGYXA6E" }, // IDOL

  { text: "Bring the pain, oh yeah.", url: "https://www.youtube.com/watch?v=gwMa6gpoE9I" }, // ON

  { text: "Life goes on like this again.", url: "https://www.youtube.com/watch?v=-5q5mZbe3V8" }, // Life Goes On

  { text: "Yet to come, the best moment is yet to come.", url: "https://www.youtube.com/watch?v=zFT3f9biz68" },

  // ===== LOVE YOURSELF =====
  { text: "You're the cause of my euphoria.", url: "https://www.youtube.com/watch?v=kX0vO4vlJuM" }, // Euphoria
  { text: "I’m so sick of this fake love.", url: "https://www.youtube.com/watch?v=7C2z4GmrS9E" },

  { text: "I'm the one I should love in this world.", url: "https://www.youtube.com/watch?v=fIkZOLdqnoA" }, // Epiphany
  { text: "You showed me I have reasons I should love myself.", url: "https://www.youtube.com/watch?v=fIkZOLdqnoA" },

  // ===== WINGS / YNWA =====
  { text: "You never walk alone.", url: "https://www.youtube.com/watch?v=xEeFrLSkMm8" },

  // ===== MAP OF THE SOUL =====
  { text: "Who the hell am I?", url: "https://www.youtube.com/watch?v=M9Uy0opVF3k" }, // Persona
  { text: "My ego is my own compass.", url: "https://www.youtube.com/watch?v=LmApDbvNCXg" }, // Ego

  // ===== BE / PROOF =====
  { text: "Like an echo in the forest, 하루가 돌아오겠지.", url: "https://www.youtube.com/watch?v=-5q5mZbe3V8" },
  { text: "Yeah, the past was honestly the best.", url: "https://www.youtube.com/watch?v=zFT3f9biz68" },

// ===== PERMISSION TO DANCE =====
{ text: "We don't need to worry", url: "https://www.youtube.com/watch?v=CuklIb9d3fI" },
{ text: "'Cause when we fall, we know how to land", url: "https://www.youtube.com/watch?v=CuklIb9d3fI" },

// ===== LIFE GOES ON =====
{ text: "Yeah, life goes on", url: "https://www.youtube.com/watch?v=-5q5mZbe3V8" },

// ===== ON =====
{ text: "Can't hold me down 'cuz you know I'm a fighter", url: "https://www.youtube.com/watch?v=gwMa6gpoE9I" },

// ===== NO =====
{ text: "Don’t be trapped in someone else’s dream", url: "https://www.youtube.com/watch?v=mmgxPLLLyVo" },

// ===== NO MORE DREAM =====
{ text: "Go your own way", url: "https://www.youtube.com/watch?v=rBG5L7UsUxA" },
{ text: "Put weakness away", url: "https://www.youtube.com/watch?v=rBG5L7UsUxA" },

// ===== DREAM GLOW =====
{ text: "Keep on shining, make it brighter than a spotlight", url: "https://www.youtube.com/watch?v=HWm1I3ha4qU" },

// ===== NOT TODAY =====
{ text: "If you can’t fly, then run", url: "https://www.youtube.com/watch?v=9DwzBICPhdM" },
{ text: "If you can’t run, then walk", url: "https://www.youtube.com/watch?v=9DwzBICPhdM" },

// ===== ANSWER: LOVE MYSELF =====
{ text: "Even all the scars from your mistakes make up your constellation", url: "https://www.youtube.com/watch?v=fIkZOLdqnoA" },
{ text: "It's just that loving myself doesn't require anyone else's permission", url: "https://www.youtube.com/watch?v=fIkZOLdqnoA" },

// ===== SO WHAT =====
{ text: "So what, don’t stop and worry yourself", url: "https://www.youtube.com/watch?v=zdLvqiOmWq4" },

// ===== LOVE MAZE =====
{ text: "We must believe only in ourselves", url: "https://www.youtube.com/watch?v=n_R0-YosZ3g" },

// ===== LOST =====
{ text: "To lose your path is the way to find that path", url: "https://www.youtube.com/watch?v=2cTZTqBU1Rc" },

// ===== CYPHER PT 3 =====
{ text: "If you try to damage me with simple words like that, I only become stronger", url: "https://www.youtube.com/watch?v=I47TUcJj9po" },

// ===== LIGHTS =====
{ text: "Decide for yourself what it means to be happy", url: "https://www.youtube.com/watch?v=eaUpme4jalE" },

// ===== BULLETPROOF: THE ETERNAL =====
{ text: "We are we are forever bulletproof", url: "https://www.youtube.com/watch?v=7UWBYJjuIL0" },

// ===== DIS-EASE =====
{ text: "Throw away the fear", url: "https://www.youtube.com/watch?v=rSi4UIWbtM0" },

// ===== MIKROKOSMOS =====
{ text: "In the dark night, don't be lonely", url: "https://www.youtube.com/watch?v=Fw7C6IsDYgI" },

// ===== 21ST CENTURY GIRL =====
{ text: "Don’t ever be scared, whatever people say you’re okay", url: "https://www.youtube.com/watch?v=YYoJp4wFJDs" },

// ===== BUTTERFLY =====
{ text: "You shine in this pitch darkness", url: "https://www.youtube.com/watch?v=Z4o7-6cFUF8" },

// ===== ANPANMAN =====
{ text: "I believe in myself because I’m a hero", url: "https://www.youtube.com/watch?v=EBf6lwkChnQ" },

// ===== YOUR EYES TELL =====
{ text: "Even the darkness we see is so beautiful", url: "https://www.youtube.com/watch?v=KVAt8jwUobI" },

// ===== MAGIC SHOP =====
{ text: "So show me, I'll show you", url: "https://www.youtube.com/watch?v=38k5zr1e0HI" },

// ===== BLUE & GREY =====
{ text: "I just wanna be happier", url: "https://www.youtube.com/watch?v=amnspvOH-EE" },

// ===== 2! 3! =====
{ text: "Erase all sad memories", url: "https://www.youtube.com/watch?v=E30APZxHh4c" },

// ===== RUN =====
{ text: "Run, run, run again", url: "https://www.youtube.com/watch?v=5Wn85Ge22FQ" },

// ===== YOUNG FOREVER =====
{ text: "Forever we are young", url: "https://www.youtube.com/watch?v=LbvE0FV_70U" },

// ===== EPIPHANY =====
{ text: "I finally realised so I love me", url: "https://www.youtube.com/watch?v=fIkZOLdqnoA" },

// ===== TOMORROW =====
{ text: "Follow your dream like breaker", url: "https://www.youtube.com/watch?v=k-J_LxWLXeo" },

// ===== ZERO O'CLOCK =====
{ text: "And you're gonna be happy", url: "https://www.youtube.com/watch?v=Nr3ot5gSvkM" },

// ===== FIRE =====
{ text: "Live however you want, it’s your life anyway", url: "https://www.youtube.com/watch?v=4ujQOR2DMFM" },

// ===== MIC DROP =====
{ text: "You thought I was gonna fail but I’m fine, sorry", url: "https://www.youtube.com/watch?v=kTlv5_Bs8aw" },

// ===== NEVERMIND =====
{ text: "Moss surely grows on a stone that doesn’t roll", url: "https://www.youtube.com/watch?v=8XszuvnvzyU" },

// ===== PARADISE =====
{ text: "It’s alright to not have a dream", url: "https://www.youtube.com/watch?v=obH7iPDAn2Q" },

// ===== BLACK SWAN =====
{ text: "Nothing can devour me", url: "https://www.youtube.com/watch?v=0lapF4DQPKQ" },

// ===== CYPHER PT 4 =====
{ text: "I love I love I love myself", url: "https://www.youtube.com/watch?v=OjD2tCAjB6o" },

  // ===== SOLO =====

  // SUGA / Agust D
  { text: "Born genius, I'm a born genius.", url: "https://www.youtube.com/watch?v=3Y_Eiyg4bfk" },

  // J-Hope
  { text: "Arson, I’ll burn it all", url: "https://www.youtube.com/watch?v=QmpESV66_T4" },

  // Jimin
  { text: "Like crazy, lost in the lights", url: "https://youtu.be/nOI67IDlNMQ?si=5RRomjMCoTHbVnik" },

  // V
  { text: "Love me again", url: "https://youtu.be/HYzyRHAHJl8?si=ofkC1Yig17oFn-to" },

  // Jungkook
  { text: "Standing next to you", url: "https://youtu.be/UNo0TG9LwwI?si=kwfnKZzEYln2AxGi" },

  // ===== TEXT ONLY =====
  { text: "We are together, bulletproof." },
  { text: "Shine, dream, smile." },
  { text: "The morning will come again." },
  { text: "Don't be trapped in someone else's dream." },
  { text: "Army forever 💜" },
  
{ text: "If you want to love others, I think you should love yourself first." },
{ text: "Only you can decide what breaks you." },
{ text: "When something is delicious, it’s zero calories." },
{ text: "Those who keep trying without giving up are the ones who succeed." },
{ text: "Life is tough, and things don’t always work out well, but we should be brave and go on." },
{ text: "Go on your path, even if you live for a day." },
{ text: "Let your smile change the world." },
{ text: "Living without passion is like being dead." },
{ text: "There is no knowing what will come, but hard work will get us somewhere." },
{ text: "Effort makes you. You will regret someday if you don’t do your best now." },
{ text: "I’d rather die than live without passion." },
{ text: "Purple is the last colour of the rainbow colours. So means I will trust and love you for a long time." },
{ text: "I live so I love." }

];

const STICKER_PACKS = {
  MEMBERS: 'Member Emojis',
  SYMBOLS: 'BTS Symbols',
  CULTURE: 'Korean Culture',
  ARMY: 'ARMY Pack',
  ALBUMS: 'Album Art'
};

const STICKER_OPTIONS = [

  // ===== MEMBERS (ANIMAL REPRESENTATIONS) =====
  { type: 'emoji', content: '🐨', label: 'RM', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐹', label: 'Jin', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐱', label: 'Suga', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐿️', label: 'J-Hope', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐥', label: 'Jimin', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐻', label: 'V', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🐰', label: 'Jungkook', pack: STICKER_PACKS.MEMBERS },

  // ===== MEMBER-RELATED ICONS =====
  { type: 'emoji', content: '🎤', label: 'Mic (RM/Suga)', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🎹', label: 'Piano (Suga)', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '☀️', label: 'Sunshine (J-Hope)', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🌙', label: 'Moon (Jin)', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🎨', label: 'Art (V)', pack: STICKER_PACKS.MEMBERS },
  { type: 'emoji', content: '🥊', label: 'Boxing (Jungkook)', pack: STICKER_PACKS.MEMBERS },

  // ===== BTS / ARMY SYMBOLS =====
  { type: 'emoji', content: '💜', label: 'Borahae', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '🫰', label: 'Finger Heart', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '💣', label: 'ARMY Bomb', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '🐋', label: 'Whale (Whalien 52)', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '✨', label: 'Sparkle', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '🌟', label: 'Star', pack: STICKER_PACKS.SYMBOLS },
  { type: 'emoji', content: '♾️', label: 'Forever', pack: STICKER_PACKS.SYMBOLS },

  // ===== SONG / ERA SYMBOLS =====
  { type: 'emoji', content: '🧨', label: 'Dynamite', pack: STICKER_PACKS.ALBUMS },
  { type: 'emoji', content: '🧈', label: 'Butter', pack: STICKER_PACKS.ALBUMS },
  { type: 'emoji', content: '🎈', label: 'Permission to Dance', pack: STICKER_PACKS.ALBUMS },
  { type: 'emoji', content: '🦋', label: 'HYYH', pack: STICKER_PACKS.ALBUMS },
  { type: 'emoji', content: '🍎', label: 'Wings', pack: STICKER_PACKS.ALBUMS },
  { type: 'emoji', content: '🌊', label: 'Sea (Hidden Track)', pack: STICKER_PACKS.ALBUMS },

  // ===== KOREAN CULTURE (RELEVANT ONLY) =====
  { type: 'emoji', content: '🇰🇷', label: 'Korea', pack: STICKER_PACKS.CULTURE },
  { type: 'emoji', content: '🥢', label: 'Chopsticks', pack: STICKER_PACKS.CULTURE },
  { type: 'emoji', content: '🍜', label: 'Ramen', pack: STICKER_PACKS.CULTURE },
  { type: 'emoji', content: '🍱', label: 'Kimbap', pack: STICKER_PACKS.CULTURE },
  { type: 'emoji', content: '🌸', label: 'Cherry Blossom', pack: STICKER_PACKS.CULTURE },
  { type: 'emoji', content: '🏮', label: 'Lantern', pack: STICKER_PACKS.CULTURE }

];

const SOUNDS = {
  TICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SHUTTER: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  POP: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
};

// --- Graphic Stickers ---
const GraphicSticker = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'BTS_LOGO':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="currentColor">
          <path d="M20 10 L45 15 L45 85 L20 90 Z" />
          <path d="M55 15 L80 10 L80 90 L55 85 Z" />
        </svg>
      );
    case 'LY_HEART':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 80 C20 60 10 40 10 25 A15 15 0 0 1 40 25 C40 25 45 30 50 35 C55 30 60 25 60 25 A15 15 0 0 1 90 25 C90 40 80 60 50 80 Z" />
        </svg>
      );
    case 'MOTS_7':
      return (
        <div className={`${className} flex items-center justify-center font-black text-6xl italic text-purple-600`}>7</div>
      );
    case 'BE_FLOWER':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="currentColor">
          <circle cx="50" cy="50" r="15" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <ellipse key={angle} cx="50" cy="25" rx="10" ry="20" transform={`rotate(${angle} 50 50)`} />
          ))}
        </svg>
      );
    case 'PROOF_LOGO':
      return (
        <div className={`${className} border-4 border-black flex items-center justify-center font-bold text-xl p-1 bg-white`}>PROOF</div>
      );
    case 'ARMY_BOMB':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="40" r="30" fill="white" stroke="black" strokeWidth="2" />
          <rect x="45" y="70" width="10" height="25" fill="black" rx="2" />
          <circle cx="50" cy="40" r="2" fill="red" />
          <path d="M50 10 L50 15" stroke="black" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};

// --- Types ---
type Step = 'landing' | 'capture' | 'edit' | 'final';
type Layout = 'strip' | 'grid';

interface StickerInstance {
  id: string;
  type: string;
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState(FILTERS[0]);
  const [numPhotos, setNumPhotos] = useState(4);
  const [layout, setLayout] = useState<Layout>('strip');
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stickers, setStickers] = useState<StickerInstance[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string>(STICKER_PACKS.MEMBERS);
  
  const [showFlash, setShowFlash] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSongTitle, setShowSongTitle] = useState(false);
  const [randomQuote, setRandomQuote] = useState<BTSQuote>({ text: "" });

  useEffect(() => {
    setRandomQuote(BTS_QUOTES[Math.floor(Math.random() * BTS_QUOTES.length)]);
  }, [step]);

  const playSound = useCallback((soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);
  
  const webcamRef = useRef<Webcam>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const capturingRef = useRef(false);

  // --- Handlers ---

  const startBooth = () => {
    playSound(SOUNDS.CLICK);
    setPhotos([]);
    setStickers([]);
    setHasStarted(false);
    capturingRef.current = false;
    setStep('capture');
  };

  const addSticker = (option: typeof STICKER_OPTIONS[0]) => {
    playSound(SOUNDS.POP);
    const newSticker: StickerInstance = {
      id: Math.random().toString(36).substr(2, 9),
      type: option.type,
      content: option.content,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSticker = (id: string, updates: Partial<StickerInstance>) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const startCaptureSequence = () => {
    playSound(SOUNDS.CLICK);
    setHasStarted(true);
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) return false;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPhotos((prev) => [...prev, imageSrc]);
      return true;
    }
    return false;
  }, [webcamRef]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 'capture' && hasStarted && photos.length < numPhotos && !capturingRef.current) {
      capturingRef.current = true;
      setIsCapturing(true);
      let count = 3;
      setCountdown(count);
      
      timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          playSound(SOUNDS.TICK);
        } else {
          clearInterval(timer);
          setCountdown(null);
          playSound(SOUNDS.SHUTTER);
          
          const success = capture();
          
          if (success) {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
          }
          
          capturingRef.current = false;
          setIsCapturing(false);
          
          if (!success) {
            console.error("Capture failed, will retry on next effect run");
          }
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    } else if (photos.length === numPhotos && step === 'capture') {
      setStep('edit');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length, step, hasStarted, capture]);

  const downloadStrip = async () => {
    if (!stripRef.current || photos.length === 0) return;

    setIsDownloading(true);
    // Give time for state to update and UI to hide handles
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      // modern-screenshot handles oklch and modern CSS much better than html2canvas
      const dataUrl = await domToPng(stripRef.current, {
        scale: 3, // High resolution
        backgroundColor: '#FFFFFF',
      });

      const link = document.createElement('a');
      link.download = `bts-booth-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [BTS_COLORS.purple, BTS_COLORS.lightPurple, BTS_COLORS.gold]
      });
      playSound(SOUNDS.SUCCESS);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setPhotos([]);
    setStep('landing');
  };

  // --- Components ---

  const Landing = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
    >
      <div className="relative mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-dashed border-purple-400 rounded-full opacity-50"
        />
        <div className="bg-white p-8 rounded-full shadow-xl relative z-10">
          <Camera size={64} className="text-purple-600" />
        </div>
        <motion.div 
          className="absolute -top-4 -right-4 text-4xl animate-float"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          💜
        </motion.div>
      </div>
      
      <h1 className="text-6xl font-black mb-4 text-purple-900 font-serif tracking-tighter">
        BORAHAE <span className="text-purple-500">BOOTH</span>
      </h1>
      <p className="text-xl text-purple-700 mb-8 max-w-md font-medium">
        I Purple You! Capture your ARMY moments with exclusive BTS stickers.
      </p>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-purple-100 mb-12 w-full max-w-md">
        <div className="mb-6">
          <label className="block text-purple-900 font-bold mb-3 text-sm uppercase tracking-widest">Photo Count</label>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setNumPhotos(num)}
                className={`w-12 h-12 rounded-xl font-bold transition-all ${
                  numPhotos === num 
                    ? 'bg-purple-500 text-white shadow-lg scale-110' 
                    : 'bg-purple-50 text-purple-400 hover:bg-purple-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-purple-900 font-bold mb-3 text-sm uppercase tracking-wider">Layout Style</label>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setLayout('strip')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                layout === 'strip' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-purple-50 text-purple-400 hover:bg-purple-100'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-3 h-1 bg-current opacity-40 rounded-sm" />
                <div className="w-3 h-1 bg-current opacity-40 rounded-sm" />
                <div className="w-3 h-1 bg-current opacity-40 rounded-sm" />
              </div>
              Strip
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                layout === 'grid' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-purple-50 text-purple-400 hover:bg-purple-100'
              }`}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-sm" />
                <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-sm" />
                <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-sm" />
                <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-sm" />
              </div>
              Grid
            </button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={startBooth}
        className="bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
      >
        Start Photo Booth <ChevronRight size={24} />
      </button>
    </motion.div>
  );

  const CaptureView = () => {
    useEffect(() => {
      return () => {
        // Explicitly stop webcam tracks on unmount
        if (webcamRef.current && webcamRef.current.video) {
          const stream = webcamRef.current.video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      };
    }, []);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, rotate: -5 }}
        transition={{ duration: 0.4, ease: "backIn" }}
        className="flex flex-col items-center justify-center min-h-[80vh] px-4"
      >
      <motion.div 
        key={countdown}
        animate={countdown !== null ? { scale: [1, 0.94, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-auto block"
          mirrored={true}
          videoConstraints={{
            facingMode: "user"
          }}
          disablePictureInPicture={true}
          forceScreenshotSourceSize={true}
          imageSmoothing={true}
          onUserMedia={() => setIsWebcamReady(true)}
          onUserMediaError={(err) => {
            console.error("Webcam Error:", err);
            setIsWebcamReady(false);
          }}
          screenshotQuality={1}
        />

        {currentFilter.atmosphere !== 'none' && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: currentFilter.atmosphere,
              backdropFilter: currentFilter.backdropFilter,
              pointerEvents: 'none',
              zIndex: 5
            }}
          />
        )}

        <AnimatePresence>
          {showFlash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50"
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <span className="text-9xl font-bold text-white drop-shadow-2xl">
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasStarted && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <button 
              onClick={startCaptureSequence}
              disabled={!isWebcamReady}
              className={`bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-bold shadow-2xl transition-all flex items-center gap-3 ${
                !isWebcamReady ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isWebcamReady ? (
                <><Camera size={28} /> Start Sequence</>
              ) : (
                <><RotateCcw size={28} className="animate-spin" /> Loading Camera...</>
              )}
            </button>
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-purple-600/60 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold z-10 flex items-center gap-2">
          <span className="animate-pulse">💜</span> Photo {photos.length + 1} of {numPhotos}
        </div>
      </motion.div>

      <div className="mt-8 flex gap-4">
        {Array.from({ length: numPhotos }).map((_, i) => (
          <motion.div 
            key={i}
            initial={photos[i] ? { scale: 0.8, opacity: 0 } : {}}
            animate={photos[i] ? { scale: 1, opacity: 1 } : {}}
            className={`w-16 rounded-lg border-2 ${photos[i] ? 'border-purple-500' : 'border-dashed border-gray-300'} overflow-hidden bg-gray-100 flex items-center justify-center`}
            style={{ height: 'auto', minHeight: '4rem' }}
          >
            {photos[i] ? (
              <img src={photos[i]} alt={`Captured ${i}`} className="w-full h-auto block" />
            ) : (
              <Camera size={20} className="text-gray-300" />
            )}
          </motion.div>
        ))}
      </div>
      
      <p className="mt-6 text-purple-700 font-medium">
        {hasStarted ? "Capturing sequence..." : "Click the button to start taking photos"}
      </p>
    </motion.div>
    );
  };

  const EditView = () => {
    return (
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 min-h-[80vh] py-8 px-4">
        {/* Photo Strip Preview */}
        <div className="w-full lg:w-auto flex flex-col items-center">
          <div 
            ref={stripRef}
            className="relative"
            style={{ 
              fontFamily: 'serif',
              backgroundColor: '#FFFFFF',
              borderColor: '#FFFFFF',
              borderWidth: '12px',
              borderStyle: 'solid',
              padding: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: layout === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: layout === 'grid' ? 'repeat(2, 1fr)' : 'none',
              flexDirection: layout === 'grid' ? 'initial' : 'column',
              gap: '0.75rem',
              width: layout === 'grid' ? 'fit-content' : '300px',
              maxWidth: layout === 'grid' ? '450px' : 'none',
              borderRadius: '0.125rem',
              overflow: 'hidden'
            }}
            onClick={() => setSelectedStickerId(null)}
          >
            {photos.map((photo, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: '#F3F4F6',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={photo} 
                  alt={`Strip ${i}`} 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    filter: currentFilter.filter
                  }} 
                />
                {currentFilter.atmosphere !== 'none' && (
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: currentFilter.atmosphere,
                      backdropFilter: currentFilter.backdropFilter,
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                )}
              </div>
            ))}

            {/* Stickers Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {stickers.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0.3}
                  dragTransition={{ power: 0.1, timeConstant: 200 }}
                  whileHover={{ 
                    scale: sticker.scale * 1.02,
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
                  }}
                  whileDrag={{ 
                    scale: sticker.scale * 1.05,
                    boxShadow: "0 25px 30px -5px rgb(0 0 0 / 0.2), 0 12px 15px -6px rgb(0 0 0 / 0.2)",
                    outline: "2px solid rgba(139, 92, 246, 0.8)",
                    outlineOffset: "4px",
                    cursor: 'grabbing'
                  }}
                  onDragEnd={(e, info) => {
                    const rect = stripRef.current?.getBoundingClientRect();
                    if (rect) {
                      // Calculate new position based on offset from original position
                      let newX = sticker.x + (info.offset.x / rect.width) * 100;
                      let newY = sticker.y + (info.offset.y / rect.height) * 100;
                      
                      // Snapping logic (1% threshold for center only)
                      const threshold = 1;
                      
                      // Snap to center
                      if (Math.abs(newX - 50) < threshold) newX = 50;
                      if (Math.abs(newY - 50) < threshold) newY = 50;
                      
                      // Clamp to absolute edges (0-100)
                      newX = Math.max(0, Math.min(100, newX));
                      newY = Math.max(0, Math.min(100, newY));

                      updateSticker(sticker.id, { x: newX, y: newY });
                    }
                  }}
                  onTapStart={(e) => {
                    e.stopPropagation();
                    setSelectedStickerId(sticker.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    x: '-50%',
                    y: '-50%',
                    scale: sticker.scale,
                    rotate: sticker.rotation,
                    pointerEvents: 'auto',
                    cursor: 'grab',
                    zIndex: selectedStickerId === sticker.id ? 50 : 10,
                    userSelect: 'none',
                  }}
                  className={`flex items-center justify-center p-2 group ${(selectedStickerId === sticker.id && !isDownloading) ? 'ring-2 ring-purple-500 ring-offset-4 rounded-lg bg-white/10' : ''}`}
                >
                  {/* Sticker Content */}
                  {sticker.type === 'emoji' ? (
                    <span className="text-5xl drop-shadow-lg select-none">{sticker.content}</span>
                  ) : (
                    <GraphicSticker type={sticker.content} className="w-24 h-24 drop-shadow-lg select-none" />
                  )}
                  
                  {selectedStickerId === sticker.id && !isDownloading && (
                    <>
                      {/* Delete Handle */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(sticker.id);
                        }}
                        className="absolute -top-4 -right-4 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <X size={12} />
                      </button>

                      {/* Resize Handle */}
                      <motion.div
                        drag
                        dragMomentum={false}
                        whileHover={{ scale: 1.1 }}
                        whileDrag={{ scale: 1.2, backgroundColor: '#8B5CF6' }}
                        onDrag={(e, info) => {
                          const rect = stripRef.current?.getBoundingClientRect();
                          if (rect) {
                            const stickerCenterX = (sticker.x / 100) * rect.width + rect.left;
                            const stickerCenterY = (sticker.y / 100) * rect.height + rect.top;
                            const dx = info.point.x - stickerCenterX;
                            const dy = info.point.y - stickerCenterY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            // Base size is roughly 40px (half of sticker size)
                            // We use a much larger divisor to make resizing very slow and precise
                            const newScale = Math.max(0.2, Math.min(5, distance / 250));
                            updateSticker(sticker.id, { scale: newScale });
                          }
                        }}
                        className="absolute -bottom-5 -right-5 w-8 h-8 bg-purple-500 rounded-full border-2 border-white shadow-lg cursor-nwse-resize flex items-center justify-center z-50 pointer-events-auto"
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </motion.div>

                      {/* Rotate Handle */}
                      <motion.div
                        drag
                        dragMomentum={false}
                        whileHover={{ scale: 1.1 }}
                        whileDrag={{ scale: 1.2, backgroundColor: '#3B82F6' }}
                        onDrag={(e, info) => {
                          const rect = stripRef.current?.getBoundingClientRect();
                          if (rect) {
                            const stickerCenterX = (sticker.x / 100) * rect.width + rect.left;
                            const stickerCenterY = (sticker.y / 100) * rect.height + rect.top;
                            const dx = info.point.x - stickerCenterX;
                            const dy = info.point.y - stickerCenterY;
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            updateSticker(sticker.id, { rotation: angle + 90 });
                          }
                        }}
                        className="absolute -top-14 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-alias flex items-center justify-center z-50 pointer-events-auto"
                      >
                        <RotateCcw size={16} className="text-white" />
                      </motion.div>
                      
                      {/* Connector Line for Rotate Handle */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500/50" />
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            <div 
              style={{ 
                color: BTS_COLORS.purple,
                textAlign: 'center',
                paddingTop: '0.8rem',
                paddingBottom: '0.8rem',
                fontWeight: 600,
                fontSize: '0.7rem',
                gridColumn: layout === 'grid' ? 'span 2 / span 2' : 'auto',
                lineHeight: '1.4',
                position: 'relative'
              }}
            >
              <div className="italic mb-1 px-4">"{randomQuote.text}"</div>
              <div className="font-bold opacity-60">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
              
              {/* QR Code removed as per user request */}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-4 w-full">
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => {
                  setShowSongTitle(false);
                  reset();
                }}
                className="p-3 rounded-full bg-white text-gray-500 shadow-md hover:text-red-500 transition-colors shrink-0"
                title="Start Over"
              >
                <RotateCcw size={20} />
              </button>

              {randomQuote.url && (
                <button 
                  onClick={() => {
                    setShowSongTitle(true);
                    window.open(randomQuote.url, '_blank');
                    confetti({
                      particleCount: 40,
                      spread: 60,
                      origin: { y: 0.8 },
                      colors: [BTS_COLORS.purple, BTS_COLORS.pink, BTS_COLORS.gold]
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-xs uppercase tracking-tighter"
                >
                  <Palette size={16} className="animate-pulse" /> Guess? 🎵
                </button>
              )}

              <button 
                onClick={downloadStrip}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 text-xs uppercase tracking-tighter"
              >
                <Download size={16} /> Save 📸
              </button>
            </div>

            <AnimatePresence>
              {showSongTitle && randomQuote.url && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-purple-600 font-bold italic text-[10px] text-center uppercase tracking-widest bg-purple-50 py-1 rounded-full border border-purple-100"
                >
                  Answer: {randomQuote.text.length > 20 ? "BTS Hit!" : randomQuote.text.split('.')[0]} 💜
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full lg:max-w-md flex flex-col gap-6">
          {/* Sticker Section */}
          <div className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Palette size={20} /> BTS Stickers
            </h3>
            
            {/* Pack Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.values(STICKER_PACKS).map((pack) => (
                <button
                  key={pack}
                  onClick={() => setSelectedPack(pack)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    selectedPack === pack 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-purple-50 text-purple-400 hover:bg-purple-100'
                  }`}
                >
                  {pack}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {STICKER_OPTIONS.filter(opt => opt.pack === selectedPack).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => addSticker(option)}
                  className="aspect-square flex flex-col items-center justify-center bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all border border-purple-100 group overflow-hidden"
                >
                  {option.type === 'emoji' ? (
                    <span className="text-2xl group-hover:scale-125 transition-transform">{option.content}</span>
                  ) : (
                    <GraphicSticker type={option.content} className="w-10 h-10 group-hover:scale-125 transition-transform" />
                  )}
                  <span className="text-[10px] mt-1 text-purple-400 font-bold uppercase truncate w-full px-1">{option.label}</span>
                </button>
              ))}
            </div>

            {selectedStickerId && (
              <div className="mt-6 pt-6 border-t border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-purple-900 uppercase tracking-wider">Sticker Controls</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setStickers([])}
                      className="text-xs font-bold text-purple-400 hover:text-purple-600 uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={() => removeSticker(selectedStickerId)}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-purple-400 mb-1 uppercase">
                      <span>Size</span>
                      <span>{Math.round(stickers.find(s => s.id === selectedStickerId)?.scale! * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3" 
                      step="0.1"
                      value={stickers.find(s => s.id === selectedStickerId)?.scale || 1}
                      onChange={(e) => updateSticker(selectedStickerId, { scale: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-purple-400 mb-1 uppercase">
                      <span>Rotation</span>
                      <span>{stickers.find(s => s.id === selectedStickerId)?.rotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      step="5"
                      value={stickers.find(s => s.id === selectedStickerId)?.rotation || 0}
                      onChange={(e) => updateSticker(selectedStickerId, { rotation: parseInt(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Section */}
          <div className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Palette size={20} className="text-purple-500" /> Choose Filter
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                    currentFilter.name === filter.name 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'bg-purple-50 text-purple-400 hover:bg-purple-100'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-gray-900 font-sans selection:bg-purple-200">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] w-[20%] h-[20%] rounded-full bg-pink-100/50 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Camera size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-purple-900">Borahae Booth</span>
        </div>
        
        {step !== 'landing' && (
          <button 
            onClick={reset}
            className="text-purple-400 hover:text-purple-600 font-medium flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={18} /> Start Over
          </button>
        )}
      </header>

      <main className="relative z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'landing' && <Landing key="landing" />}
          {step === 'capture' && <CaptureView key="capture" />}
          {step === 'edit' && <EditView key="edit" />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-purple-300 text-sm">
        <p>© 2026 BTS Borahae Booth • Made for ARMY 💜</p>
      </footer>
    </div>
  );
}
