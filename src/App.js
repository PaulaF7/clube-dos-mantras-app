import React, { useState, useEffect, useCallback, createContext, useContext, useRef, useMemo, memo } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInAnonymously,
    // ADICIONE ESTAS 3 LINHAS:
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    setDoc,
    getDoc,
    Timestamp,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Home, BookOpen, Star, History, Settings, Sparkles, LogOut, Trash2, Edit3, PlusCircle, CheckCircle, ChevronLeft, Play, Pause, X, BrainCircuit, Heart, GaugeCircle, Clock, MessageSquare, Camera, AlertTriangle, MoreHorizontal, ChevronDown, Repeat, Music, Mic2, Flame, Lock, UploadCloud, Save, Plus, Move, GripVertical, /* Lotus, */ Circle, PlayCircle, MessageCircleQuestion, HandCoins, Leaf, AlignJustify, KeyRound, Wind, TrendingUp } from 'lucide-react';
// import ReactGA from 'react-ga4'; // Removido para compilar no ambiente do editor

// --- SISTEMA SOLAR REACT ---
// Componente separado para o sistema solar
const SolarSystemBackground = memo(() => {
    // Estilos de animação e posicionamento
    const style = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5, // AJUSTE: Opacidade aumentada para maior visibilidade constante
    };
    // Otimização: Adiciona 'will-change' para garantir que a animação execute em sua própria camada de composição na GPU.
    style['willChange'] = 'transform';

    const planetStyles = {
        sun: { width: '80px', height: '80px', backgroundColor: '#ffca28', borderRadius: '50%', boxShadow: '0 0 20px 5px rgba(255, 202, 40, 0.8), 0 0 40px 10px rgba(255, 202, 40, 0.5)' },
        mercury: { width: '6px', height: '6px', backgroundColor: '#b1b1b1', animation: 'orbit-mercury 4s linear infinite' },
        venus: { width: '10px', height: '10px', backgroundColor: '#d1b19a', animation: 'orbit-venus 8s linear infinite' },
        earth: { width: '12px', height: '12px', backgroundColor: '#4c6d86', animation: 'orbit-earth 12s linear infinite' },
        mars: { width: '9px', height: '9px', backgroundColor: '#af4f44', animation: 'orbit-mars 18s linear infinite' },
        jupiter: { width: '20px', height: '20px', backgroundColor: '#c79f72', animation: 'orbit-jupiter 24s linear infinite' },
        saturn: { width: '18px', height: '18px', backgroundColor: '#c7b39a', animation: 'orbit-saturn 30s linear infinite' },
        saturnRing: { width: '36px', height: '36px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotateX(65deg)', borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.35)', pointerEvents: 'none', zIndex: 1 },
        uranus: { width: '15px', height: '15px', backgroundColor: '#a7d0d1', animation: 'orbit-uranus 36s linear infinite' },
        neptune: { width: '15px', height: '15px', backgroundColor: '#55788d', animation: 'orbit-neptune 42s linear infinite' },
        pluto: { width: '5px', height: '5px', backgroundColor: '#9d8d85', animation: 'orbit-pluto 48s linear infinite' }
    };

    return (
        <div style={style}>
            <div className="solar-system-container" style={{ position: 'relative', perspective: '600px', transformStyle: 'preserve-3d' }}>
                <style>
                {`
                @keyframes orbit-mercury { from { transform: rotate(0deg) translateX(50px) rotate(0deg); } to { transform: rotate(360deg) translateX(50px) rotate(-360deg); } }
                @keyframes orbit-venus { from { transform: rotate(0deg) translateX(80px) rotate(0deg); } to { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }
                @keyframes orbit-earth { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
                @keyframes orbit-mars { from { transform: rotate(0deg) translateX(160px) rotate(0deg); } to { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
                @keyframes orbit-jupiter { from { transform: rotate(0deg) translateX(220px) rotate(0deg); } to { transform: rotate(360deg) translateX(220px) rotate(-360deg); } }
                @keyframes orbit-saturn { from { transform: rotate(0deg) translateX(280px) rotate(0deg); } to { transform: rotate(360deg) translateX(280px) rotate(-360deg); } }
                @keyframes orbit-uranus { from { transform: rotate(0deg) translateX(340px) rotate(0deg); } to { transform: rotate(360deg) translateX(340px) rotate(-360deg); } }
                @keyframes orbit-neptune { from { transform: rotate(0deg) translateX(400px) rotate(0deg); } to { transform: rotate(360deg) translateX(400px) rotate(-360deg); } }
                @keyframes orbit-pluto { from { transform: rotate(0deg) translateX(440px) rotate(0deg); } to { transform: rotate(360deg) translateX(440px) rotate(-360deg); } }

                .planet-orbit {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .planet {
                    position: absolute;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                `}
                </style>
                <div style={{ ...planetStyles.sun, position: 'absolute' }}></div>

                <div className="planet-orbit w-[100px] h-[100px]">
                    <div className="planet" style={planetStyles.mercury}></div>
                </div>
                <div className="planet-orbit w-[160px] h-[160px]">
                    <div className="planet" style={planetStyles.venus}></div>
                </div>
                <div className="planet-orbit w-[240px] h-[240px]">
                    <div className="planet" style={planetStyles.earth}></div>
                </div>
                <div className="planet-orbit w-[320px] h-[320px]">
                    <div className="planet" style={planetStyles.mars}></div>
                </div>
                <div className="planet-orbit w-[440px] h-[440px]">
                    <div className="planet" style={planetStyles.jupiter}></div>
                </div>
                <div className="planet-orbit w-[560px] h-[560px]">
                    <div className="planet" style={planetStyles.saturn}>
                        <div
                            className="absolute top-1/2 left-1/2 w-[36px] h-[36px] rounded-full border border-white/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ transform: 'translate(-50%, -50%) rotateX(65deg)' }}
                        />
                    </div>
                </div>

                <div className="planet-orbit w-[680px] h-[680px]">
                    <div className="planet" style={planetStyles.uranus}></div>
                </div>
                <div className="planet-orbit w-[800px] h-[800px]">
                    <div className="planet" style={planetStyles.neptune}></div>
                </div>
                <div className="planet-orbit w-[880px] h-[880px]">
                    <div className="planet" style={planetStyles.pluto}></div>
                </div>
            </div>
        </div>
    );
});

// --- ESTILOS GLOBAIS (COM MELHORIA NO PLAYER E OTIMIZAÇÃO DE PERFORMANCE) ---
// Adicionado `memo` para evitar que o componente seja renderizado desnecessariamente.
const GlobalStyles = memo(() => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600&display=swap');
    :root { --font-body: 'Poppins', sans-serif; --font-display: 'Playfair Display', serif; }
    body { font-family: var(--font-body); transition: background-color 0.5s ease, color 0.5s ease; background-color: #1a0933; }
    .modern-body { background: linear-gradient(220deg, #1a0933, #2c0b4d, #3a1b57); background-size: 200% 200%; animation: gradient-animation 25s ease-in-out infinite; color: #F3E5F5; overflow-x: hidden; }
    .premium-body { background: linear-gradient(220deg, #2c0b4d, #4a148c, #3a1b57); background-size: 200% 200%; animation: gradient-animation 20s ease-in-out infinite; }
    .sparkles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
    .sparkle { position: absolute; width: 2px; height: 2px; background-color: rgba(255, 213, 79, 0.7); border-radius: 50%; box-shadow: 0 0 5px rgba(255, 213, 79, 0.8); animation: sparkle-animation 15s linear infinite; }
    @keyframes sparkle-animation { from { transform: translateY(100vh) scale(1); opacity: 1; } to { transform: translateY(-10vh) scale(0.5); opacity: 0; } }
    @keyframes gradient-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    /* Otimização: Adicionado 'will-change' para promover os cards a sua própria camada de composição durante animações,
       reduzindo o custo de repintura e a interferência com a camada do background. */
    .glass-card, .glass-modal { 
      background: rgba(255, 255, 255, 0.04); 
      backdrop-filter: blur(20px); /* Leve redução no blur para aliviar a GPU */
      -webkit-backdrop-filter: blur(20px); 
      border-radius: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1); padding: 2rem; transition: border-color 0.5s ease, box-shadow 0.5s ease;
      will-change: transform, opacity;
    }
    .premium-card-glow { border-color: rgba(255, 213, 79, 0.3); animation: premium-glow 3s ease-in-out infinite; }
    @keyframes premium-glow { 0% { box-shadow: 0 0 8px rgba(255, 213, 79, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } 50% { box-shadow: 0 0 16px rgba(255, 213, 79, 0.4), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } 100% { box-shadow: 0 0 8px rgba(255, 213, 79, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } }
    .glass-card.clickable:hover { transform: translateY(-5px); box-shadow: 0 12px 35px 0 rgba(0, 0, 0, 0.15); transition: transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out; }
    .glass-nav, .glass-bottom-nav { background: rgba(26, 9, 51, 0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-color: rgba(255, 255, 255, 0.08); }
    .glass-nav { border-bottom-width: 1px; } .glass-bottom-nav { border-top-width: 1px; }
    .page-container { padding: 1.5rem; padding-top: 8rem; padding-bottom: 8rem; max-width: 700px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; gap: 1.5rem; position: relative; z-index: 2; }
    .page-title { font-family: var(--font-display); font-size: 1.8rem; color: #FFFFFF; margin-bottom: 0.25rem; line-height: 1.2; font-weight: 400; text-align: center; }
    .page-subtitle { text-align: center; color: #D1C4E9; opacity: 0.8; margin-top: 0.25rem; margin-bottom: 1rem; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto; }
    .modern-btn-primary { background: #FFD54F; color: #2c0b4d; padding: 1rem 2rem; border-radius: 9999px; font-weight: 600; font-size: 1rem; transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease; box-shadow: 0 4px 15px -5px rgba(255, 213, 79, 0.5); border: none; display: flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; }
    .modern-btn-primary:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 7px 20px -5px rgba(255, 213, 79, 0.6); }
    .modern-btn-primary:disabled { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.4); cursor: not-allowed; transform: none; box-shadow: none; filter: none; }
    .btn-secondary { background-color: rgba(255, 255, 255, 0.08); color: #F3E5F5; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 400; transition: background-color 0.3s ease; cursor: pointer; }
    .btn-secondary:hover { background-color: rgba(255, 255, 255, 0.15); }
    .btn-danger { background-color: #D32F2F; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.3s ease; }
    .btn-danger:hover { background-color: #B71C1C; }
    .btn-danger-outline { background-color: transparent; color: #D32F2F; border: 1px solid #D32F2F; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.3s ease, color 0.3s ease; }
    .btn-danger-outline:hover { background-color: #D32F2F; color: white; }
    .input-field, .textarea-field, .select-field { width: 100%; background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); color: #F3E5F5; padding: 1rem; border-radius: 0.75rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; font-weight: 300; }
    .input-field::placeholder, .textarea-field::placeholder { color: #D1C4E9; opacity: 0.6; }
    .input-field:focus, .textarea-field:focus, .select-field:focus { outline: none; border-color: #FFD54F; box-shadow: 0 0 0 2px rgba(255, 213, 79, 0.15); }
    .select-field option { background-color: #3A1B57; }
    @keyframes screen-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .screen-animation { animation: screen-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes favorite-pop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
    .favorite-animation { animation: favorite-pop 0.3s ease-in-out; }
    .dragging { opacity: 0.5; background: rgba(255, 255, 255, 0.1); }
    .player-background-gradient {
      background: linear-gradient(-45deg, #1a0933, #2c0b4d, #4a148c, #3a1b57);
      background-size: 400% 400%;
      animation: player-gradient-animation 15s ease infinite;
    }
    @keyframes player-gradient-animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes chakra-pulse {
      0% { transform: scale(1.0); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1.0); opacity: 0.5; }
    }
    .chakra-pulse-effect {
      animation: chakra-pulse 2s ease-in-out infinite;
    }

    /* === Padronização de inputs date/time com os de texto === */
    .input-field[type="date"],
    .input-field[type="time"] {
        -webkit-appearance: none;
        appearance: none;
        height: 52px; /* igual aos demais campos */
        padding: 16px; /* igual aos demais */
        line-height: 1.5;
        text-align: left; /* Adicionado para alinhar o texto à esquerda */
    }
    .input-field[type="date"]::-webkit-datetime-edit,
    .input-field[type="time"]::-webkit-datetime-edit {
        padding: 0;
        text-align: left; /* Adicionado para alinhar as partes do texto */
    }
    /* Adicionado para garantir o alinhamento do valor preenchido */
    .input-field[type="date"]::-webkit-date-and-time-value,
    .input-field[type="time"]::-webkit-date-and-time-value {
        text-align: left;
    }
    .input-field[type="date"]::-webkit-calendar-picker-indicator,
    .input-field[type="time"]::-webkit-calendar-picker-indicator {
        opacity: 0.7;
        filter: invert(1);
    }
    @supports (-moz-appearance: none) {
        .input-field[type="date"],
        .input-field[type="time"] {
            -moz-appearance: textfield;
        }
    }
    @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

/* Media query para desativar em telas menores */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background-color: rgba(30, 30, 45, 0.7); /* Cor sólida para garantir legibilidade */
  }
}

  `}</style>
));



// --- DADOS DOS MANTRAS ---
const MANTRAS_DATA = [
    { id: 1, nome: "Afirmação da Paz", texto: "Eu sou, Eu sou, Eu sou a luz que emana paz", finalidade: "Acalma a mente e afasta pensamentos negativos.", repeticoes: 12, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Afirmac%CC%A7a%CC%83o%20da%20paz.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Eu%20sou%20a%20luz%20que%20emana%20paz.MP3", imageSrc: "https://i.postimg.cc/bNbZDBGR/paz.png", imagePrompt: "A serene and ethereal visual representation of inner peace. Abstract art, soft glowing light, calming energy, spiritual, high resolution, beautiful." },
    { id: 2, nome: "Chama Violeta", texto: "Eu sou um ser de fogo violeta, eu sou a pureza que Deus deseja", finalidade: "Limpa culpas, libera o passado e eleva a vibração.", repeticoes: 36, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Chama%20Violeta.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Chama%20Violeta.MP3", imageSrc: "https://i.postimg.cc/BvJ4vhDt/violet.png", imagePrompt: "An abstract representation of the violet flame of transmutation. Swirls of purple, magenta, and indigo light, cleansing energy, spiritual fire, high resolution, ethereal." },
    { id: 3, nome: "Harmonia nos Relacionamentos", texto: "Satya Naraya Ni Namostute Sarva Mangala Mangayê", finalidade: "Melhora vínculos e atrai harmonia.", repeticoes: 24, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Harmonia%20nos%20relacionamentos1.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Satya%20Naraya%20Ni.%20Namostute%CC%82.%20Sa%CC%81rva%20Mangala%CC%81.%20Mangaye%CC%82.mp3", imageSrc: "https://i.postimg.cc/bwhsQ9kf/harmony.png", imagePrompt: "A visual representation of harmonious connection between souls. Intertwined golden threads of light, soft pink and green auras, loving energy, beautiful, high resolution." },
    { id: 4, nome: "Purificação Energética", texto: "Om Vajra Sattva Hum", finalidade: "Purifica pensamentos, emoções e o campo energético.", repeticoes: 36, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Purificac%CC%A7a%CC%83o%20energe%CC%81tica1.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om.%20Va%CC%81rjira.%20Sa%CC%81ttva.%20Rum.mp3", imageSrc: "https://i.postimg.cc/vmxkbf2D/purification.png", imagePrompt: "A brilliant, diamond-like white light dissolving dark clouds. Abstract art of energetic purification, cleansing waterfall of light, spiritual, high resolution." },
    { id: 5, nome: "Realização de Desejos", texto: "Hansa Soham Ekam", finalidade: "Ajuda a realizar desejos e intenções positivas.", repeticoes: 48, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Realizac%CC%A7a%CC%83o%20dos%20desejos.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Hansa%20Soham%20Ekam.mp3", imageSrc: "https://i.postimg.cc/vBLPZzr8/manifestation.png", imagePrompt: "A seed of light blooming into a beautiful, intricate mandala. Abstract art of manifestation, creative energy, golden sparks, high resolution, magical." },
    { id: 6, nome: "Proteção Divina", texto: "Jey Sita Ram", finalidade: "Protege você e sua família contra energias negativas.", repeticoes: 24, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Protec%CC%A7a%CC%83o%20divina.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Jey%20Sita%20Ram.%20jey%20jey%20hanuman.mp3", imageSrc: "https://i.postimg.cc/ZR2rZvgY/protection.png", imagePrompt: "A sphere of brilliant blue and golden light forming a protective shield. Abstract art of divine protection, safe, serene, powerful energy, high resolution." },
    { id: 7, nome: "Remoção de Obstáculos", texto: "Om Shri Ganesha Namaha", finalidade: "Remove obstáculos e favorece novos começos.", repeticoes: 108, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Remoc%CC%A7a%CC%83o%20de%20obsta%CC%81culos.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Shiri%20Ganeschai%20Namara%CC%81.mp3", imageSrc: "https://i.postimg.cc/285HCnVm/obstacles.png", imagePrompt: "A powerful stream of light breaking through a dark, geometric barrier. Abstract art of overcoming obstacles, new pathways opening, success, high resolution." },
    { id: 8, nome: "Tornar Tudo Possível", texto: "Ganesha Sharanam, Sharanam Ganesha", finalidade: "Ajuda a tornar o impossível, possível.", repeticoes: 48, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Tornar%20tudo%20possi%CC%81vel.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Gane%CC%82cha%20charana%CC%83%2C%20charana%CC%83%20Gane%CC%82cha%20.mp3", imageSrc: "https://i.postimg.cc/xTF68qzm/possibility.png", imagePrompt: "A swirling galaxy of possibilities and starlight, with new worlds forming. Abstract art of infinite potential, miracles, creative power, high resolution, cosmic." },
    { id: 9, nome: "Cura e Prosperidade", texto: "Om Kala Vidê Namaha", finalidade: "Ativa cura, paz interior e prosperidade.", repeticoes: 108, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Cura%20e%20prosperidade.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/om%20kala%20vide%CC%82%20namara%CC%81.mp3", imageSrc: "https://i.postimg.cc/HnktsCW3/healing.png", imagePrompt: "A gentle, flowing river of emerald green and golden light. Abstract art representing healing energy and abundance, peaceful, prosperous, high resolution." },
    { id: 10, nome: "Foco e Memória", texto: "Om Mará Patchá Na Dhi", finalidade: "Melhora o foco, a memória e o aprendizado.", repeticoes: 24, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Foco%20e%20memo%CC%81ria.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Mara%CC%81%20Patcha%CC%81%20Nadi%CC%81.mp3", imageSrc: "https://i.postimg.cc/3NfFkbdh/focus.png", imagePrompt: "A clear, focused beam of light illuminating intricate geometric patterns. Abstract art representing mental clarity, focus, and knowledge, intelligent design, high resolution." },
    { id: 11, nome: "Atrair Riquezas", texto: "Om Zambalá Za Len Dhra Ye Soha", finalidade: "Atrai riqueza, abundância e segurança financeira.", repeticoes: 36, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Atrair%20riquezas.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Zambala%CC%81.%20Za%20Len.%20Draie%CC%82.%20Soha%CC%81.mp3", imageSrc: "https://i.postimg.cc/mgfFmsxq/wealth.png", imagePrompt: "A shower of golden coins and jewels falling like rain into a beautiful landscape. Abstract art representing abundance, wealth, and prosperity, high resolution." },
    { id: 12, nome: "Calma e Leveza", texto: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare — Hare Rama Hare Rama Rama Rama Hare Hare", finalidade: "Acalma a ansiedade e traz leveza emocional.", repeticoes: 24, libraryAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Calma%20e%20leveza.mp3", spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/rare%CC%82%20Kri%CC%81shina.%20rare%CC%82%20Kri%CC%81shina.%20Kri%CC%81shina%20K.MP3", imageSrc: "https://i.postimg.cc/KzH1BXr0/calm.png", imagePrompt: "Soft, pastel-colored clouds gently floating in a serene sky. Abstract art representing emotional calm, lightness, and peace, high resolution, beautiful." }
];

// --- NOVOS DADOS: CHAKRAS (MOVIDO PARA DENTRO DO CÓDIGO PARA SIMPLIFICAR) ---
const CHAKRAS_DATA = [
    {
        id: 1,
        name: "Muladhara",
        color: "#E22E2E",
        mantra: "LAM",
        mudra: "Gyan Mudra",
        desc: "A base, o alicerce. O chakra da raiz nos conecta com a terra, a segurança e a sobrevivência.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/LAM1.MP3"
    },
    {
        id: 2,
        name: "Svadhisthana",
        color: "#E57723",
        mantra: "VAM",
        mudra: "Shakti Mudra",
        desc: "O centro da criatividade, da sexualidade e das emoções. Relacionado com a fluidez e a adaptabilidade.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/VAM.MP3"
    },
    {
        id: 3,
        name: "Manipura",
        color: "#F6F65C",
        mantra: "RAM",
        mudra: "Hakini Mudra",
        desc: "O centro do poder pessoal, da força de vontade e do metabolismo. A 'cidade das joias'.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/RAM.MP3"
    },
    {
        id: 4,
        name: "Anahata",
        color: "#46A66C",
        mantra: "YAM",
        mudra: "Hridaya Mudra",
        desc: "O chakra do coração, o centro do amor, da compaixão e da cura.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/YAM.MP3"
    },
    {
        id: 5,
        name: "Vishuddha",
        color: "#37A2D4",
        mantra: "HAM",
        mudra: "Granthi Mudra",
        desc: "O centro da comunicação e da expressão. A garganta é o canal para a verdade interior.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/HAM.MP3"
    },
    {
        id: 6,
        name: "Ajna",
        color: "#314594",
        mantra: "OM",
        mudra: "Shambhavi Mudra",
        desc: "O terceiro olho. Símbolo da intuição, da sabedoria e da percepção extrasensorial.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/OM.MP3"
    },
    {
        id: 7,
        name: "Sahasrara",
        color: "#9759B3",
        mantra: "AUM",
        mudra: "Dhyana Mudra",
        desc: "O lótus de mil pétalas. Conecta-nos com o universo, a iluminação e a consciência pura.",
        audioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/AUM.MP3"
    }
];

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

let app, auth, db, storage, functions;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
} catch (error) {
    console.error("Erro na inicialização do Firebase. Verifique suas credenciais no .env:", error);
}

// --- CONTEXTO DA APLICAÇÃO ---
const AppContext = createContext(null);

const AppProvider = ({ children }) => {
    // Estados existentes
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [streakData, setStreakData] = useState({ currentStreak: 0, lastPracticedDate: null });
    const [photoURL, setPhotoURL] = useState(null);
    const [allEntries, setAllEntries] = useState([]);
    const [permissionError, setPermissionError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [freeQuestionUsed, setFreeQuestionUsed] = useState(false);
    
    // NOVO ESTADO PARA ONBOARDING
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);

    // --- NOVOS ESTADOS PARA "MEU SANTUÁRIO" ---
    const [meusAudios, setMeusAudios] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // --- NOVOS ESTADOS PARA "ASTROLOGER" ---
    const [astroProfile, setAstroProfile] = useState(null);
    const [astroHistory, setAstroHistory] = useState([]);

    const fetchAllEntries = useCallback(async (uid) => {
        if (!db || !uid) return [];
        try {
            const q = query(collection(db, `users/${uid}/entries`));
            const snapshot = await getDocs(q);
            let entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            entries.sort((a, b) => {
                const dateA = a.practicedAt?.toDate() || 0;
                const dateB = b.practicedAt?.toDate() || 0;
                return dateB - dateA;
            });

            setAllEntries(entries);
            return entries;
        } catch (error) {
            console.error("Erro ao buscar todas as entradas: ", error);
            if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
                setPermissionError("Firestore. Verifique as regras de segurança e os índices.");
            }
            return [];
        }
    }, []);

    const recalculateAndSetStreak = useCallback(async (entries, currentUserId) => {
        if (!currentUserId || !db) return;
        try {
            const practiceEntries = entries
                .filter(e => e.type === 'mantra' && e.practicedAt?.toDate)
                .sort((a, b) => b.practicedAt.toDate() - a.practicedAt.toDate());

            if (practiceEntries.length === 0) {
                const newStreakData = { currentStreak: 0, lastPracticedDate: null };
                setStreakData(newStreakData);
                const userRef = doc(db, `users/${currentUserId}`);
                await updateDoc(userRef, { 
                    currentStreak: newStreakData.currentStreak, 
                    lastPracticedDate: null 
                });
                return;
            }

            const uniquePracticeDays = [...new Set(practiceEntries.map(e => {
                const d = e.practicedAt.toDate();
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            }))];

            let calculatedStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastPracticeDay = new Date(uniquePracticeDays[0]);

            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            if (lastPracticeDay.getTime() === today.getTime() || lastPracticeDay.getTime() === yesterday.getTime()) {
                calculatedStreak = 1;
                let lastCheckedDate = new Date(lastPracticeDay);
                for (let i = 1; i < uniquePracticeDays.length; i++) {
                    const practiceDate = new Date(uniquePracticeDays[i]);
                    const expectedPreviousDay = new Date(lastCheckedDate);
                    expectedPreviousDay.setDate(lastCheckedDate.getDate() - 1);

                    if (practiceDate.getTime() === expectedPreviousDay.getTime()) {
                        calculatedStreak++;
                        lastCheckedDate = practiceDate;
                    } else {
                        break; 
                    }
                }
            } else {
                calculatedStreak = 0;
            }
            
            if (lastPracticeDay.getTime() === today.getTime() && calculatedStreak === 0) {
                calculatedStreak = 1;
            }

            const newStreakData = {
                currentStreak: calculatedStreak,
                lastPracticedDate: lastPracticeDay,
            };

            setStreakData(newStreakData);
            const userRef = doc(db, `users/${currentUserId}`);
            await updateDoc(userRef, { 
                currentStreak: newStreakData.currentStreak, 
                lastPracticedDate: Timestamp.fromDate(newStreakData.lastPracticedDate) 
            });
        } catch (error) {
            console.error("Error recalculating streak:", error);
            if (error.code === 'permission-denied') {
                setPermissionError("Firestore");
            }
        }
    }, []);

    // NOVA FUNÇÃO PARA ATUALIZAR STATUS DO ONBOARDING
const updateOnboardingStatus = useCallback(async (status) => {
    setOnboardingCompleted(status);
    if (userId && db) {
        try {
            const userRef = doc(db, `users/${userId}`);
            await updateDoc(userRef, { onboardingCompleted: status });
        } catch (error) { console.error("Erro ao atualizar status do onboarding:", error); }
    }
}, [userId]);

    // --- NOVAS FUNÇÕES PARA "MEU SANTUÁRIO" ---
    const fetchMeusAudios = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const q = query(collection(db, `users/${uid}/meusAudios`), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const audios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeusAudios(audios);
        } catch (error) {
            console.error("Erro ao buscar 'Meus Áudios':", error);
        }
    }, []);

    const fetchPlaylists = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const q = query(collection(db, `users/${uid}/playlists`), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const playlistsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlaylists(playlistsData);
        } catch (error) {
            console.error("Erro ao buscar Playlists:", error);
        }
    }, []);
    
    // --- NOVA FUNÇÃO PARA ASTROLOGER ---
    const fetchAstroHistory = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const q = query(collection(db, `users/${uid}/astroHistory`), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const history = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
            setAstroHistory(history);
        } catch (error) {
            console.error("Erro ao buscar histórico astral:", error);
            // O erro de permissão é tratado no onAuthStateChanged principal, mas é bom ter aqui também
        }
   }, []);

// Atualização em tempo real do histórico do astrólogo
useEffect(() => {

        if (!db || !userId) return;
        try {
            const q = query(collection(db, `users/${userId}/astroHistory`), orderBy('createdAt', 'desc'));
            const unsub = onSnapshot(
                q,
                (snap) => {
                    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setAstroHistory(items);
                },
                (err) => {
                    console.error('onSnapshot astroHistory', err);
                    if (err?.code === 'permission-denied') {
                        setPermissionError('Firestore. Verifique as regras ou autenticação.');
                    }
                }
            );
            return () => unsub();
        } catch (e) {
            console.error('Erro no listener de astroHistory:', e);
        }
    }, [db, userId]);

    // Função para buscar todos os dados do usuário, incluindo os novos
    const fetchUserData = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const userRef = doc(db, `users/${uid}`);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserName(data.name);
                setFavorites(data.favorites || []);
                setPhotoURL(data.photoURL || null);
                setIsSubscribed(data.isPremium || false);
                setFreeQuestionUsed(!!data.freeQuestionUsed);
                setStreakData({
                    currentStreak: data.currentStreak || 0,
                    lastPracticedDate: data.lastPracticedDate?.toDate() || null
                });
// --- ATUALIZAÇÃO DO ESTADO ASTROLOGER ---
if (data.astroProfile) {
    setAstroProfile(data.astroProfile);
} else {
    setAstroProfile(null);
}
} else if (auth.currentUser?.displayName) {
    setUserName(auth.currentUser.displayName);
    setIsSubscribed(false);
    setAstroProfile(null);
}
await fetchAllEntries(uid);
await fetchMeusAudios(uid);
await fetchPlaylists(uid);
await fetchAstroHistory(uid);
} catch (error) {
    console.error("Error fetching user data:", error);
    if (error.code === 'permission-denied') {
        setPermissionError("Firestore");
    }
}
}, [fetchAllEntries, fetchMeusAudios, fetchPlaylists, fetchAstroHistory]);

useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
            if (user) {
                const fetchedUserId = user.uid;
                setUserId(fetchedUserId);
                setUser(user);

                const ref = doc(db, "users", user.uid);
                await setDoc(ref, { criadoEm: new Date() }, { merge: true });

                const snap = await getDoc(ref);
                if (snap.exists()) {
                    await fetchUserData(fetchedUserId);
                }
            } else {
                setUser(null);
                setUserId(null);
                setUserName('');
                setFavorites([]);
                setStreakData({ currentStreak: 0, lastPracticedDate: null });
                setPhotoURL(null);
                setAllEntries([]);
                setIsSubscribed(false);
                setMeusAudios([]);
                setPlaylists([]);
                setAstroProfile(null);
                setAstroHistory([]);
            }
        } catch (error) {
            console.error("Error during auth state change:", error);
            if (error.code === 'permission-denied') {
                setPermissionError("Firestore");
            }
        } finally {
            setLoading(false);
        }
    });

    return () => unsubscribe();
}, []);

const updateFavorites = async (newFavorites) => {
    setFavorites(newFavorites);
    if (userId && db) {
        const userRef = doc(db, `users/${userId}`);
        await updateDoc(userRef, { favorites: newFavorites });
    }
};

const value = { 
    user, loading, userId, userName, fetchUserData, favorites, updateFavorites, streakData, allEntries, fetchAllEntries, recalculateAndSetStreak, photoURL, setPhotoURL, permissionError, isSubscribed, setIsSubscribed,
    meusAudios, playlists, fetchMeusAudios, fetchPlaylists,
    astroProfile, setAstroProfile, astroHistory, fetchAstroHistory, freeQuestionUsed, setFreeQuestionUsed,
    onboardingCompleted, // Adicione esta linha
    updateOnboardingStatus // Adicione esta linha
};

return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
// --- TELAS E COMPONENTES EXISTENTES ---

const SplashScreen = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-purple-700 to-indigo-900 text-white z-50 p-4">
        <style>{`.splash-content{animation:fade-in-splash 1s ease-out forwards}.mandala-path{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw-mandala 2.5s ease-in-out forwards}#mandala-c1{animation-delay:.5s}#mandala-c2{animation-delay:.7s}#mandala-p1{animation-delay:.9s}#mandala-c3{animation-delay:1.2s}#mandala-p2{animation-delay:1.5s}#mandala-c4{animation-delay:1.8s}.splash-title,.splash-subtitle{opacity:0;animation:fade-in-text 1.5s ease-in 2.5s forwards}.splash-subtitle{animation-delay:2.8s}@keyframes draw-mandala{to{stroke-dashoffset:0}}@keyframes fade-in-text{to{opacity:1}}@keyframes fade-in-splash{from{opacity:0}to{opacity:1}}`}</style>
        <div className="splash-content text-center">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="mx-auto"><defs><filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><path id="petal" d="M 50,10 C 40,25 40,40 50,50 C 60,40 60,25 50,10 Z" /></defs><g className="text-yellow-300" filter="url(#neon-glow)" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle id="mandala-c1" className="mandala-path" cx="50" cy="50" r="8" /><circle id="mandala-c2" className="mandala-path" cx="50" cy="50" r="12" /><g id="mandala-p1" className="mandala-path">{[0,60,120,180,240,300].map(r => (<use key={r} href="#petal" transform={`rotate(${r} 50 50) scale(0.4) translate(0 -30)`} />))}</g><circle id="mandala-c3" className="mandala-path" cx="50" cy="50" r="25" /><g id="mandala-p2" className="mandala-path">{[0,45,90,135,180,225,270,315].map(r => (<use key={r} href="#petal" transform={`rotate(${r} 50 50) scale(0.8) translate(0 -18)`} />))}</g><circle id="mandala-c4" className="mandala-path" cx="50" cy="50" r="45" /></g></svg>
            <h1 className="splash-title text-4xl mt-4 text-white tracking-wider" style={{fontFamily:"var(--font-display)",fontWeight:400}}>Mantras+</h1>
            <p className="splash-subtitle text-lg mt-2 text-purple-200 tracking-wide">A sua jornada começa agora.</p>
        </div>
    </div>
);

const AuthScreen = () => {
    const { fetchUserData, setIsSubscribed } = useContext(AppContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mapAuthCodeToMessage = (code) => {
        switch (code) {
            case 'auth/invalid-email': return 'Formato de e-mail inválido.';
            case 'auth/user-not-found':
            case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
            case 'auth/wrong-password': return 'Senha incorreta.';
            case 'auth/email-already-in-use': return 'Este e-mail já está em uso.';
            case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
            case 'auth/network-request-failed': return 'Erro de conexão. Verifique sua internet.';
            case 'auth/popup-closed-by-user': return 'A janela de login foi fechada. Tente novamente.';
            case 'auth/account-exists-with-different-credential': return 'Já existe uma conta com este e-mail, mas usando um método de login diferente.';
            default: return `Ocorreu um erro inesperado. Tente novamente. (Código: ${code})`;
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!auth || !db) {
            setError("O Firebase não foi inicializado corretamente. Verifique a configuração.");
            return;
        }
        setError(''); setMessage(''); setIsSubmitting(true);
        if (!isLogin && password !== confirmPassword) {
            setError('As senhas não correspondem.'); setIsSubmitting(false); return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });

                let isPremium = false;
                try {
                    const pendingRef = collection(db, "pendingPremium");
                    const q = query(pendingRef, where("email", "==", user.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        isPremium = true;
                        const pendingDoc = querySnapshot.docs[0];
                        await deleteDoc(doc(db, "pendingPremium", pendingDoc.id));
                        console.log(`Assinatura pendente para ${user.email} ativada e registro removido.`);
                    }
                } catch (checkError) {
                    console.error("Erro ao verificar assinatura pendente:", checkError);
                }

                const userRef = doc(db, `users/${user.uid}`);
                await setDoc(userRef, {
                    name: name,
                    email: user.email,
                    isPremium: isPremium,
                    favorites: [],
                    currentStreak: 0,
                    lastPracticedDate: null,
                    createdAt: Timestamp.now(),
                    onboardingCompleted: false // Adicione esta linha
                });
                
                if (isPremium) {
                    setMessage("Sua conta foi criada e sua assinatura premium ativada automaticamente!");
                    setIsSubscribed(true); 
                } else {
                    setMessage("Conta criada com sucesso!");
                }
            }
        } catch (err) {
            console.error("Firebase Email Auth Error:", err);
            setError(mapAuthCodeToMessage(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (providerName) => {
        if (!auth || !db) {
            setError("O Firebase não foi inicializado corretamente.");
            return;
        }
        setError(''); setMessage(''); setIsSubmitting(true);

        const provider = new GoogleAuthProvider(); // Corrigido para usar sempre Google

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, `users/${user.uid}`);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                // Se o usuário não existe no Firestore, cria o documento dele
                let isPremium = false;
                try {
                    const pendingRef = collection(db, "pendingPremium");
                    const q = query(pendingRef, where("email", "==", user.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        isPremium = true;
                        const pendingDoc = querySnapshot.docs[0];
                        await deleteDoc(doc(db, "pendingPremium", pendingDoc.id));
                    }
                } catch (checkError) {
                    console.error("Erro ao verificar assinatura pendente:", checkError);
                }

                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    isPremium: isPremium,
                    favorites: [],
                    currentStreak: 0,
                    lastPracticedDate: null,
                    createdAt: Timestamp.now(),
                    onboardingCompleted: false // Adicione esta linha
                });

                if (isPremium) setIsSubscribed(true);
            }
            // A transição de tela será gerenciada pelo listener onAuthStateChanged principal.
        } catch (err) {
            console.error("Firebase Social Auth Error:", err);
            setError(mapAuthCodeToMessage(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePasswordReset = async () => {
        if (!email) { setError('Por favor, insira seu e-mail para redefinir a senha.'); return; }
        if (!auth) {
            setError("O Firebase não foi inicializado corretamente.");
            return;
        }
        setError(''); setMessage(''); setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.');
        } catch (err) {
            console.error("Firebase Password Reset Error:", err);
            setError(mapAuthCodeToMessage(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 modern-body">
            <div className="w-full max-w-md mx-auto glass-card p-8 space-y-6">
                <div className="text-center">
                    <img 
                        src="https://i.postimg.cc/Gm7sPsQL/6230-C8-D1-AC9-B-4744-8809-341-B6-F51964-C.png" 
                        alt="Logo Clube dos Mantras" 
                        className="mx-auto w-16 h-16 mb-4" 
                    />
                    <h2 className="page-title !text-2xl !text-white !-mt-2 text-center">{isLogin ? 'Bem-vindo(a)' : 'Crie a Sua Conta'}</h2>
                    <p className="mt-[-0.5rem] text-base text-white/70 text-center">{isLogin ? 'Acesse seu diário espiritual.' : 'Comece a sua jornada de transformação.'}</p>
                </div>
                <form className="space-y-4" onSubmit={handleEmailAuth}>
                    {!isLogin && <input type="text" placeholder="O seu nome" value={name} onChange={e => setName(e.target.value)} required className="input-field" />}
                    <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" />
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
                    {!isLogin && <input type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-field" />}
                    
                    <button type="submit" className="w-full modern-btn-primary h-14" disabled={isSubmitting}>
                        {isSubmitting ? <div className="w-6 h-6 border-2 border-black/50 border-t-black rounded-full animate-spin"></div> : (isLogin ? 'Entrar' : 'Registrar')}
                    </button>
                </form>
                {error && <p className="text-sm text-center text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}
                {message && <p className="text-sm text-center text-green-400 bg-green-500/20 p-3 rounded-lg">{message}</p>}
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/20"></div>
                    <span className="flex-shrink mx-4 text-white/60 text-xs uppercase">Ou continue com</span>
                    <div className="flex-grow border-t border-white/20"></div>
                </div>

                <div className="space-y-3">
                    <button type="button" onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white" disabled={isSubmitting}>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.657-3.356-11.303-8H6.393c3.541,8.337,12.061,14,21.607,14L24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.018,35.245,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        <span>Entrar com Google</span>
                    </button>

                </div>

                <div>
                    <div className="text-sm text-center mt-4">
                        <span className="text-white/60">{isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}</span>
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="ml-1 text-[#FFD54F] hover:underline">
                            {isLogin ? 'Registre-se' : 'Faça login'}
                        </button>
                    </div>
                    {isLogin && (
                        <div className="text-center mt-2">
                            <button onClick={handlePasswordReset} className="text-xs text-white/60 hover:underline" disabled={isSubmitting}>
                                Esqueceu a senha?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- INÍCIO: NOVO COMPONENTE DE ONBOARDING ---
const OnboardingScreen = () => {
    const { userName, updateOnboardingStatus } = useContext(AppContext);
    const [step, setStep] = useState(1);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [recommendedMantra, setRecommendedMantra] = useState(null);
    const [playerData, setPlayerData] = useState({ mantra: null, repetitions: 1, audioType: 'library' });

    const goals = [
        { key: 'anxiety', label: "Reduzir ansiedade e estresse", icon: Wind, mantraId: 12 },
        { key: 'focus', label: "Melhorar foco e concentração", icon: BrainCircuit, mantraId: 10 },
        { key: 'prosperity', label: "Atrair mais prosperidade", icon: TrendingUp, mantraId: 11 },
        { key: 'peace', label: "Aumentar a paz interior", icon: Leaf, mantraId: 1 } // Ícone corrigido de Lotus para Leaf
    ];

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        const mantra = MANTRAS_DATA.find(m => m.id === goal.mantraId);
        setRecommendedMantra(mantra);
        setStep(2);
    };

    const handleStartPractice = () => {
        setPlayerData({ mantra: recommendedMantra, repetitions: 1, audioType: 'library' });
    };
    
    const handlePlayerClose = () => {
        setPlayerData({ mantra: null, repetitions: 1, audioType: 'library' });
        setStep(3);
    };

    const handleFinishOnboarding = () => {
        updateOnboardingStatus(true);
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center screen-animation">
                        <PageTitle subtitle={`Olá, ${userName || 'Ser de Luz'}! Para personalizar sua jornada, conte-nos:`}>Qual seu principal objetivo?</PageTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {goals.map(goal => (
                                <button key={goal.key} onClick={() => handleGoalSelect(goal)} className="glass-card !p-6 text-left flex items-center gap-4 clickable hover:!border-[#FFD54F]">
                                    <goal.icon className="h-8 w-8 text-[#FFD54F] flex-shrink-0" />
                                    <span className="text-white text-base font-light">{goal.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center screen-animation">
                        <PageTitle subtitle="Com base no seu objetivo, recomendamos este mantra para começar:">Sua Primeira Prática</PageTitle>
                        {recommendedMantra && (
                            <div className="glass-card mt-8">
                                <img src={recommendedMantra.imageSrc} alt={recommendedMantra.nome} className="w-full h-40 object-cover rounded-lg mb-4" />
                                <h3 className="text-xl text-[#FFD54F]" style={{fontFamily: "var(--font-display)"}}>{recommendedMantra.nome}</h3>
                                <p className="text-white/80 my-3 font-light italic">"{recommendedMantra.texto}"</p>
                                <button onClick={handleStartPractice} className="w-full modern-btn-primary h-14 mt-4"><Play /> Ouvir por 30 segundos</button>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                     <div className="text-center screen-animation">
                        <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
                        <PageTitle subtitle="Você deu o primeiro passo na sua jornada de transformação. Continue a explorar e aprofundar sua prática.">Parabéns!</PageTitle>
                        <button onClick={handleFinishOnboarding} className="w-full max-w-xs mx-auto modern-btn-primary h-14 mt-8">Explorar o App</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4 modern-body">
                <div className="w-full max-w-lg mx-auto z-10">{renderStepContent()}</div>
            </div>
            {playerData.mantra && <MantraPlayer currentMantra={playerData.mantra} onClose={handlePlayerClose} onMantraChange={() => {}} audioType={playerData.audioType} totalRepetitions={1} />}
        </>
    );
};
// --- FIM: NOVO COMPONENTE DE ONBOARDING ---

// --- COMPONENTES AUXILIARES ---
const ScreenAnimator = ({ children, screenKey }) => (<div key={screenKey} className="screen-animation">{children}</div>);
const PageTitle = ({ children, subtitle }) => (<div><h1 className="page-title">{children}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>);
const PremiumButton = ({ onClick, children, className = '' }) => (<button type="button" onClick={onClick} className={`w-full modern-btn-primary !py-2 !px-4 !text-sm !font-normal !bg-white/10 !text-white/70 cursor-pointer ${className}`}><Lock className="h-4 w-4" />{children}</button>);
const Header = ({ setActiveScreen }) => { const LOGO_URL = "https://i.postimg.cc/Gm7sPsQL/6230-C8-D1-AC9-B-4744-8809-341-B6-F51964-C.png"; return (<header className="fixed top-0 left-0 right-0 z-30 p-4 glass-nav"><div className="max-w-4xl mx-auto flex justify-between items-center"><div className="flex items-center gap-3"><img src={LOGO_URL} alt="Logo Clube dos Mantras" className="w-10 h-10" /><span className="text-lg text-white/90" style={{fontFamily: 'var(--font-display)'}}>Mantras+</span></div><button onClick={() => setActiveScreen('settings')} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"><Settings className="h-6 w-6" /></button></div></header>); };

// --- BOTTOMNAV (COM ÍCONES ATUALIZADOS) ---
const BottomNav = ({ activeScreen, setActiveScreen }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'spokenMantras', icon: HandCoins, label: 'Mantras' },
        { id: 'meuSantuario', icon: Leaf, label: 'Santuário' },
        { id: 'more', icon: AlignJustify, label: 'Mais' }
    ];

    const secondaryScreens = ['chakras', 'mantras', 'astrologer', 'history', 'oracle'];
    const effectiveActiveScreen = secondaryScreens.includes(activeScreen) ? 'more' : activeScreen;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 glass-bottom-nav">
            <div className="flex justify-around max-w-lg mx-auto">
                {navItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveScreen(item.id)} 
                        className="relative flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-300 ease-in-out text-white/70 hover:text-white"
                    >
                        <item.icon className={`h-6 w-6 transition-all ${effectiveActiveScreen === item.id ? 'text-[#FFD54F]' : ''}`} />
                        <span className={`text-xs mt-1 transition-opacity ${effectiveActiveScreen === item.id ? 'opacity-100 text-[#FFD54F]' : 'opacity-0'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
};


// --- COMPONENTES DE MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", confirmClass = "btn-danger" }) => { if (!isOpen) return null; return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="glass-modal w-full max-w-sm" onClick={e => e.stopPropagation()}><h2 className="text-xl text-white">{title}</h2><p className="text-white/70 my-4">{message}</p><div className="flex justify-end gap-4"><button onClick={onClose} className="btn-secondary">Cancelar</button><button onClick={onConfirm} className={confirmClass}>{confirmText}</button></div></div></div>); };
const ReauthModal = ({ isOpen, onClose, onConfirm, password, setPassword, isSubmitting, title, message, errorMessage }) => { if (!isOpen) return null; return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="glass-modal w-full max-w-sm text-white" onClick={e => e.stopPropagation()}><h2 className="text-xl">{title}</h2><p className="text-white/70 my-4">{message}</p><form onSubmit={onConfirm} className="space-y-4"><div className="space-y-2"><label className="text-sm text-white/80" htmlFor="reauth-password">Sua Senha</label><input id="reauth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required /></div>{errorMessage && <p className="text-sm text-center text-red-400">{errorMessage}</p>}<div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancelar</button><button type="submit" className="btn-danger" disabled={isSubmitting}>{isSubmitting ? 'Confirmando...' : 'Confirmar e Deletar'}</button></div></form></div></div>); };
const PremiumLockModal = ({ isOpen, onClose }) => { if (!isOpen) return null; const handleSubscribe = () => { window.open('https://pay.kiwify.com.br/fFFErhY', '_blank'); onClose(); }; return (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="glass-modal w-full max-w-sm text-center" onClick={e => e.stopPropagation()}><Sparkles className="mx-auto h-12 w-12 text-[#FFD54F]" style={{filter: 'drop-shadow(0 0 10px rgba(255, 213, 79, 0.5))'}} /><h2 className="text-2xl text-white mt-4" style={{ fontFamily: "var(--font-display)" }}>Função Premium</h2><p className="text-white/70 my-4 font-light">Desbloqueie esta e outras funcionalidades exclusivas com a sua assinatura.</p><div className="flex flex-col gap-4"><button onClick={handleSubscribe} className="modern-btn-primary h-14">Assinar Agora</button><button onClick={onClose} className="text-sm text-white/60 hover:underline">Agora não</button></div></div></div>); };
const SubscriptionManagementModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const handleNewSubscription = () => { window.open('https://pay.kiwify.com.br/fFFErhY', '_blank'); onClose(); };
    const handleManageSubscription = () => { window.open('https://subscription.kiwify.com/subscription/manage', '_blank'); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-modal w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <Sparkles className="mx-auto h-12 w-12 text-[#FFD54F]" style={{filter: 'drop-shadow(0 0 10px rgba(255, 213, 79, 0.5))'}} />
                <h2 className="text-2xl text-white mt-4" style={{ fontFamily: "var(--font-display)" }}>Assinatura Premium</h2>
                <p className="text-white/70 my-4 font-light">O que você gostaria de fazer?</p>
                <div className="flex flex-col gap-4">
                    <button onClick={handleNewSubscription} className="modern-btn-primary h-14">Tornar-se Premium</button>
                    <button onClick={handleManageSubscription} className="w-full btn-secondary">Gerenciar Assinatura Atual</button>
                </div>
            </div>
        </div>
    );
};

// --- TELAS EXISTENTES (alteradas para navegação) ---
const HomeScreen = ({ setActiveScreen, openCalendar, openDayDetail }) => { const { userName, streakData, allEntries, isSubscribed } = useContext(AppContext); const dailyMessages = [ "A luz do Sol renasce em você. Que seu domingo seja de alma renovada.", "A força está em acolher-se por inteiro. Que sua segunda seja leve e clara.", "Coragem para agir com alma. A terça-feira pede passos verdadeiros.", "Palavras curam. Silêncios ensinam. Que sua quarta seja de conexão interna.", "Sabedoria está em ver beleza no simples. Que sua quinta seja próspera.", "Celebre suas conquistas, grandes e pequenas. A sexta-feira chegou!", "Silencie, desacelere, retorne ao centro. O sábado é um templo sagrado." ]; const premiumMessages = [ "Como membro Mantra+, sua jornada hoje é guiada pela energia da prosperidade.", "Sua assinatura ilumina o caminho. Que a prática de hoje aprofunde sua conexão.", "Agradecemos por ser Mantra+. Que sua intenção para hoje se manifeste com força.", "Seu apoio nos inspira. Que a vibração do universo ressoe em você hoje.", "Membro Mantra+, sua luz é essencial. Que hoje seja um dia de clareza e paz.", "Sua energia contribui para este espaço. Que a sexta-feira traga realizações.", "Aproveite o descanso, membro Mantra+. Sua paz interior é a nossa alegria." ]; const todayIndex = new Date().getDay(); const message = isSubscribed ? premiumMessages[todayIndex] : dailyMessages[todayIndex]; const messageColor = 'text-[#FFD54F]/80'; const WeekView = () => { const today = new Date(); const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; const days = Array.from({ length: 7 }).map((_, i) => { const date = new Date(today); date.setDate(today.getDate() - today.getDay() + i); return date; }); const practicedDays = new Set((allEntries || []).filter(e => e.practicedAt?.toDate).map(entry => entry.practicedAt.toDate().toDateString())); return (<div className="w-full glass-card p-4 space-y-3 premium-card-glow"><div className="flex justify-around">{days.map((day, index) => { const isPracticed = practicedDays.has(day.toDateString()); const isToday = day.toDateString() === new Date().toDateString(); const buttonClasses = `w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm ${ isToday && isPracticed ? 'bg-yellow-400/20 ring-2 ring-[#FFD54F]' : isToday ? 'ring-2 ring-[#FFD54F] bg-white/10' : isPracticed ? 'bg-white/10 border-2 border-[#FFD54F]' : 'bg-white/10' }`; return (<div key={index} className="flex flex-col items-center gap-2"><span className={`text-sm font-light ${isToday ? 'text-[#FFD54F]' : 'text-white/60'}`}>{weekDays[day.getDay()]}</span><button onClick={() => openDayDetail(day)} className={buttonClasses}>{isToday ? <Flame className="text-yellow-400" size={16} /> : day.getDate()}</button></div>); })}</div><div className="text-center pt-3 border-t border-white/10"><button onClick={openCalendar} className="text-sm text-[#FFD54F] hover:underline font-light">Ver calendário completo</button></div></div>); }; return (<div className="page-container text-center"><div><div className="flex items-center justify-center gap-3 flex-wrap"><h1 className="page-title !text-3xl !mb-0">Olá, {userName || "Ser de Luz"}</h1>{isSubscribed && (<div className="bg-white/10 text-[#FFD54F] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 self-center mt-[-4px]"><span>PREMIUM</span></div>)}</div><p className={`${messageColor} mt-1 mb-4 text-base italic font-light`}>"{message}"</p></div>{streakData && streakData.currentStreak > 0 && (<div className="glass-card p-6 flex items-center justify-center gap-5 text-center premium-card-glow"><Flame className="h-10 w-10 text-[#FFD54F]" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 213, 79, 0.5))' }} /><div><p className="text-xl text-white">{streakData.currentStreak} {streakData.currentStreak > 1 ? 'dias' : 'dia'} de prática</p><p className="text-sm text-white/60 font-light">Continue assim!</p></div></div>)}<WeekView /><div className="w-full max-w-md mx-auto space-y-3"><button onClick={() => setActiveScreen('diary')} className="w-full btn-secondary h-16 flex items-center justify-center gap-2"><PlusCircle className="h-6 w-6" /> Registrar Prática de Mantra</button><button onClick={() => setActiveScreen('gratitude')} className="w-full btn-secondary h-16 flex items-center justify-center gap-2"><PlusCircle className="h-6 w-6" /> Registrar Gratidão Diária</button></div></div>); };
const DiaryScreen = ({ entryToEdit, onSave, onCancelEdit, openPremiumModal }) => { const { userId, fetchAllEntries, recalculateAndSetStreak, isSubscribed } = useContext(AppContext); const [selectedMantra, setSelectedMantra] = useState(MANTRAS_DATA[0].id); const [repetitions, setRepetitions] = useState(''); const [timeOfDay, setTimeOfDay] = useState([]); const [feelings, setFeelings] = useState(''); const [observations, setObservations] = useState(''); const [status, setStatus] = useState({ type: '', message: '' }); const [reflection, setReflection] = useState(''); const [isGenerating, setIsGenerating] = useState(false); const [isMantraModalOpen, setIsMantraModalOpen] = useState(false); useEffect(() => { if (entryToEdit) { setSelectedMantra(entryToEdit.mantraId); setRepetitions(entryToEdit.repetitions); setTimeOfDay(entryToEdit.timeOfDay); setFeelings(entryToEdit.feelings); setObservations(entryTo-edit.observations || ''); } }, [entryToEdit]); useEffect(() => { if (!entryToEdit) { const mantra = MANTRAS_DATA.find(m => m.id === selectedMantra); if (mantra) { setRepetitions(mantra.repeticoes); } } }, [selectedMantra, entryToEdit]); const handleGenerateReflection = async () => { if (!feelings) return; setIsGenerating(true); setReflection(''); try { const prompt = `Um usuário de um aplicativo de mantras descreveu seus sentimentos hoje como: "${feelings}". Escreva uma reflexão curta (máximo 3 frases), gentil e inspiradora em português, baseada nesse sentimento, para encorajá-lo em sua jornada espiritual. Não ofereça conselhos médicos.`; let chatHistory = []; chatHistory.push({ role: "user", parts: [{ text: prompt }] }); const payload = { contents: chatHistory }; const apiKey = firebaseConfig.apiKey; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`; const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); } const result = await response.json(); if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) { const text = result.candidates[0].content.parts[0].text; setReflection(text); } else { console.error("Unexpected API response structure:", result); setReflection("Não foi possível gerar uma reflexão no momento. Tente novamente."); } } catch (error) { console.error("Gemini API Error:", error); if (error.message.includes("403")) { setReflection("Erro de permissão (403). Verifique se a sua Chave de API está correta no código e se as restrições no Google Cloud estão configuradas corretamente."); } else if (error.message.includes("404")) { setReflection("Erro (404). O modelo de IA não foi encontrado. O nome pode estar incorreto."); } else { setReflection("Ocorreu um erro ao se conectar com a sabedoria interior. Tente novamente."); } } finally { setIsGenerating(false); } }; const handleTimeOfDayToggle = (time) => setTimeOfDay(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]); const handleSubmit = async (e) => { e.preventDefault(); if (!selectedMantra || !repetitions || timeOfDay.length === 0 || !feelings) { setStatus({ type: 'error', message: 'Preencha os campos obrigatórios.' }); return; } if (!userId || !db) return; const entryData = { type: 'mantra', mantraId: selectedMantra, repetitions: Number(repetitions), timeOfDay, feelings, observations, }; try { if (entryToEdit) { await updateDoc(doc(db, `users/${userId}/entries`, entryToEdit.id), entryData); setStatus({ type: 'success', message: 'Registro atualizado!' }); } else { await addDoc(collection(db, `users/${userId}/entries`), {...entryData, practicedAt: Timestamp.now()}); setStatus({ type: 'success', message: 'Registro salvo!' }); } const entries = await fetchAllEntries(userId); await recalculateAndSetStreak(entries, userId); setTimeout(() => onSave(), 1500); } catch (error) { setStatus({ type: 'error', message: 'Erro ao salvar.' }); } }; const currentMantra = MANTRAS_DATA.find(m => m.id === selectedMantra); const LabelWithIcon = ({ icon: Icon, text }) => ( <label className="text-white/80 flex items-center gap-2 font-light"><Icon size={18} className="text-[#FFD54F]/80" /><span>{text}</span></label> ); const handleSelectMantraAndClose = (id) => { setSelectedMantra(id); setIsMantraModalOpen(false); }; return (<><div className="page-container"><PageTitle subtitle="Registre os detalhes da sua prática diária para acompanhar sua evolução e insights.">{entryToEdit ? 'Editar Registro' : 'Diário de Prática'}</PageTitle><form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto glass-card space-y-8"><div className="space-y-3"><LabelWithIcon icon={Star} text="Mantra do Dia" /><div className="p-4 rounded-lg bg-black/20 text-center"><p className="italic text-white/80">"{currentMantra?.texto}"</p><button type="button" onClick={() => setIsMantraModalOpen(true)} className="text-sm text-[#FFD54F] hover:underline mt-2 font-light">Trocar Mantra</button></div></div><div className="space-y-3"><LabelWithIcon icon={GaugeCircle} text="Repetições" /><input type="number" value={repetitions} onChange={e => setRepetitions(e.target.value)} className="input-field" required /></div><div className="space-y-3"><LabelWithIcon icon={Clock} text="Horário da Prática" /><div className="grid grid-cols-3 gap-2">{['Manhã', 'Tarde', 'Noite'].map(time => (<button key={time} type="button" onClick={() => handleTimeOfDayToggle(time)} className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${timeOfDay.includes(time) ? 'bg-[#FFD54F] text-[#3A1B57]' : 'bg-white/5 hover:bg-white/10'}`}><span className="text-sm font-light">{time}</span></button>))}</div></div><div className="space-y-3"><LabelWithIcon icon={Heart} text="Como se sentiu?" /><textarea value={feelings} onChange={e => setFeelings(e.target.value)} className="textarea-field" rows="3" placeholder="Ex: Em paz, com a mente clara..." required></textarea></div>{feelings && (<div className="text-center">{isSubscribed ? (<button type="button" onClick={handleGenerateReflection} className="modern-btn-primary !py-2 !px-4 !text-sm !font-semibold" disabled={isGenerating}><Sparkles className="h-5 w-5" />{isGenerating ? 'Gerando...' : '✨ Gerar Reflexão com IA'}</button>) : (<PremiumButton onClick={openPremiumModal}>Gerar Reflexão com IA (Premium)</PremiumButton>)}</div>)}{reflection && (<div className="p-4 bg-black/20 rounded-lg italic text-white/80 text-center font-light"><p>{reflection}</p></div>)}<div className="space-y-3"><LabelWithIcon icon={BookOpen} text="Observações" /><textarea value={observations} onChange={e => setObservations(e.target.value)} className="textarea-field" rows="3" placeholder="Algum insight, sincronicidade..."></textarea></div><div className="flex flex-col gap-4 pt-6 border-t border-white/10"><div className="flex gap-4">{entryToEdit && <button type="button" onClick={onCancelEdit} className="w-full btn-secondary">Cancelar</button>}<button type="submit" className="w-full modern-btn-primary h-14">{entryToEdit ? 'Atualizar' : 'Salvar'}</button></div>{status.message && <p className={`p-3 rounded-lg text-center text-sm ${status.type === 'success' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-400'}`}>{status.message}</p>}</div></form></div><MantraSelectionModal isOpen={isMantraModalOpen} onClose={() => setIsMantraModalOpen(false)} onSelectMantra={handleSelectMantraAndClose} currentMantraId={selectedMantra} /></>); };
const MantraSelectionModal = ({ isOpen, onClose, onSelectMantra, currentMantraId }) => { if (!isOpen) return null; const handleSelect = (id) => { onSelectMantra(id); }; return (<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}><div className="glass-modal w-full max-w-lg" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h2 className="text-xl text-white" style={{fontFamily: "var(--font-display)"}}>Selecione um Mantra</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={20}/></button></div><div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">{MANTRAS_DATA.map(mantra => (<div key={mantra.id} onClick={() => handleSelect(mantra.id)} className={`p-4 rounded-lg cursor-pointer transition-all ${currentMantraId === mantra.id ? 'bg-[#FFD54F] text-[#3A1B57]' : 'bg-white/5 text-white hover:bg-white/10'}`}><p>{mantra.nome}</p><p className={`text-sm font-light ${currentMantraId === mantra.id ? 'opacity-80' : 'text-white/70'}`}>{mantra.texto}</p></div>))}</div></div></div>); };
const MantrasScreen = ({ onPlayMantra, openPremiumModal }) => { const { isSubscribed } = useContext(AppContext); const FREE_MANTRA_IDS = [1, 2]; return (<div className="page-container"><PageTitle subtitle="Explore melodias sagradas para relaxar e meditar.">Músicas Mântricas</PageTitle><div className="grid grid-cols-2 gap-4 md:gap-6">{MANTRAS_DATA.map((mantra) => { const isLocked = !isSubscribed && !FREE_MANTRA_IDS.includes(mantra.id); return (<div key={mantra.id} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group clickable" onClick={() => isLocked ? openPremiumModal() : onPlayMantra(mantra, 1, 'library')}><img src={mantra.imageSrc} alt={`Visual para ${mantra.nome}`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'filter grayscale brightness-50' : ''}`} /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>{isLocked && (<div className="absolute inset-0 flex items-center justify-center bg-black/40"><Lock className="h-10 w-10 text-white/70" /></div>)}<div className="absolute bottom-0 left-0 p-4"><h3 className="text-white text-base leading-tight" style={{ fontFamily: "var(--font-display)" }}>{mantra.nome}</h3></div></div>); })}</div></div>); };
const SpokenMantrasScreen = ({ onSelectMantra, openPremiumModal }) => { const { isSubscribed } = useContext(AppContext); const FREE_MANTRA_IDS = [1, 2]; return (<div className="page-container"><PageTitle subtitle="Escolha um mantra para focar e iniciar sua prática de repetição.">Mantras para Praticar</PageTitle><div className="space-y-4">{MANTRAS_DATA.map((mantra) => { const isLocked = !isSubscribed && !FREE_MANTRA_IDS.includes(mantra.id); return (<div key={mantra.id} className="glass-card !p-5 text-left"><h3 className="text-lg text-[#FFD54F]" style={{ fontFamily: "var(--font-display)" }}>{mantra.nome}</h3><p className="text-white/80 my-3 font-light italic">"{mantra.texto}"</p><div className="mt-4 text-right">{isLocked ? (<PremiumButton onClick={openPremiumModal} className="!w-auto !py-2 !px-5 !text-sm !font-semibold">Praticar</PremiumButton>) : (<button onClick={() => onSelectMantra(mantra)} className="modern-btn-primary !py-2 !px-5 !text-sm !font-semibold"><Mic2 className="h-4 w-4" />Praticar</button>)}</div></div>); })}</div></div>); };
const HistoryScreen = ({ onEditMantra, onEditNote, onDelete }) => {
    const { allEntries } = useContext(AppContext);
    const [expandedId, setExpandedId] = useState(null);
    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
    const entries = allEntries;
    return (
        <div className="page-container">
            <PageTitle subtitle="Reveja todas as suas práticas e anotações passadas, organizadas por data.">Histórico de Práticas</PageTitle>
            <div className="space-y-4">
                {entries.length > 0 ? (
                    entries.map(entry => {
                        const isExpanded = expandedId === entry.id;
                        if (entry.type === 'mantra') {
                            const mantra = MANTRAS_DATA.find(m => m.id === entry.mantraId);
                            if (!mantra || !entry.practicedAt?.toDate) return null;
                            return (
                                <div key={entry.id} className="glass-card !p-0 overflow-hidden">
                                    <div className="p-5 text-left cursor-pointer flex justify-between items-center" onClick={() => toggleExpand(entry.id)}>
                                        <div>
                                            <p className="text-sm text-[#FFD54F] font-light">{entry.practicedAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            <h3 className="text-lg text-white mt-1" style={{fontFamily: "var(--font-display)"}}>{mantra.nome}</h3>
                                        </div>
                                        <ChevronDown className={`text-white/70 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-3 border-t border-white/10 space-y-2 text-sm font-light text-white/70">
                                            <p><span className="text-white/90 font-normal">Repetições:</span> {entry.repetitions}</p>
                                            <p><span className="text-white/90 font-normal">Período:</span> {entry.timeOfDay.join(', ')}</p>
                                            <p><span className="text-white/90 font-normal">Sentimentos:</span> {entry.feelings}</p>
                                            {entry.observations && <p><span className="text-white/90 font-normal">Observações:</span> {entry.observations}</p>}
                                            <div className="flex gap-2 pt-3">
                                                <button onClick={() => onEditMantra(entry)} className="btn-secondary !text-xs !py-1 !px-3">Editar</button>
                                                <button onClick={() => onDelete(entry)} className="btn-danger-outline !text-xs !py-1 !px-3">Apagar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        if (entry.type === 'gratitude') {
                            if (!entry.practicedAt?.toDate) return null;
                            return (
                                <div key={entry.id} className="glass-card !p-5 text-left">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-[#FFD54F] font-light">{entry.practicedAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                                            <h3 className="text-lg text-white mt-1" style={{fontFamily: "var(--font-display)"}}>Pote da Gratidão</h3>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                {entry.gratefulFor.map((item, index) => (
                                                    <li key={index} className="italic text-white/70 text-sm font-light">"{item}"</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => onDelete(entry)} className="p-2 rounded-full text-white/60 hover:bg-white/10 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        if (entry.type === 'note') {
                            if (!entry.practicedAt?.toDate) return null;
                            return (
                                <div key={entry.id} className="glass-card !p-5 text-left">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-[#FFD54F] font-light">{entry.practicedAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                                            <h3 className="text-lg text-white mt-1" style={{fontFamily: "var(--font-display)"}}>Anotação</h3>
                                            <p className="italic text-white/70 text-sm mt-2 font-light">"{entry.note}"</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => onEditNote(entry)} className="p-2 rounded-full text-white/60 hover:bg-white/10 transition-colors"><Edit3 size={16} /></button>
                                            <button onClick={() => onDelete(entry)} className="p-2 rounded-full text-white/60 hover:bg-white/10 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })
                ) : (
                    <div className="glass-card text-center mt-8">
                        <History className="mx-auto h-12 w-12 text-white/50" />
                        <p className="mt-4 text-white/70">Você ainda não tem registos.</p>
                        <p className="text-sm text-white/50 font-light">Comece uma prática no Diário.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- TELA DE CONFIGURAÇÕES ATUALIZADA ---
const SettingsScreen = ({ setActiveScreen }) => {
    const { user, userName, photoURL, setPhotoURL, fetchUserData } = useContext(AppContext);
    const [newName, setNewName] = useState(userName);
    const [nameMessage, setNameMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
    const [reauthPassword, setReauthPassword] = useState('');
    const [reauthError, setReauthError] = useState('');
    const fileInputRef = useRef(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        if (newName === userName || !newName.trim() || !user || !db) return;
        setIsSubmitting(true);
        setNameMessage({ type: '', text: '' });
        try {
            const userRef = doc(db, `users/${user.uid}`);
            await updateDoc(userRef, { name: newName });
            await fetchUserData(user.uid);
            setNameMessage({ type: 'success', text: 'Nome atualizado!' });
        } catch (error) {
            setNameMessage({ type: 'error', text: 'Erro ao atualizar o nome.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNameMessage({ type: '', text: '' }), 3000);
        }
    };

    const handlePhotoUpload = async (e) => { const file = e.target.files[0]; if (!file || !user || !storage || !db) return; setIsUploadingPhoto(true); try { const storageRef = ref(storage, `profilePictures/${user.uid}`); await uploadBytes(storageRef, file); const url = await getDownloadURL(storageRef); await updateProfile(user, { photoURL: url }); const userDocRef = doc(db, `users/${user.uid}`); await updateDoc(userDocRef, { photoURL: url }); setPhotoURL(url); } catch (error) { console.error("Photo Upload Error:", error); } finally { setIsUploadingPhoto(false); } };
    
    const handlePasswordReset = async () => { 
        if (!auth || !user) return; 
        setIsSubmitting(true); 
        try { 
            auth.languageCode = 'pt-BR'; 
            await sendPasswordResetEmail(auth, user.email); 
            setPasswordMessage({ type: 'success', text: `E-mail de redefinição enviado.` }); 
        } catch (error) { 
            setPasswordMessage({ type: 'error', text: 'Erro ao enviar e-mail.' }); 
        } finally { 
            setIsSubmitting(false); 
            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000); 
        } 
    };

    const handleDeleteAccount = async () => { setIsDeleteModalOpen(false); if (!auth.currentUser) return; try { await deleteUser(auth.currentUser); } catch (error) { if (error.code === 'auth/requires-recent-login') { setIsReauthModalOpen(true); } } };
    const handleReauthenticateAndDelete = async (e) => { e.preventDefault(); const currentUser = auth.currentUser; if (!currentUser || !reauthPassword) return; setIsSubmitting(true); setReauthError(''); try { const credential = EmailAuthProvider.credential(currentUser.email, reauthPassword); await reauthenticateWithCredential(currentUser, credential); await deleteUser(currentUser); setIsReauthModalOpen(false); } catch (error) { setReauthError('Senha incorreta ou falha na reautenticação.'); } finally { setIsSubmitting(false); } };
    
    return (
        <>
            <div className="page-container">
                <PageTitle subtitle="Personalize seu perfil, gerencie sua conta e entre em contato conosco.">Configurações</PageTitle>
                <div className="glass-card space-y-8">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <img src={photoURL || `https://ui-avatars.com/api/?name=${userName || '?'}&background=2c0b4d&color=f3e5f5&bold=false`} alt="Perfil" className="w-20 h-20 rounded-full object-cover border-2 border-white/20" />
                            {isUploadingPhoto && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin"></div></div>)}
                            <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-[#FFD54F] text-[#3A1B57] p-1.5 rounded-full" disabled={isUploadingPhoto}><Camera size={16} /></button>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                        </div>
                        <div>
                            <h2 className="text-white text-xl">{userName}</h2>
                            <p className="text-sm text-white/60 font-light">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleNameUpdate} className="space-y-3">
                        <label className="text-sm text-white/80 font-light">Nome de Usuário</label>
                        <div className="flex gap-2">
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input-field flex-1" />
                            <button type="submit" className="btn-secondary" disabled={isSubmitting || newName === userName}>Salvar</button>
                        </div>
                        {nameMessage.text && <p className={`mt-3 p-3 rounded-lg text-center text-sm ${nameMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>{nameMessage.text}</p>}
                    </form>

                    <div className="space-y-3">
                        <label className="text-sm text-white/80 font-light">Assinatura</label>
                        <button onClick={() => setIsSubscriptionModalOpen(true)} className="w-full btn-secondary text-left flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles /> <span>Premium</span>
                            </div>
                            <ChevronLeft className="transform rotate-180" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-white/80 font-light">Segurança</label>
                        <button onClick={handlePasswordReset} className="w-full btn-secondary text-left flex items-center gap-3" disabled={isSubmitting}>
                            <KeyRound />
                            <span>Alterar senha</span>
                        </button>
                        {passwordMessage.text && <p className={`mt-3 p-3 rounded-lg text-center text-sm ${passwordMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>{passwordMessage.text}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-white/80 font-light">Entre em contato</label>
                        <button onClick={() => window.open('mailto:contato.evoluo.ir@gmail.com?subject=Mantras%2B%20-%20Feedback')} className="btn-secondary w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare /> <span>Dar feedback</span>
                            </div>
                            <ChevronLeft className="transform rotate-180" />
                        </button>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <button onClick={() => signOut(auth)} className="w-full btn-secondary flex items-center justify-center gap-2"><LogOut className="h-5 w-5" /> Sair da Conta</button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="w-full btn-danger-outline flex items-center justify-center gap-2"><Trash2 className="h-5 w-5" /> Deletar Conta</button>
                    </div>
                </div>
            </div>
            
            <SubscriptionManagementModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteAccount} title="Deletar Conta" message="Tem certeza de que deseja deletar sua conta? Esta ação é permanente e não pode ser desfeita." />
            <ReauthModal isOpen={isReauthModalOpen} onClose={() => setIsReauthModalOpen(false)} onConfirm={handleReauthenticateAndDelete} password={reauthPassword} setPassword={setReauthPassword} isSubmitting={isSubmitting} title="Confirme sua identidade" message="Para sua segurança, por favor, insira sua senha novamente para deletar sua conta." errorMessage={reauthError} />
        </>
    );
};

// --- TELA DO ORÁCULO ---
const OracleScreen = ({ onPlayMantra, openPremiumModal }) => { const { isSubscribed } = useContext(AppContext); const [userInput, setUserInput] = useState(''); const [suggestedMantra, setSuggestedMantra] = useState(null); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(''); const handleSuggestMantra = async () => { if (!userInput) return; if (!isSubscribed) {
            if (freeQuestionUsed) {
                openPremiumModal();
                return;
            }
            // 1 pergunta grátis: permite enviar
        } setIsLoading(true); setSuggestedMantra(null); setError(''); try { const mantraListForPrompt = MANTRAS_DATA.map(m => `ID ${m.id}: ${m.nome} - ${m.finalidade}`).join('\n'); const prompt = `Um usuário está sentindo: "${userInput}". Baseado nisso, qual dos seguintes mantras é o mais adequado? Por favor, responda APENAS com o número do ID do melhor mantra. \n\nMantras:\n${mantraListForPrompt}`; let chatHistory = []; chatHistory.push({ role: "user", parts: [{ text: prompt }] }); const payload = { contents: chatHistory }; const apiKey = firebaseConfig.apiKey; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`; const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); } const result = await response.json(); if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) { const text = result.candidates[0].content.parts[0].text; const match = text?.match(/\d+/); if (match) { const mantraId = parseInt(match[0], 10); const foundMantra = MANTRAS_DATA.find(m => m.id === mantraId); if (foundMantra) { setSuggestedMantra(foundMantra); } else { setError("O oráculo não encontrou uma sugestão. Tente descrever seu sentimento de outra forma."); } } else { setError("Não foi possível interpretar a sugestão do oráculo. Tente novamente."); } } else { console.error("Unexpected API response structure:", result); setError("O oráculo está em silêncio no momento. Por favor, tente mais tarde."); } } catch (err) { console.error("Gemini Suggestion Error:", err); if (err.message.includes("403")) { setError("Erro de permissão (403). Verifique se a sua Chave de API está correta e se as restrições no Google Cloud estão configuradas."); } else if (err.message.includes("404")) { setError("Erro (404). O modelo de IA não foi encontrado. O nome pode estar incorreto."); } else { setError("Ocorreu um erro ao consultar o oráculo. Verifique sua conexão."); } } finally { setIsLoading(false); } }; return (<div className="page-container"><PageTitle subtitle="Não sabe qual mantra escolher? Descreva seu sentimento e deixe a sabedoria interior guiá-lo.">Oráculo dos Mantras</PageTitle><div className="w-full max-w-lg mx-auto space-y-6 glass-card"><textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="textarea-field" rows="4" placeholder="Descreva como você está se sentindo hoje..." />{isSubscribed ? (<button onClick={handleSuggestMantra} className="w-full modern-btn-primary h-14" disabled={isLoading}><BrainCircuit className="h-6 w-6" />{isLoading ? 'Consultando...' : 'Revelar o meu Mantra'}</button>) : (<PremiumButton onClick={openPremiumModal} className="h-14 !text-base !font-semibold">Revelar o meu Mantra</PremiumButton>)}{error && <p className="text-sm text-center text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}{suggestedMantra && (<div className="pt-4 border-t border-white/10"><p className="text-center text-white/70 mb-2 font-light">O oráculo sugere:</p><div className="bg-black/20 p-4 rounded-lg clickable cursor-pointer" onClick={() => onPlayMantra(suggestedMantra, 1, 'library')}><h3 className="text-lg text-[#FFD54F]" style={{ fontFamily: "var(--font-display)" }}>{suggestedMantra.nome}</h3><p className="italic text-white/90 my-2 font-light">"{suggestedMantra.texto}"</p></div></div>)}</div></div>); };
const FavoritesScreen = ({ onPlayMantra }) => { const { favorites } = useContext(AppContext); const favoriteMantras = MANTRAS_DATA.filter(mantra => favorites.includes(mantra.id)); return (<div className="page-container"><PageTitle subtitle="Acesse rapidamente os mantras que mais ressoam com você.">Meus Favoritos</PageTitle><div className="space-y-4">{favoriteMantras.length === 0 ? (<div className="glass-card text-center"><Heart className="mx-auto h-12 w-12 text-white/50" /><p className="mt-4 text-white/70">Clique no coração no player para adicionar um mantra aqui.</p></div>) : (favoriteMantras.map((mantra) => (<div key={mantra.id} className="glass-card clickable cursor-pointer" onClick={() => onPlayMantra(mantra, 1, 'library')}><h3 className="text-lg text-[#FFD54F]" style={{fontFamily: "var(--font-display)"}}>{mantra.nome}</h3><p className="italic text-white/80 my-2 font-light">"{mantra.texto}"</p></div>)))}</div></div>); };
const MantraPlayer = ({ currentMantra, onClose, onMantraChange, totalRepetitions = 1, audioType }) => {
    const { favorites, updateFavorites } = useContext(AppContext);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [areControlsVisible, setAreControlsVisible] = useState(true);
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const [showSpeedModal, setShowSpeedModal] = useState(false);
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [practiceTimer, setPracticeTimer] = useState({ endTime: null, duration: null });
    const [repetitionCount, setRepetitionCount] = useState(1);
    const audioRef = useRef(null);
    const hideControlsTimeoutRef = useRef(null);
    const repetitionCountRef = useRef(1);
    const practiceTimerRef = useRef(practiceTimer);

    useEffect(() => {
        practiceTimerRef.current = practiceTimer;
    }, [practiceTimer]);

    const isSpokenPractice = audioType === 'spoken';
    const isFavorite = favorites.includes(currentMantra.id);
    const audioSrc = audioType === 'spoken' ? currentMantra.spokenAudioSrc : currentMantra.libraryAudioSrc;
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const touchEndX = useRef(null);
    const touchEndY = useRef(null);
    const minSwipeDistance = 50;

    const handleTouchStart = (e) => { if (e.target.type === 'range') return; touchStartX.current = e.targetTouches[0].clientX; touchStartY.current = e.targetTouches[0].clientY; touchEndX.current = null; touchEndY.current = null; };
    const handleTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; touchEndY.current = e.targetTouches[0].clientY; };
    const handleTouchEnd = () => { if (!touchStartX.current || !touchEndX.current) return; const distanceX = touchStartX.current - touchEndX.current; const distanceY = touchStartY.current - touchEndY.current; if (Math.abs(distanceX) < Math.abs(distanceY)) return; const isLeftSwipe = distanceX > minSwipeDistance; const isRightSwipe = distanceX < -minSwipeDistance; const currentIndex = MANTRAS_DATA.findIndex(m => m.id === currentMantra.id); if (isLeftSwipe) { const nextIndex = (currentIndex + 1) % MANTRAS_DATA.length; onMantraChange(MANTRAS_DATA[nextIndex]); } else if (isRightSwipe) { const prevIndex = (currentIndex - 1 + MANTRAS_DATA.length) % MANTRAS_DATA.length; onMantraChange(MANTRAS_DATA[prevIndex]); } touchStartX.current = null; touchEndX.current = null; touchStartY.current = null; touchEndY.current = null; };
    const showControls = useCallback(() => { clearTimeout(hideControlsTimeoutRef.current); setAreControlsVisible(true); if (!isSpokenPractice && !isOptionsMenuOpen && !showSpeedModal && !showTimerModal) { hideControlsTimeoutRef.current = setTimeout(() => { setAreControlsVisible(false); }, 4000); } }, [isSpokenPractice, isOptionsMenuOpen, showSpeedModal, showTimerModal]);
    
    useEffect(() => { showControls(); return () => clearTimeout(hideControlsTimeoutRef.current); }, [showControls]);
    
    const toggleFavorite = useCallback(() => { const newFavorites = isFavorite ? favorites.filter(id => id !== currentMantra.id) : [...favorites, currentMantra.id]; updateFavorites(newFavorites); }, [isFavorite, favorites, currentMantra.id, updateFavorites]);
    const changePlaybackRate = useCallback((rate) => { if(audioRef.current) audioRef.current.playbackRate = rate; setPlaybackRate(rate); setShowSpeedModal(false); setIsOptionsMenuOpen(false); }, []);
    const handleSetPracticeDuration = useCallback((seconds) => { if (seconds > 0) { const endTime = Date.now() + seconds * 1000; setPracticeTimer({ endTime, duration: seconds }); } else { setPracticeTimer({ endTime: null, duration: null }); } setShowTimerModal(false); setIsOptionsMenuOpen(false); }, []);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setCurrentTime(0); setDuration(0); setIsPlaying(true); setRepetitionCount(1); repetitionCountRef.current = 1;
        
        const setAudioData = () => setDuration(audio.duration);
        const handleTimeUpdate = () => {
            const timer = practiceTimerRef.current;
            if (timer && timer.endTime && Date.now() >= timer.endTime) {
                audio.pause(); setIsPlaying(false); setPracticeTimer({ endTime: null, duration: null });
            } else {
                setCurrentTime(audio.currentTime);
            }
        };
        
        const handleAudioEnd = () => {
            const timer = practiceTimerRef.current;
            if (isSpokenPractice && repetitionCountRef.current < totalRepetitions) {
                repetitionCountRef.current += 1;
                setRepetitionCount(repetitionCountRef.current);
                audio.load(); // <<< CORREÇÃO APLICADA AQUI
                audio.play();
            } else if (timer && timer.endTime && Date.now() < timer.endTime) {
                audio.load(); // <<< CORREÇÃO APLICADA AQUI (para robustez)
                audio.play();
            } else {
                setIsPlaying(false);
                if (timer && timer.endTime) {
                    setPracticeTimer({ endTime: null, duration: null });
                }
                // ADICIONE ESTAS 2 LINHAS:
                clearTimeout(hideControlsTimeoutRef.current);
                setAreControlsVisible(true);
            }
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleAudioEnd);
        audio.play().catch(e => { console.error("Audio play failed:", e); setIsPlaying(false); });

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleAudioEnd);
        };
    }, [audioSrc, totalRepetitions, isSpokenPractice]);

    const togglePlayPause = useCallback(() => { if (isPlaying) { audioRef.current.pause(); } else { if (audioRef.current.currentTime >= audioRef.current.duration) { repetitionCountRef.current = 1; setRepetitionCount(1); audioRef.current.currentTime = 0; } audioRef.current.play(); } setIsPlaying(!isPlaying); showControls(); }, [isPlaying, showControls]);
    const formatTime = (time) => { if (isNaN(time) || time === 0) return '00:00'; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };
    const closeOptionsMenu = useCallback(() => setIsOptionsMenuOpen(false), []);
    const openOptionsMenu = useCallback(() => { setIsOptionsMenuOpen(true); showControls(); }, [showControls]);
    const closeSpeedModal = useCallback(() => setShowSpeedModal(false), []);
    const openSpeedModal = useCallback(() => setShowSpeedModal(true), []);
    const closeTimerModal = useCallback(() => setShowTimerModal(false), []);
    const openTimerModal = useCallback(() => setShowTimerModal(true), []);

    if (!currentMantra) return null;

    return (<div className="fixed inset-0 z-40 flex flex-col items-center justify-center screen-animation player-background-gradient" onClick={showControls} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}><MantraVisualizer mantra={currentMantra} isPlaying={isPlaying} /><div className={`absolute inset-0 z-10 flex flex-col h-full w-full p-6 text-white text-center justify-between transition-opacity duration-500 ${areControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}><div className="w-full flex justify-between items-start"><button onClick={openOptionsMenu} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg"><MoreHorizontal size={22} /></button><button onClick={onClose} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg"><X size={22} /></button></div><div className={`flex-grow flex flex-col items-center justify-center ${isSpokenPractice ? 'space-y-4' : 'space-y-8'} -mb-10`}><div style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}><h2 className="text-xl font-normal" style={{ fontFamily: "var(--font-display)" }}>{currentMantra.nome}</h2><p className="text-base font-light mt-2 text-white/80 max-w-md">"{currentMantra.texto}"</p>{isSpokenPractice && (<div className="mt-4 px-3 py-1 bg-black/30 rounded-full text-sm font-light flex items-center justify-center gap-2 max-w-min mx-auto"><Repeat size={14} /><span className="whitespace-nowrap">{repetitionCount} / {totalRepetitions}</span></div>)}</div><div className="w-full max-w-sm flex flex-col items-center gap-3"><div className="w-full"><input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = e.target.value; }} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs font-light text-white/70 mt-1"><span>{formatTime(currentTime)}</span><span>{practiceTimer.endTime ? `-${formatTime((practiceTimer.endTime - Date.now())/1000)}` : formatTime(duration)}</span></div></div><button onClick={togglePlayPause} className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-lg text-white flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all">{isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}</button></div></div><div /></div><audio ref={audioRef} src={audioSrc} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} /><OptionsMenu isOpen={isOptionsMenuOpen} onClose={closeOptionsMenu} isFavorite={isFavorite} onFavorite={toggleFavorite} onSpeed={openSpeedModal} onTimer={openTimerModal} />{showSpeedModal && <PlaybackSpeedModal currentRate={playbackRate} onSelectRate={changePlaybackRate} onClose={closeSpeedModal} />}{showTimerModal && <PracticeTimerModal activeTimer={practiceTimer} onSetTimer={handleSetPracticeDuration} onClose={closeTimerModal} />}</div>); };
const OptionsMenu = memo(({ isOpen, onClose, isFavorite, onFavorite, onSpeed, onTimer }) => { if (!isOpen) return null; const OptionButton = ({ icon: Icon, text, onClick, active = false }) => (<button onClick={onClick} className={`w-full flex items-center gap-4 text-left p-4 rounded-lg transition-colors ${active ? 'text-[#FFD54F]' : 'text-white'} hover:bg-white/10`}><Icon size={20} className={active ? 'text-[#FFD54F]' : 'text-white/70'} /><span className="font-light">{text}</span></button>); return (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}><div className="glass-modal w-full max-w-xs" onClick={e => e.stopPropagation()}><div className="space-y-1"><OptionButton icon={Heart} text="Favoritar" onClick={onFavorite} active={isFavorite} /><OptionButton icon={GaugeCircle} text="Velocidade" onClick={onSpeed} /><OptionButton icon={Clock} text="Definir Duração" onClick={onTimer} /></div></div></div>); });
const PlaybackSpeedModal = memo(({ currentRate, onSelectRate, onClose }) => { const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]; return (<div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}><div className="glass-modal w-full rounded-b-none" onClick={e => e.stopPropagation()}><h3 className="text-lg text-center mb-4 text-white">Velocidade de Reprodução</h3><ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">{speeds.map(speed => (<li key={speed} onClick={() => onSelectRate(speed)} className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${currentRate === speed ? 'bg-[#FFD54F] text-[#3A1B57]' : 'bg-white/5 text-white hover:bg-white/10'}`}><span className="font-light">{speed}x</span>{currentRate === speed && <CheckCircle />}</li>))}</ul></div></div>); });
const PracticeTimerModal = memo(({ activeTimer, onSetTimer, onClose }) => { const timers = [ { label: "5 Minutos", seconds: 300 }, { label: "15 Minutos", seconds: 900 }, { label: "30 Minutos", seconds: 1800 }, { label: "60 Minutos", seconds: 3600 }, ]; return (<div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}><div className="glass-modal w-full rounded-b-none" onClick={e => e.stopPropagation()}><h3 className="text-lg text-center mb-4 text-white">Definir Duração</h3><ul className="space-y-2">{activeTimer.duration && (<li onClick={() => onSetTimer(null)} className="p-4 bg-red-500/30 text-red-300 rounded-lg hover:bg-red-500/40 cursor-pointer text-center font-light">Cancelar Timer</li>)}{timers.map(timer => (<li key={timer.label} onClick={() => onSetTimer(timer.seconds)} className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${activeTimer.duration === timer.seconds ? 'bg-[#FFD54F] text-[#3A1B57]' : 'bg-white/5 text-white hover:bg-white/10'}`}><span className="font-light">{timer.label}</span>{activeTimer.duration === timer.seconds && <CheckCircle />}</li>))}</ul></div></div>); });
const MantraVisualizer = memo(({ mantra, isPlaying }) => { const { isSubscribed } = useContext(AppContext); const [images, setImages] = useState([mantra.imageSrc]); const [currentIndex, setCurrentIndex] = useState(0); const hasStartedGenerating = useRef(false); useEffect(() => { const generateImages = async () => { if (hasStartedGenerating.current || !mantra.imagePrompt || !isSubscribed) return; hasStartedGenerating.current = true; try { const payload = { instances: [{ prompt: mantra.imagePrompt }], parameters: { "sampleCount": 4 } }; const apiKey = firebaseConfig.apiKey; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`; const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(`API request failed`); const result = await response.json(); if (result.predictions && result.predictions.length > 0) { const newImageUrls = result.predictions.map(pred => `data:image/png;base64,${pred.bytesBase64Encoded}`); setImages(prev => [...prev, ...newImageUrls]); } } catch (error) { console.error("Slideshow Image Generation Error:", error); } finally { hasStartedGenerating.current = false; } }; if (isPlaying) { generateImages(); } }, [isPlaying, mantra.imagePrompt, isSubscribed]); useEffect(() => { let interval; if (isPlaying && images.length > 1) { interval = setInterval(() => { setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); }, 8000); } return () => clearInterval(interval); }, [isPlaying, images]); return (<div className="absolute inset-0 w-full h-full overflow-hidden"><div className={`absolute inset-0 w-full h-full transition-transform duration-[20000ms] ease-linear ${isPlaying ? 'animate-ken-burns-outer' : ''}`}>{images.map((src, index) => (<div key={index} className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out" style={{ backgroundImage: `url(${src})`, opacity: index === currentIndex ? 0.35 : 0, }} />))}</div><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div><style>{` @keyframes ken-burns-outer { 0% { transform: scale(1) translate(0, 0); } 50% { transform: scale(1.15) translate(2%, -2%); } 100% { transform: scale(1) translate(0, 0); } } .animate-ken-burns-outer { animation: ken-burns-outer 20s ease-in-out infinite; } `}</style></div>); });
const CalendarModal = ({ isOpen, onClose, onDayClick }) => { const { allEntries } = useContext(AppContext); const [currentDate, setCurrentDate] = useState(new Date()); const practicedDays = useMemo(() => new Set((allEntries || []).filter(e => e.practicedAt?.toDate).map(entry => entry.practicedAt.toDate().toDateString())), [allEntries]); if (!isOpen) return null; const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]; const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"]; const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); const changeMonth = (offset) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)); return (<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}><div className="glass-modal w-full max-w-md" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10"><ChevronLeft/></button><h2 className="text-xl text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10"><ChevronLeft className="transform rotate-180"/></button></div><div className="grid grid-cols-7 gap-2 text-center text-sm text-white/60">{daysOfWeek.map((day, index) => <div key={index}>{day}</div>)}</div><div className="grid grid-cols-7 gap-2 mt-2 text-center">{Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}{Array.from({ length: daysInMonth }).map((_, day) => { const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1); const isPracticed = practicedDays.has(date.toDateString()); const isToday = date.toDateString() === new Date().toDateString(); const buttonClasses = `w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm hover:bg-white/20 ${ isToday && isPracticed ? 'bg-yellow-400/20 ring-2 ring-[#FFD54F]' : isToday ? 'ring-2 ring-[#FFD54F] bg-white/10' : isPracticed ? 'bg-white/10 border-2 border-[#FFD54F]' : 'bg-white/10' }`; return (<button key={day} onClick={() => onDayClick(date)} className={buttonClasses}>{isToday ? <Flame className="text-yellow-400" size={16} /> : day + 1}</button>); })}</div></div></div>); };
const DayDetailModal = ({ isOpen, onClose, date, onAddNote }) => { const { allEntries } = useContext(AppContext); if (!isOpen) return null; const entriesForDay = (allEntries || []).filter(entry => entry.practicedAt?.toDate().toDateString() === date.toDateString()); return (<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}><div className="glass-modal w-full max-w-md" onClick={e => e.stopPropagation()}><h2 className="text-xl text-white">Atividades de {date.toLocaleDateString('pt-BR')}</h2><div className="max-h-48 overflow-y-auto space-y-3 pr-2 mt-4">{entriesForDay.length > 0 ? entriesForDay.map(entry => { const mantra = entry.type === 'mantra' ? MANTRAS_DATA.find(m => m.id === entry.mantraId) : null; return (<div key={entry.id} className="bg-black/20 p-3 rounded-lg text-sm">{mantra ? (<p className="font-light"><span className="text-[#FFD54F] font-normal">{mantra.nome}:</span> {entry.feelings}</p>) : (<p className="font-light"><span className="text-[#FFD54F] font-normal">Anotação:</span> {entry.note}</p>)}</div>) }) : <p className="text-white/70 text-sm font-light">Nenhuma prática registrada para este dia.</p>}</div><div className="pt-4 border-t border-white/10 mt-4"><button onClick={onAddNote} className="w-full btn-secondary">Adicionar Anotação</button></div></div></div>); };
const NoteEditorScreen = ({ onSave, onCancel, noteToEdit, dateForNewNote }) => { const { userId, fetchAllEntries, recalculateAndSetStreak } = useContext(AppContext); const [note, setNote] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [status, setStatus] = useState({ type: '', message: '' }); useEffect(() => { setNote(noteToEdit ? noteToEdit.note : ''); }, [noteToEdit]); const handleSave = async (e) => { e.preventDefault(); if (!note.trim() || !userId) return; setIsSubmitting(true); setStatus({ type: '', message: '' }); try { if (noteToEdit) { const noteRef = doc(db, `users/${userId}/entries`, noteToEdit.id); await updateDoc(noteRef, { note: note.trim() }); setStatus({ type: 'success', message: 'Anotação atualizada!' }); } else { const noteData = { type: 'note', note: note.trim(), practicedAt: Timestamp.fromDate(dateForNewNote) }; await addDoc(collection(db, `users/${userId}/entries`), noteData); setStatus({ type: 'success', message: 'Anotação salva!' }); } const updatedEntries = await fetchAllEntries(userId); await recalculateAndAndSetStreak(updatedEntries, userId); setNote(''); setTimeout(() => onSave(), 1500); } catch (error) { console.error("Error saving note:", error); setStatus({ type: 'error', message: 'Erro ao salvar anotação.' }); } finally { setIsSubmitting(false); } }; return (<div className="page-container"><PageTitle subtitle="Um espaço para registrar seus pensamentos, sentimentos e sincronicidades do dia.">{noteToEdit ? 'Editar Anotação' : 'Nova Anotação'}</PageTitle><form onSubmit={handleSave} className="w-full max-w-lg mx-auto glass-card space-y-8"><div className="space-y-3"><label className="text-white/80 flex items-center gap-2 font-light"><BookOpen size={18} className="text-[#FFD54F]/80" /><span>Sua anotação para {noteToEdit ? noteToEdit.practicedAt.toDate().toLocaleDateString('pt-BR') : dateForNewNote.toLocaleDateString('pt-BR')}</span></label><textarea value={note} onChange={e => setNote(e.target.value)} className="textarea-field" rows="8" placeholder="Escreva seus pensamentos, sentimentos ou insights do dia..." required /></div><div className="flex flex-col gap-4 pt-6 border-t border-white/10"><div className="flex gap-4"><button type="button" onClick={onCancel} className="w-full btn-secondary">Cancelar</button><button type="submit" className="w-full modern-btn-primary h-14" disabled={isSubmitting || !note.trim()}>{isSubmitting ? 'Salvando...' : 'Salvar Anotação'}</button></div>{status.message && <p className={`p-3 rounded-lg text-center text-sm ${status.type === 'success' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-400'}`}>{status.message}</p>}</div></form></div>); };
const RepetitionModal = ({ isOpen, onClose, onStart, mantra }) => { if (!isOpen) return null; const repetitionOptions = [12, 24, 36, 48, 108]; return (<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}><div className="glass-modal w-full max-w-sm" onClick={e => e.stopPropagation()}><h2 className="text-xl text-white text-center" style={{fontFamily: "var(--font-display)"}}>{mantra.nome}</h2><p className="text-white/70 my-4 text-center font-light">Quantas vezes você gostaria de repetir este mantra?</p><div className="space-y-3">{repetitionOptions.map(reps => (<button key={reps} onClick={() => onStart(reps)} className="w-full btn-secondary">{reps} repetições</button>))}</div><div className="text-center mt-4"><button onClick={onClose} className="text-sm text-white/60 hover:underline">Cancelar</button></div></div></div>); };

// --- INÍCIO: NOVOS COMPONENTES E TELAS PARA "MEU SANTUÁRIO" ---
const MeuSantuarioScreen = ({ onStartPlaylist, onEditPlaylist, onStartAudio, onAddAudio, onAddPlaylist, openPremiumModal }) => {
    const { isSubscribed, meusAudios, playlists } = useContext(AppContext);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { userId, fetchMeusAudios, fetchPlaylists } = useContext(AppContext);
    const handleDelete = async () => {
        if (!itemToDelete || !userId) return;
        const { type, item } = itemToDelete;
        
        try {
            if (type === 'audio') {
                await deleteDoc(doc(db, `users/${userId}/meusAudios`, item.id));
                if (item.storagePath) {
                    const storageRef = ref(storage, item.storagePath);
                    await deleteObject(storageRef);
                }
                const playlistsRef = collection(db, `users/${userId}/playlists`);
                const playlistsSnapshot = await getDocs(playlistsRef);
                const updatePromises = [];
                playlistsSnapshot.forEach(playlistDoc => {
                    const playlistData = playlistDoc.data();
                    const oldSequencia = playlistData.sequencia || [];
                    if (oldSequencia.some(track => track.audioId === item.id)) {
                        const newSequencia = oldSequencia.filter(track => track.audioId !== item.id);
                        const playlistDocRef = doc(db, `users/${userId}/playlists`, playlistDoc.id);
                        updatePromises.push(updateDoc(playlistDocRef, { sequencia: newSequencia }));
                    }
                });
                await Promise.all(updatePromises);
                await fetchMeusAudios(userId);
                await fetchPlaylists(userId); 
            } else if (type === 'playlist') {
                await deleteDoc(doc(db, `users/${userId}/playlists`, item.id));
                await fetchPlaylists(userId);
            }
        } catch (error) {
            console.error(`Erro ao deletar ${type}:`, error);
        } finally {
            setItemToDelete(null);
        }
    };
    
    const handleStartPlaylist = (playlist) => {
        const hydratedSequencia = playlist.sequencia
            .map(item => {
                const audio = meusAudios.find(a => a.id === item.audioId);
                return audio ? { audio, repeticoes: item.repeticoes } : null;
            })
            .filter(Boolean);

        if (hydratedSequencia.length > 0) {
            onStartPlaylist({ ...playlist, sequencia: hydratedSequencia });
        } else {
            console.error("Playlist está vazia ou os áudios não foram encontrados.");
        }
    };

    const handleAddAudioClick = () => {
        if (!isSubscribed && meusAudios.length >= 2) {
            openPremiumModal();
        } else {
            onAddAudio();
        }
    };

    const handleAddPlaylistClick = () => {
        if (!isSubscribed && playlists.length >= 1) {
            openPremiumModal();
        } else {
            onAddPlaylist();
        }
    };

    return (
        <>
            <div className="page-container">
                <PageTitle subtitle="Seu espaço sagrado para criar e praticar com seus próprios áudios e sequências.">Meu Santuário</PageTitle>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Meus Áudios</h2>
                        <button onClick={handleAddAudioClick} className="modern-btn-primary !p-2.5 rounded-full"><Plus size={20} /></button>
                    </div>
                    {meusAudios.length > 0 ? (
                        meusAudios.map(audio => (
                            <div key={audio.id} className="glass-card !p-4 flex justify-between items-center">
                                <p className="text-white/90">{audio.nome}</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onStartAudio(audio)} className="p-2 rounded-full hover:bg-white/10 transition-colors"><Play size={18} /></button>
                                    <button onClick={() => setItemToDelete({ type: 'audio', item: audio })} className="p-2 rounded-full hover:bg-white/10 transition-colors text-red-400"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card text-center !py-8">
                            <Mic2 className="mx-auto h-10 w-10 text-white/50" />
                            <p className="mt-3 text-white/70">Nenhum áudio gravado ou importado.</p>
                            <p className="text-sm text-white/50 font-light">Clique no '+' para adicionar seu primeiro áudio.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Minhas Playlists</h2>
                        <button onClick={handleAddPlaylistClick} className="modern-btn-primary !p-2.5 rounded-full"><Plus size={20} /></button>
                    </div>
                    {playlists.length > 0 ? (
                         playlists.map(playlist => (
                            <div key={playlist.id} className="glass-card !p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-white/90">{playlist.nome}</p>
                                    <p className="text-xs text-white/60 font-light">{playlist.sequencia?.length || 0} áudio(s)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleStartPlaylist(playlist)} className="p-2 rounded-full hover:bg-white/10 transition-colors"><Play size={18} /></button>
                                    <button onClick={() => onEditPlaylist(playlist)} className="p-2 rounded-full hover:bg-white/10 transition-colors"><Edit3 size={18} /></button>
                                    <button onClick={() => setItemToDelete({ type: 'playlist', item: playlist })} className="p-2 rounded-full hover:bg-white/10 transition-colors text-red-400"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card text-center !py-8">
                            <Music className="mx-auto h-10 w-10 text-white/50" />
                            <p className="mt-3 text-white/70">Nenhuma playlist criada.</p>
                            <p className="text-sm text-white/50 font-light">Crie sequências de prática personalizadas.</p>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal 
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title={`Excluir ${itemToDelete?.type === 'audio' ? 'Áudio' : 'Playlist'}`}
                message={`Tem certeza que deseja excluir "${itemToDelete?.item.nome}"? Esta ação não pode ser desfeita.`}
            />
        </>
    );
};
const AudioCreatorModal = ({ isOpen, onClose }) => {
    const { userId, fetchMeusAudios } = useContext(AppContext);
    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setNome('');
            setStatus('idle');
            setError('');
            setAudioBlob(null);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
            }
        }
    }, [isOpen, audioUrl]);

    const handleStartRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                const options = {};
                const supportedTypes = ['audio/mp4', 'audio/webm', 'audio/ogg'];
                const supportedType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type));

                if (supportedType) {
                    options.mimeType = supportedType;
                }

                mediaRecorderRef.current = new MediaRecorder(stream, options);
                audioChunksRef.current = [];
                
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
                    const url = URL.createObjectURL(blob);
                    setAudioBlob(blob);
                    setAudioUrl(url);
                    setStatus('recorded');
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setStatus('recording');
            } catch (err) {
                console.error("Erro ao acessar microfone:", err);
                setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
                setStatus('error');
            }
        } else {
            setError("Gravação não é suportada neste navegador.");
            setStatus('error');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            const url = URL.createObjectURL(file);
            setAudioBlob(file);
            setAudioUrl(url);
            if (!nome) setNome(file.name.replace(/\.[^/.]+$/, ""));
            setStatus('recorded');
        }
    };
    
    const handleReset = () => {
        setStatus('idle');
        setError('');
        setAudioBlob(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
    };

    const handleSave = async () => {
        if (!nome.trim() || !audioBlob || !userId) {
            setError("O nome e o áudio são obrigatórios.");
            return;
        }
        setStatus('saving');
        setError('');

        try {
            const fileExtension = audioBlob.type.split('/')[1].split(';')[0];
            const fileName = `${Date.now()}_${nome.replace(/\s+/g, '_')}.${fileExtension}`;
            const storagePath = `userAudios/${userId}/${fileName}`;
            const audioRef = ref(storage, storagePath);

            await uploadBytes(audioRef, audioBlob);
            const downloadURL = await getDownloadURL(audioRef);

            await addDoc(collection(db, `users/${userId}/meusAudios`), {
                nome: nome.trim(),
                storagePath: storagePath,
                downloadURL: downloadURL,
                createdAt: Timestamp.now(),
            });

            await fetchMeusAudios(userId);
            setStatus('success');
            setTimeout(onClose, 1500);

        } catch (err) {
            console.error("Erro ao salvar áudio:", err);
            setError("Falha ao salvar o áudio. Tente novamente.");
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-modal w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-white" style={{fontFamily: "var(--font-display)"}}>Adicionar Novo Áudio</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={20}/></button>
                </div>
                
                <div className="space-y-6">
                    <input 
                        type="text" 
                        placeholder="Nome do seu mantra ou áudio" 
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="input-field"
                    />

                    {status === 'idle' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={handleStartRecording} className="btn-secondary h-24 flex flex-col items-center justify-center gap-2">
                                <Mic2 />
                                <span>Gravar com Microfone</span>
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="btn-secondary h-24 flex flex-col items-center justify-center gap-2">
                                <UploadCloud />
                                <span>Importar do Dispositivo</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileImport} 
                                accept="audio/*,.mp3,.m4a,.wav,.ogg" 
                                className="hidden" 
                            />
                        </div>
                    )}

                    {status === 'recording' && (
                        <div className="text-center space-y-4">
                            <p className="text-white/80 animate-pulse">Gravando...</p>
                            <button onClick={handleStopRecording} className="modern-btn-primary !bg-red-500 !text-white">
                                <Pause /> Pausar Gravação
                            </button>
                        </div>
                    )}

                    {status === 'recorded' && (
                        <div className="space-y-4">
                            <audio src={audioUrl} controls className="w-full"></audio>
                            <div className="flex gap-4">
                                <button onClick={handleSave} className="w-full modern-btn-primary"><Save /> Salvar</button>
                                <button onClick={handleReset} className="w-full btn-secondary">Descartar</button>
                            </div>
                        </div>
                    )}
                    
                    {status === 'saving' && <p className="text-center text-white/80 animate-pulse">Salvando...</p>}
                    {status === 'success' && <p className="text-center text-green-400">Áudio salvo com sucesso!</p>}
                    {error && <p className="text-center text-red-400">{error}</p>}
                </div>
            </div>
        </div>
    );
};
const CustomRepetitionModal = ({ isOpen, onClose, onStart, audio }) => {
    const [repetitions, setRepetitions] = useState(1);
    if (!isOpen) return null;
    const handleStart = () => {
        const reps = parseInt(repetitions, 10);
        if (reps >= 1 && reps <= 108) {
            onStart(reps);
        }
    };
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-modal w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl text-white text-center" style={{fontFamily: "var(--font-display)"}}>{audio.nome}</h2>
                <p className="text-white/70 my-4 text-center font-light">Quantas vezes você gostaria de repetir este áudio?</p>
                <input 
                    type="number" 
                    value={repetitions}
                    onChange={e => setRepetitions(e.target.value)}
                    min="1"
                    max="108"
                    className="input-field text-center"
                />
                <div className="flex gap-4 mt-4">
                    <button onClick={onClose} className="w-full btn-secondary">Cancelar</button>
                    <button onClick={handleStart} className="w-full modern-btn-primary">Iniciar</button>
                </div>
            </div>
        </div>
    );
};
const CustomAudioPlayer = ({ playlist, singleAudio, repetitions, onClose }) => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [repetitionCount, setRepetitionCount] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    const isPlaylist = !!playlist;
    const currentTrack = isPlaylist ? playlist.sequencia[currentTrackIndex] : { audio: singleAudio, repeticoes: repetitions };
    const audioSrc = currentTrack?.audio?.downloadURL;

    const advanceTrack = useCallback(() => {
        if (isPlaylist && currentTrackIndex < playlist.sequencia.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        } else {
            onClose(); 
        }
    }, [isPlaylist, currentTrackIndex, playlist, onClose]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioSrc) return;
        setRepetitionCount(1);
        setCurrentTime(0);
        setDuration(0);
        audio.play().catch(e => {
            console.error("Erro ao iniciar a reprodução do áudio:", e);
            setIsPlaying(false);
        });
    }, [audioSrc]); 

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleAudioEnd = () => {
            if (repetitionCount < currentTrack.repeticoes) {
                setRepetitionCount(prev => prev + 1);
                audio.load(); // <<< CORREÇÃO APLICADA AQUI
                audio.play();
            } else {
                advanceTrack();
            }
        };

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration);

        audio.addEventListener('ended', handleAudioEnd);
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', setAudioDuration);

        return () => {
            audio.removeEventListener('ended', handleAudioEnd);
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', setAudioDuration);
        };
    }, [repetitionCount, currentTrack.repeticoes, advanceTrack]); 

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (isNaN(time) || time === 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (!audioSrc) return null;

    return (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center screen-animation p-6 player-background-gradient">
            <div className="absolute top-6 right-6">
                <button onClick={onClose} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg"><X size={22} /></button>
            </div>
            <div className="text-center text-white space-y-4 w-full max-w-md">
                {isPlaylist && <p className="text-sm text-white/70">{playlist.nome}</p>}
                <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>{currentTrack.audio.nome}</h2>
                <div className="mt-4 px-3 py-1 bg-black/30 rounded-full text-sm font-light flex items-center justify-center gap-2 max-w-min mx-auto">
                    <Repeat size={14} />
                    <span className="whitespace-nowrap">{repetitionCount} / {currentTrack.repeticoes}</span>
                </div>
                {isPlaylist && <p className="text-xs text-white/60">Faixa {currentTrackIndex + 1} de {playlist.sequencia.length}</p>}
            </div>
            <div className="w-full max-w-sm flex flex-col items-center gap-3 mt-8">
                <div className="w-full">
                    <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = e.target.value; }} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs font-light text-white/70 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <button onClick={togglePlayPause} className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-lg text-white flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
            </div>
            <audio 
                ref={audioRef} 
                src={audioSrc}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)} 
            />
        </div>
    );
};
const ChakraScreen = () => {
    const [selectedChakra, setSelectedChakra] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const backgroundAudioRef = useRef(null);
    const mantraAudioRef = useRef(null);
    const chakraPositions = { 1: '17%', 2: '27%', 3: '37%', 4: '47%', 5: '57%', 6: '67%', 7: '77%' };
    useEffect(() => {
        if (!backgroundAudioRef.current) {
            backgroundAudioRef.current = new Audio('https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/som-fundo.mp3');
            backgroundAudioRef.current.loop = true;
            backgroundAudioRef.current.volume = 0.5;
        }
        backgroundAudioRef.current.play().catch(e => console.error("Erro ao tocar música de fundo:", e));
        return () => {
            backgroundAudioRef.current.pause();
        };
    }, []);
    const handleSelectChakra = (chakra) => {
        setSelectedChakra(chakra);
        setIsPlaying(true);
    };
    const togglePlayPause = () => {
        setIsPlaying(prev => !prev);
    };
    useEffect(() => {
        if (!mantraAudioRef.current) {
            mantraAudioRef.current = new Audio();
            mantraAudioRef.current.loop = true;
        }
        if (isPlaying && selectedChakra) {
            if (mantraAudioRef.current.src !== selectedChakra.audioSrc) {
                mantraAudioRef.current.pause();
                mantraAudioRef.current.src = selectedChakra.audioSrc;
                mantraAudioRef.current.load();
            }
            backgroundAudioRef.current.pause();
            mantraAudioRef.current.play().catch(e => console.error("Erro ao tocar áudio do chakra:", e));
        } else {
            mantraAudioRef.current.pause();
            backgroundAudioRef.current.play().catch(e => console.error("Erro ao retomar som de fundo:", e));
        }
        return () => {
            mantraAudioRef.current.pause();
        };
    }, [isPlaying, selectedChakra]);
    const orderedChakras = [...CHAKRAS_DATA].reverse();
    return (
        <div className="page-container" style={{backgroundColor: selectedChakra?.color ? `${selectedChakra.color}20` : 'transparent', transition: 'background-color 1s ease'}}>
            <PageTitle subtitle="Conecte-se e equilibre seus centros de energia através da meditação sonora.">Meditação de Chakras</PageTitle>
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="flex w-full items-center justify-center space-x-4 md:space-x-8">
                    <div className="relative w-full max-w-[150px] md:max-w-[200px] h-96 flex items-center justify-center flex-shrink-0">
                        <img 
                            src="https://i.postimg.cc/fkQNDZH4/mente.png" 
                            alt="Figura humana com chakras" 
                            className="h-full object-contain"
                        />
                        {CHAKRAS_DATA.map(chakra => (
                            <div
                                key={chakra.id}
                                style={{
                                    bottom: chakraPositions[chakra.id],
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    backgroundColor: chakra.color,
                                    filter: selectedChakra?.id === chakra.id ? `drop-shadow(0 0 8px ${chakra.color})` : 'none',
                                    zIndex: 10 - chakra.id,
                                    marginLeft: '-0.7rem'
                                }}
                                className={`absolute left-[50%] w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-500 ${
                                    selectedChakra?.id === chakra.id ? 'chakra-pulse-effect' : ''
                                }`}
                                onClick={() => handleSelectChakra(chakra)}
                            ></div>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-2 p-2 w-full max-w-[150px] flex-shrink-0" style={{ height: '384px' }}>
                        {orderedChakras.map(chakra => (
                            <div 
                                key={chakra.id}
                                onClick={() => handleSelectChakra(chakra)}
                                className={`glass-card !p-3 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-transform duration-300 ${
                                    selectedChakra?.id === chakra.id ? 'bg-white/10 scale-105' : 'bg-white/5 hover:scale-[1.02]'
                                }`}
                                style={{
                                    flex: '1 1 auto',
                                    borderColor: selectedChakra?.id === chakra.id ? chakra.color : 'rgba(255, 255, 255, 0.08)',
                                    boxShadow: selectedChakra?.id === chakra.id ? `0 0 10px ${chakra.color}` : 'none',
                                    borderWidth: '2px',
                                }}
                            >
                                <p className="text-sm font-light text-white/90 text-center">{chakra.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {selectedChakra && (
                    <div className="glass-card w-full max-w-md text-center space-y-4 mt-8">
                        <h3 className="text-xl text-white" style={{fontFamily: 'var(--font-display)'}}>{selectedChakra.name}</h3>
                        <div className="flex justify-center items-center gap-4">
                            <PlayCircle size={64} style={{color: selectedChakra.color}}/>
                            <div>
                                <p className="text-white/80 text-sm font-light">Mantra: <span className="font-medium">{selectedChakra.mantra}</span></p>
                                <p className="text-white/80 text-sm font-light">Mudra: <span className="font-medium">{selectedChakra.mudra}</span></p>
                            </div>
                        </div>
                        <button onClick={togglePlayPause} className="w-full modern-btn-primary !py-2 !px-4 !text-sm flex items-center justify-center">
                            {isPlaying ? <><Pause size={20} /> Pausar Meditação</> : <><Play size={20} /> Iniciar Meditação</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- TELA DO ASTROLOGER ATUALIZADA COM LÓGICA DE PERGUNTA GRÁTIS ---
const AstrologerScreen = ({ openPremiumModal }) => {
    const { isSubscribed, userId, astroProfile, setAstroProfile, astroHistory, fetchAstroHistory, freeQuestionUsed, setFreeQuestionUsed } = useContext(AppContext);
    const [question, setQuestion] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(!astroProfile);
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const initializedFromCtx = useRef(false);
    useEffect(() => {
        if (initializedFromCtx.current) return;
        setIsEditingProfile(!astroProfile);
        initializedFromCtx.current = true;
    }, [astroProfile]);

    const handleAskQuestion = async () => {
        if (!question.trim()) {
            setStatusMessage('Por favor, digite sua pergunta.');
            return;
        }

        if (!astroProfile || !astroProfile.nomeCompleto || !astroProfile.cidadeNascimento || !astroProfile.dataNascimento || !astroProfile.horaNascimento) {
            setStatusMessage('Por favor, preencha todos os dados do seu mapa astral.');
            return;
        }

        setStatus('submitting');
        setStatusMessage('Salvando perfil e enviando pergunta...');

        try {
            // Salvar o perfil astral antes de enviar a pergunta
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { astroProfile });

            const askAstrologerCallable = httpsCallable(functions, 'askAstrologer');
            const result = await askAstrologerCallable({
                userId,
                question,
                astroProfile
            });

            if (result.data.success) {
                setStatus('idle');
                setStatusMessage('Sua pergunta foi enviada! O astrólogo está preparando a resposta.');
                setQuestion('');
                fetchAstroHistory(userId);
                
                // Se não for premium, marcar a pergunta grátis como usada
                if (!isSubscribed) {
                    try {
                        const userDocRef = doc(db, `users/${userId}`);
                        await updateDoc(userDocRef, { freeQuestionUsed: true });
                        setFreeQuestionUsed(true); // Atualiza o estado no app
                    } catch (e) {
                        console.error('Falha ao marcar a pergunta grátis como usada:', e);
                    }
                }
            } else {
                throw new Error(result.data.message || 'Erro ao obter resposta do backend.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setStatusMessage('Ocorreu um erro ao enviar a pergunta. Tente novamente mais tarde.');
        } finally {
            if (status !== 'sent') {
                 setTimeout(() => setStatusMessage(''), 5000);
            }
        }
    };

    const handleSave = async (id) => {
        try {
            await updateDoc(doc(db, `users/${userId}/astroHistory/${id}`), { saved: true });
        } catch (e) {
            console.error('save error', e);
        }
    };

    const handleDiscard = async (id) => {
        try {
            await deleteDoc(doc(db, `users/${userId}/astroHistory/${id}`));
        } catch (e) {
            console.error('discard error', e);
        }
    };

    const isFormComplete = astroProfile?.nomeCompleto && astroProfile?.cidadeNascimento && astroProfile?.dataNascimento && astroProfile?.horaNascimento;
    const canAsk = isSubscribed || !freeQuestionUsed;

    return (
        <div className="page-container">
            <PageTitle subtitle="Receba uma análise astrológica profunda e exclusiva, revisada por um especialista.">Pergunte ao Astrólogo</PageTitle>

            <div className="w-full max-w-lg mx-auto glass-card space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Seu Mapa Astral</h2>
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 rounded-full text-white/60 hover:bg-white/10"
                        disabled={isEditingProfile}
                    >
                        <Edit3 size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="text-sm text-white/80 font-light">Nome Completo</label>
                    <input type="text" value={astroProfile?.nomeCompleto || ''} onChange={(e) => setAstroProfile(prev => ({ ...(prev || {}), nomeCompleto: e.target.value }))} className="input-field" placeholder="Seu Nome Completo" readOnly={!isEditingProfile && isFormComplete} />
                    <label className="text-sm text-white/80 font-light">Cidade de Nascimento</label>
                    <input type="text" value={astroProfile?.cidadeNascimento || ''} onChange={(e) => setAstroProfile(prev => ({ ...(prev || {}), cidadeNascimento: e.target.value }))} className="input-field" placeholder="Cidade de Nascimento" readOnly={!isEditingProfile && isFormComplete} />
                    <label className="text-sm text-white/80 font-light">Data de Nascimento</label>
                    <input type="date" value={astroProfile?.dataNascimento || ''} onChange={(e) => setAstroProfile(prev => ({ ...(prev || {}), dataNascimento: e.target.value }))} className="input-field" readOnly={!isEditingProfile && isFormComplete} />
                    <label className="text-sm text-white/80 font-light">Hora de Nascimento</label>
                    <input type="time" value={astroProfile?.horaNascimento || ''} onChange={(e) => setAstroProfile(prev => ({ ...(prev || {}), horaNascimento: e.target.value }))} className="input-field" readOnly={!isEditingProfile && isFormComplete} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="textarea-field" rows="4" placeholder="Faça sua pergunta sobre sua missão de vida, carreira ou relacionamentos..." disabled={!isFormComplete} />
                    
                    {canAsk ? (
                        <button onClick={handleAskQuestion} className="w-full modern-btn-primary h-14" disabled={!isFormComplete || status === 'submitting'}>
                            {status === 'submitting' ? 'Enviando...' : 'Enviar Pergunta'}
                        </button>
                    ) : (
                        <button onClick={openPremiumModal} className="w-full modern-btn-primary h-14 !bg-white/10 !text-white/70 cursor-pointer">
                            <Lock className="h-5 w-5" />
                            <span>Assine para continuar</span>
                        </button>
                    )}

                    {!isSubscribed && !freeQuestionUsed && (
                        <p className="text-center text-sm text-green-400 font-light">🎁 Você tem direito a 1 pergunta grátis!</p>
                    )}
                    {!isSubscribed && freeQuestionUsed && (
                        <p className="text-center text-sm text-red-400 font-light">Sua pergunta grátis já foi usada. Assine para continuar.</p>
                    )}

                    {statusMessage && (
                        <p className={`p-3 rounded-lg text-center text-sm ${
                            status === 'error' ? 'text-red-400 bg-red-500/20' : 'text-yellow-400 bg-yellow-500/20'
                        }`}>{statusMessage}</p>
                    )}
                </div>
            </div>
            
            <div className="w-full max-w-lg mx-auto space-y-4 pt-8">
                <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Histórico de Perguntas</h2>
                {astroHistory.length > 0 ? (
                    astroHistory.map(item => (
                        <div key={item.id} className="glass-card !p-5">
                            <p className="text-sm text-white/70">
                                <span className="text-[#FFD54F]">Pergunta:</span>
                            </p>
                            <p className="mt-1 leading-relaxed text-base text-white/80">{item.question}</p>
                            {item.response ? (
                                <div className="mt-3">
                                    <p className="text-sm text-white/70">
                                        <span className="text-[#FFD54F]">Resposta:</span>
                                    </p>
                                    <p className="mt-1 leading-relaxed text-base text-white">{item.response}</p>
                                    <div className="flex gap-2 mt-4">
                                        {!item.saved && (
                                            <button
                                                onClick={() => handleSave(item.id)}
                                                className="btn-secondary !text-xs !py-1 !px-3"
                                            >
                                                <Save size={14} className="inline-block mr-1" /> Salvar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDiscard(item.id)}
                                            className="btn-danger-outline !text-xs !py-1 !px-3"
                                        >
                                            <Trash2 size={14} className="inline-block mr-1" /> Descartar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/60 italic mt-2">Aguardando resposta do astrólogo...</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="glass-card text-center !py-8">
                        <MessageCircleQuestion className="mx-auto h-10 w-10 text-white/50" />
                        <p className="mt-3 text-white/70">Você ainda não fez nenhuma pergunta.</p>
                        <p className="text-sm text-white/50 font-light">Seus diálogos aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- NOVA TELA "MAIS" PARA AGRUPAR ITENS DE NAVEGAÇÃO ---
const MoreScreen = ({ setActiveScreen }) => {
    const secondaryNavItems = [
        { id: 'chakras', icon: Circle, label: 'Meditação de Chakras' },
        { id: 'mantras', icon: Music, label: 'Músicas Mântricas' },
        { id: 'astrologer', icon: MessageCircleQuestion, label: 'Pergunte ao Astrólogo' },
        { id: 'history', icon: History, label: 'Histórico de Práticas' },
        { id: 'oracle', icon: BrainCircuit, label: 'Oráculo dos Mantras' }
    ];

    return (
        <div className="page-container">
            <PageTitle subtitle="Explore outras ferramentas para sua jornada.">Mais Opções</PageTitle>
            <div className="space-y-3">
                {secondaryNavItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveScreen(item.id)} 
                        className="w-full glass-card !p-5 text-left flex items-center gap-4 clickable"
                    >
                        <item.icon className="h-6 w-6 text-[#FFD54F]" />
                        <span className="text-white text-base">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (ATUALIZADO com navegação para Gratidão) ---
const AppContent = () => {
    const { isSubscribed } = useContext(AppContext);
    const [activeScreen, setActiveScreen] = useState('home');
    const [playerData, setPlayerData] = useState({ mantra: null, repetitions: 1, audioType: 'library' });
    const [repetitionModalData, setRepetitionModalData] = useState({ isOpen: false, mantra: null });
    const [entryToEdit, setEntryToEdit] = useState(null);
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const { userId, fetchAllEntries, recalculateAndSetStreak } = useContext(AppContext);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    
    // --- NOVOS ESTADOS PARA "MEU SANTUÁRIO" ---
    const [isAudioCreatorOpen, setIsAudioCreatorOpen] = useState(false);
    const [customAudioToPlay, setCustomAudioToPlay] = useState(null);
    const [isCustomRepModalOpen, setIsCustomRepModalOpen] = useState(false);
    const [playlistToPlay, setPlaylistToPlay] = useState(null);
    const [playlistToEdit, setPlaylistToEdit] = useState(null);

    useEffect(() => {
        // ReactGA.send({ hitType: "pageview", page: `/${activeScreen}` }); // Removido para compilar no ambiente do editor
        // console.log(`GA Pageview Enviado: /${activeScreen}`); // Removido para compilar no ambiente do editor
    }, [activeScreen]);

    const handlePlayMantra = (mantra, repetitions, audioType) => { setPlayerData({ mantra, repetitions, audioType }); setRepetitionModalData({ isOpen: false, mantra: null }); };
    const handleSelectSpokenMantra = (mantra) => { setRepetitionModalData({ isOpen: true, mantra: mantra }); };
    const handleSaveOrUpdate = () => { setEntryToEdit(null); setNoteToEdit(null); setActiveScreen('history'); };
    const handleDeleteEntry = async () => { if (!entryToDelete || !userId || !db) return; try { await deleteDoc(doc(db, `users/${userId}/entries`, entryToDelete.id)); const updatedEntries = await fetchAllEntries(userId); await recalculateAndSetStreak(updatedEntries, userId); setEntryToDelete(null); } catch (error) { console.error("Error deleting entry:", error); } };
    const handleDayClick = (day) => { setSelectedDate(day); setIsCalendarOpen(false); setIsDayDetailOpen(true); };
    const handleAddNoteForDate = () => { setNoteToEdit(null); setIsDayDetailOpen(false); setActiveScreen('noteEditor'); };
    const handleStartCustomAudio = (audio) => { setCustomAudioToPlay({ audio }); setIsCustomRepModalOpen(true); };
    const handleEditPlaylist = (playlist) => { setPlaylistToEdit(playlist); setActiveScreen('playlistEditor'); };
    const handleAddPlaylist = () => { setPlaylistToEdit({}); setActiveScreen('playlistEditor'); };
    const handleSavePlaylist = () => { setPlaylistToEdit(null); setActiveScreen('meuSantuario'); };
    
    const renderScreen = () => {
        if (entryToEdit && activeScreen !== 'diary') setEntryToEdit(null);
        if (noteToEdit && activeScreen !== 'noteEditor') setNoteToEdit(null);
        const openPremiumModal = () => setIsPremiumModalOpen(true);
        switch (activeScreen) {
            case 'home': return <HomeScreen setActiveScreen={setActiveScreen} openCalendar={() => setIsCalendarOpen(true)} openDayDetail={handleDayClick} />;
            case 'diary': return <DiaryScreen onSave={handleSaveOrUpdate} entryToEdit={entryToEdit} onCancelEdit={() => { setEntryToEdit(null); setActiveScreen('history'); }} openPremiumModal={openPremiumModal} />;
            case 'gratitude': return <GratitudeScreen onSave={() => setActiveScreen('history')} onCancel={() => setActiveScreen('home')} />;
            case 'noteEditor': return <NoteEditorScreen onSave={handleSaveOrUpdate} onCancel={() => { setNoteToEdit(null); setActiveScreen('history'); }} noteToEdit={noteToEdit} dateForNewNote={selectedDate} />;
            case 'mantras': return <MantrasScreen onPlayMantra={handlePlayMantra} openPremiumModal={openPremiumModal} />;
            case 'spokenMantras': return <SpokenMantrasScreen onSelectMantra={handleSelectSpokenMantra} openPremiumModal={openPremiumModal} />;
            case 'meuSantuario': return <MeuSantuarioScreen
                onStartPlaylist={setPlaylistToPlay}
                onEditPlaylist={handleEditPlaylist}
                onStartAudio={handleStartCustomAudio}
                onAddAudio={() => setIsAudioCreatorOpen(true)}
                onAddPlaylist={handleAddPlaylist}
                openPremiumModal={openPremiumModal}
            />;
            case 'playlistEditor': return <PlaylistEditorScreen
                playlistToEdit={playlistToEdit}
                onSave={handleSavePlaylist}
                onCancel={handleSavePlaylist}
            />;
            case 'history': return <HistoryScreen onEditMantra={(entry) => { setEntryToEdit(entry); setActiveScreen('diary'); }} onEditNote={(note) => { setNoteToEdit(note); setActiveScreen('noteEditor'); }} onDelete={(entry) => setEntryToDelete(entry)} />;
            case 'settings': return <SettingsScreen setActiveScreen={setActiveScreen} />;
            case 'oracle': return <OracleScreen onPlayMantra={handlePlayMantra} openPremiumModal={openPremiumModal} />;
            case 'favorites': return <FavoritesScreen onPlayMantra={handlePlayMantra} />;
            case 'chakras': return <ChakraScreen />;
            case 'astrologer': return <AstrologerScreen openPremiumModal={openPremiumModal} />;
            case 'more': return <MoreScreen setActiveScreen={setActiveScreen} />;
            default: return <HomeScreen setActiveScreen={setActiveScreen} openCalendar={() => setIsCalendarOpen(true)} openDayDetail={handleDayClick} />;
        }
    };
    
    const SparklesBackground = () => { const sparkles = Array.from({ length: 20 }); return (<div className="sparkles">{sparkles.map((_, i) => (<div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${5 + Math.random() * 10}s` }} />))}</div>); };

    return (
        <div className="modern-body premium-body">
            {/* Adiciona o componente do sistema solar aqui, fora da hierarquia de telas */}
            <SolarSystemBackground />
            
            <Header setActiveScreen={setActiveScreen} />
            <ScreenAnimator screenKey={activeScreen}>{renderScreen()}</ScreenAnimator>
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            {playerData.mantra && <MantraPlayer currentMantra={playerData.mantra} totalRepetitions={playerData.repetitions} audioType={playerData.audioType} onClose={() => setPlayerData({ mantra: null, repetitions: 1, audioType: 'library' })} onMantraChange={(newMantra) => setPlayerData(prev => ({ ...prev, mantra: newMantra }))} />}
            <RepetitionModal isOpen={repetitionModalData.isOpen} mantra={repetitionModalData.mantra} onClose={() => setRepetitionModalData({ isOpen: false, mantra: null })} onStart={(repetitions) => handlePlayMantra(repetitionModalData.mantra, repetitions, 'spoken')} />
            <ConfirmationModal isOpen={!!entryToDelete} onClose={() => setEntryToDelete(null)} onConfirm={handleDeleteEntry} title="Apagar Registro" message="Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita." />
            <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onDayClick={handleDayClick} />
            <DayDetailModal isOpen={isDayDetailOpen} onClose={() => setIsDayDetailOpen(false)} date={selectedDate} onAddNote={handleAddNoteForDate} />
            <PremiumLockModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
            
            {/* NOVOS Players e Modais para "Meu Santuário" */}
            <AudioCreatorModal isOpen={isAudioCreatorOpen} onClose={() => setIsAudioCreatorOpen(false)} />
            {customAudioToPlay?.audio && <CustomRepetitionModal 
                isOpen={isCustomRepModalOpen}
                onClose={() => setIsCustomRepModalOpen(false)}
                audio={customAudioToPlay.audio}
                onStart={(repetitions) => {
                    setCustomAudioToPlay(prev => ({ ...prev, repeticoes: repetitions }));
                    setIsCustomRepModalOpen(false);
                }}
            />}
            {customAudioToPlay?.repeticoes && <CustomAudioPlayer 
                singleAudio={customAudioToPlay.audio}
                repetitions={customAudioToPlay.repeticoes}
                onClose={() => setCustomAudioToPlay(null)}
            />}
            {playlistToPlay && <CustomAudioPlayer 
                playlist={playlistToPlay}
                onClose={() => setPlaylistToPlay(null)}
            />}
        </div>
    );
};
const PermissionErrorScreen = ({ type }) => (<div className="min-h-screen flex items-center justify-center p-4 modern-body"><div className="glass-card w-full max-w-lg text-center"><AlertTriangle className="mx-auto h-16 w-16 text-red-400" /><h2 className="text-xl text-white mt-4">Erro de Permissão do Firebase</h2><p className="text-white/70 mt-2">O aplicativo não conseguiu acessar seus dados devido a um problema de permissão com o Firebase {type}.</p><p className="text-white/70 mt-2">Para corrigir, acesse seu console do Firebase, vá até as Regras (Rules) do <strong>{type}</strong> e cole as regras adequadas para permitir a leitura/escrita autenticada.</p></div></div>);

// --- VERIFICADOR DE AUTENTICAÇÃO E RENDERIZAÇÃO PRINCIPAL (COM LÓGICA DE ONBOARDING) ---
function AppWithAuthCheck() {
    const { user, loading, permissionError, onboardingCompleted } = useContext(AppContext);
    const [isSplashVisible, setIsSplashVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsSplashVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (isSplashVisible || loading) return <SplashScreen />;
    if (permissionError) return <PermissionErrorScreen type={permissionError} />;
    
    // Roteamento principal
    if (!user) {
        return <AuthScreen />;
    }

    if (!onboardingCompleted) {
        return <OnboardingScreen />;
    }

    return <AppContent />;
}

export default function App() {
    return (
        <AppProvider>
            <GlobalStyles />
            <AppWithAuthCheck />
        </AppProvider>
    );
}

// GratitudeScreen e PlaylistEditorScreen precisam ser definidos se não estiverem
// no código original. Vou adicionar placeholders funcionais para eles.

const GratitudeScreen = ({ onSave, onCancel }) => {
  const [items, setItems] = useState(["", "", ""]);
  const { userId, fetchAllEntries } = useContext(AppContext);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gratefulFor = items.filter(item => item.trim() !== "");
    if (gratefulFor.length === 0 || !userId || !db) {
        setStatus({ type: 'error', message: 'Preencha pelo menos um campo.' });
        return;
    }

    try {
      await addDoc(collection(db, `users/${userId}/entries`), {
        type: 'gratitude',
        gratefulFor,
        practicedAt: Timestamp.now()
      });
      setStatus({ type: 'success', message: 'Gratidão registrada!' });
      await fetchAllEntries(userId);
      setTimeout(onSave, 1500);
    } catch (error) {
      console.error("Error saving gratitude entry:", error);
      setStatus({ type: 'error', message: 'Erro ao salvar.' });
    }
  };

  return (
    <div className="page-container">
      <PageTitle subtitle="Dedique um momento para reconhecer as bênçãos em sua vida.">Pote da Gratidão</PageTitle>
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto glass-card space-y-8">
        <div className="space-y-4">
          {[0, 1, 2].map(index => (
            <div key={index} className="flex items-center gap-3">
              <Heart size={20} className="text-[#FFD54F]/80 flex-shrink-0" />
              <input
                type="text"
                value={items[index]}
                onChange={e => handleItemChange(index, e.target.value)}
                className="input-field"
                placeholder={`Sou grato(a) por...`}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
            <div className="flex gap-4">
                <button type="button" onClick={onCancel} className="w-full btn-secondary">Cancelar</button>
                <button type="submit" className="w-full modern-btn-primary h-14">Salvar Gratidão</button>
            </div>
            {status.message && <p className={`p-3 rounded-lg text-center text-sm ${status.type === 'success' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-400'}`}>{status.message}</p>}
        </div>
      </form>
    </div>
  );
};


const PlaylistEditorScreen = ({ playlistToEdit, onSave, onCancel }) => {
    const { userId, meusAudios, fetchPlaylists } = useContext(AppContext);
    const [nome, setNome] = useState(playlistToEdit?.nome || '');
    const [sequencia, setSequencia] = useState(playlistToEdit?.sequencia || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleAddAudio = (audioId) => {
        if (!sequencia.some(item => item.audioId === audioId)) {
            setSequencia(prev => [...prev, { audioId, repeticoes: 1 }]);
        }
    };

    const handleRemoveAudio = (audioId) => {
        setSequencia(prev => prev.filter(item => item.audioId !== audioId));
    };

    const handleRepetitionsChange = (audioId, reps) => {
        const newReps = Math.max(1, parseInt(reps, 10) || 1);
        setSequencia(prev => prev.map(item => item.audioId === audioId ? { ...item, repeticoes: newReps } : item));
    };
    
    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const _sequencia = [...sequencia];
        const draggedItemContent = _sequencia.splice(dragItem.current, 1)[0];
        _sequencia.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setSequencia(_sequencia);
    };

    const handleSavePlaylist = async () => {
        if (!nome.trim() || !userId) return;
        setIsSubmitting(true);
        const playlistData = {
            nome: nome.trim(),
            sequencia: sequencia,
            updatedAt: Timestamp.now(),
        };

        try {
            if (playlistToEdit?.id) {
                const playlistRef = doc(db, `users/${userId}/playlists`, playlistToEdit.id);
                await updateDoc(playlistRef, playlistData);
            } else {
                playlistData.createdAt = Timestamp.now();
                await addDoc(collection(db, `users/${userId}/playlists`), playlistData);
            }
            await fetchPlaylists(userId);
            onSave();
        } catch (error) {
            console.error("Erro ao salvar playlist:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <PageTitle subtitle="Organize seus áudios em uma sequência de prática personalizada.">
                {playlistToEdit?.id ? 'Editar Playlist' : 'Nova Playlist'}
            </PageTitle>

            <div className="w-full max-w-lg mx-auto glass-card space-y-6">
                <input
                    type="text"
                    placeholder="Nome da Playlist"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="input-field"
                />

                <div className="space-y-3">
                    <h3 className="text-white/80">Sequência da Playlist</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {sequencia.map((item, index) => {
                            const audio = meusAudios.find(a => a.id === item.audioId);
                            if (!audio) return null;
                            return (
                                <div 
                                    key={item.audioId}
                                    className="bg-black/20 p-3 rounded-lg flex items-center justify-between"
                                    draggable
                                    onDragStart={() => (dragItem.current = index)}
                                    onDragEnter={() => (dragOverItem.current = index)}
                                    onDragEnd={handleDragSort}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <div className="flex items-center gap-2">
                                        <GripVertical size={18} className="cursor-grab text-white/50" />
                                        <span>{audio.nome}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.repeticoes}
                                            onChange={e => handleRepetitionsChange(item.audioId, e.target.value)}
                                            className="input-field !p-1 !w-16 text-center"
                                        />
                                        <button onClick={() => handleRemoveAudio(item.audioId)}><Trash2 size={18} className="text-red-400" /></button>
                                    </div>
                                </div>
                            );
                        })}
                         {sequencia.length === 0 && <p className="text-center text-sm text-white/60 p-4">Adicione áudios da sua biblioteca abaixo.</p>}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-white/80">Sua Biblioteca de Áudios</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {meusAudios.map(audio => (
                            !sequencia.some(s => s.audioId === audio.id) && (
                                <div key={audio.id} className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                                    <span>{audio.nome}</span>
                                    <button onClick={() => handleAddAudio(audio.id)} className="p-1.5 rounded-full bg-green-500/80 text-white"><Plus size={16} /></button>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={onCancel} className="w-full btn-secondary">Cancelar</button>
                    <button onClick={handleSavePlaylist} disabled={isSubmitting || !nome.trim()} className="w-full modern-btn-primary">
                        {isSubmitting ? 'Salvando...' : 'Salvar Playlist'}
                    </button>
                </div>
            </div>
        </div>
    );
};
