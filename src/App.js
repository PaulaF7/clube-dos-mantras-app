import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  useMemo,
  memo,
} from "react";
import Confetti from 'react-confetti';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { initializeApp } from "firebase/app";
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
  reauthenticateWithPopup, // <-- ADICIONADO AQUI
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { getFirestore, collection, query, orderBy, onSnapshot, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, Timestamp, writeBatch, limit } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  Home,
  BookOpen,
  Star,
  History,
  Settings,
  Sparkles,
  LogOut,
  Trash2,
  Edit3,
  PlusCircle,
  CheckCircle,
  ChevronLeft,
  Play,
  Pause,
  X,
  BrainCircuit,
  Heart,
  GaugeCircle,
  Clock,
  MessageSquare,
  Camera,
  AlertTriangle,
  MoreHorizontal,
  ChevronDown,
  Repeat,
  Music,
  Mic2,
  Flame,
  Lock,
  UploadCloud,
  Save,
  Plus,
  Move,
  GripVertical,
  /* Lotus, */ Circle,
  PlayCircle,
  MessageCircleQuestion,
  HandCoins,
  Leaf,
  AlignJustify,
  KeyRound,
  Wind,
  TrendingUp,
  Map,
  Cookie,
  Coffee,
  CakeSlice,
} from "lucide-react";
// import ReactGA from 'react-ga4'; // Removido para compilar no ambiente do editor

// Adicione este novo componente no seu App.js
// Pode ser logo após as importações do Firebase ou do React,
// ou logo antes ou depois do AppProvider.
const CoffeeAndMuffinIcon = ({ className }) => {
  return (
    // A mágica está no style: width: 'auto' sobrepõe o w-6 da className
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        width: 'auto' 
      }}
    >
      {/* Agora podemos usar o tamanho total desejado para os ícones,
          pois o container irá expandir-se para os conter.
      */}
      <Coffee size={24} />
      <CakeSlice size={24} />
    </div>
  );
};

// --- INÍCIO: CONFIGURAÇÃO DO TESTE A/B PARA O PAYWALL ---
const paywallVariantA = {
  title: "Acesso Premium",
  subtitle:
    "Libere todo o potencial da sua jornada espiritual com a assinatura Mantras Mais.",
  features: [
    { icon: Music, text: "Acesso ilimitado a todas as Músicas Mântricas." },
    { icon: Mic2, text: "Prática com todos os Mantras Falados." },
    {
      icon: Map,
      text: "Siga Jornadas de Prática guiadas para atingir seus objetivos.",
    }, // <-- ADICIONADO AQUI
    {
      icon: Leaf,
      text: "Crie seu Santuário com áudios e playlists ilimitadas.",
    },
    {
      icon: MessageCircleQuestion,
      text: 'Receba insights exclusivos no "Pergunte ao Astrólogo".',
    },
    { icon: Circle, text: "Desbloqueie a Meditação de Chakras completa." },
    { icon: BrainCircuit, text: "Use o Oráculo dos Mantras sem limites." },
  ],
};

const paywallVariantB = {
  title: "Sua Transformação Começa Agora",
  subtitle:
    "Menos ansiedade, mais clareza e paz interior. A assinatura Mantras Mais é o seu guia diário para uma vida com mais propósito.",
  features: [
    {
      icon: Map,
      text: "Transforme sua Rotina: Cumpra jornadas diárias e sinta a evolução na sua paz interior e clareza mental.",
    }, // <-- ADICIONADO AQUI
    {
      icon: Wind,
      text: "Encontre sua Calma: Tenha sempre à mão a meditação ideal para silenciar a mente e aliviar o estresse.",
    },
    {
      icon: Sparkles,
      text: "Aprofunde sua Prática: Crie rituais poderosos com seu santuário de áudios e playlists personalizadas.",
    },
    {
      icon: TrendingUp,
      text: "Receba Orientação Divina: Entenda sua missão de vida com análises astrológicas exclusivas para você.",
    },
    {
      icon: Heart,
      text: "Equilibre suas Energias: Harmonize seus centros de força com a meditação guiada dos 7 Chakras.",
    },
    {
      icon: Star,
      text: "Manifeste seus Desejos: Descubra o mantra certo para cada momento com o Oráculo e realize seus sonhos.",
    },
  ],
};
// --- FIM: CONFIGURAÇÃO DO TESTE A/B ---

const PIX_TIERS = [
  {
    name: "Um Cookie",
    value: "R$ 7,90",
    icon: Cookie,
    pixCode:
      "00020126480014BR.GOV.BCB.PIX0126p.aulafernanda@outlook.com52040000530398654047.905802BR5924Paula Fernanda de Morais6009SAO PAULO62140510GrhMYbHhG963043EFA",
  },
  {
    name: "Um Chá Quente",
    value: "R$ 19,90",
    icon: Coffee,
    pixCode:
      "00020126480014BR.GOV.BCB.PIX0126p.aulafernanda@outlook.com520400005303986540519.905802BR5924Paula Fernanda de Morais6009SAO PAULO62140510Px58RkQAAf6304E161",
  },
  {
    name: 'Chá + Muffin', 
    value: 'R$ 49,90', 
    icon: CoffeeAndMuffinIcon, // <-- Use o seu novo componente aqui!
    pixCode:
      "00020126480014BR.GOV.BCB.PIX0126p.aulafernanda@outlook.com520400005303986540549.905802BR5924Paula Fernanda de Morais6009SAO PAULO62140510sgVRFXuAD26304328C",
  },
];

// --- SISTEMA SOLAR REACT ---
// Componente separado para o sistema solar
const SolarSystemBackground = memo(() => {
  // Estilos de animação e posicionamento
  const style = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5, // AJUSTE: Opacidade aumentada para maior visibilidade constante
  };
  // Otimização: Adiciona 'will-change' para garantir que a animação execute em sua própria camada de composição na GPU.
  style["willChange"] = "transform";

  const planetStyles = {
    sun: {
      width: "80px",
      height: "80px",
      backgroundColor: "#ffca28",
      borderRadius: "50%",
      boxShadow:
        "0 0 20px 5px rgba(255, 202, 40, 0.8), 0 0 40px 10px rgba(255, 202, 40, 0.5)",
    },
    mercury: {
      width: "6px",
      height: "6px",
      backgroundColor: "#b1b1b1",
      animation: "orbit-mercury 4s linear infinite",
    },
    venus: {
      width: "10px",
      height: "10px",
      backgroundColor: "#d1b19a",
      animation: "orbit-venus 8s linear infinite",
    },
    earth: {
      width: "12px",
      height: "12px",
      backgroundColor: "#4c6d86",
      animation: "orbit-earth 12s linear infinite",
    },
    mars: {
      width: "9px",
      height: "9px",
      backgroundColor: "#af4f44",
      animation: "orbit-mars 18s linear infinite",
    },
    jupiter: {
      width: "20px",
      height: "20px",
      backgroundColor: "#c79f72",
      animation: "orbit-jupiter 24s linear infinite",
    },
    saturn: {
      width: "18px",
      height: "18px",
      backgroundColor: "#c7b39a",
      animation: "orbit-saturn 30s linear infinite",
    },
    saturnRing: {
      width: "36px",
      height: "36px",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotateX(65deg)",
      borderRadius: "50%",
      border: "2px solid rgba(255, 255, 255, 0.35)",
      pointerEvents: "none",
      zIndex: 1,
    },
    uranus: {
      width: "15px",
      height: "15px",
      backgroundColor: "#a7d0d1",
      animation: "orbit-uranus 36s linear infinite",
    },
    neptune: {
      width: "15px",
      height: "15px",
      backgroundColor: "#55788d",
      animation: "orbit-neptune 42s linear infinite",
    },
    pluto: {
      width: "5px",
      height: "5px",
      backgroundColor: "#9d8d85",
      animation: "orbit-pluto 48s linear infinite",
    },
  };

  return (
    <div style={style}>
      <div
        className="solar-system-container"
        style={{
          position: "relative",
          perspective: "600px",
          transformStyle: "preserve-3d",
        }}
      >
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
        <div style={{ ...planetStyles.sun, position: "absolute" }}></div>

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
              style={{ transform: "translate(-50%, -50%) rotateX(65deg)" }}
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

    /* --- INÍCIO: MELHORIAS DE LAYOUT PARA MOBILE (iOS/Android) --- */
    /* Garante que o container principal ocupe a tela corretamente em todos os celulares */
    .modern-body { 
      height: 100vh; /* Fallback para navegadores mais antigos */
      height: 100dvh; /* Altura dinâmica da viewport, ideal para mobile */
    }
    /* Adapta o padding do container de página para respeitar as áreas seguras (notch, etc) */
    .page-container { 
      padding: 1.5rem; 
      padding-top: calc(8rem + env(safe-area-inset-top)); 
      padding-bottom: calc(8rem + env(safe-area-inset-bottom)); 
      max-width: 700px; 
      margin: 0 auto; 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      gap: 1.5rem; 
      position: relative; 
      z-index: 2; 
    }
    /* Estiliza as barras fixas (classes a serem aplicadas nos componentes Header e BottomNav) */
    .glass-nav { 
      padding-top: env(safe-area-inset-top);
    }
    .glass-bottom-nav { 
      padding-bottom: env(safe-area-inset-bottom);
    }
    /* --- FIM: MELHORIAS DE LAYOUT --- */

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
  background: rgba(255, 255, 255, 0.08); /* igual ao btn-secondary */
  backdrop-filter: blur(12px); /* menos blur para não “foscar” tanto */
  -webkit-backdrop-filter: blur(12px); 
  border-radius: 1.5rem; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1); 
  padding: 2rem; 
  transition: border-color 0.5s ease, box-shadow 0.5s ease;
  will-change: transform, opacity;
}

    .premium-card-glow { border-color: rgba(255, 213, 79, 0.3); animation: premium-glow 3s ease-in-out infinite; }
    @keyframes premium-glow { 0% { box-shadow: 0 0 8px rgba(255, 213, 79, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } 50% { box-shadow: 0 0 16px rgba(255, 213, 79, 0.4), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } 100% { box-shadow: 0 0 8px rgba(255, 213, 79, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.1); } }
    .glass-card.clickable:hover { transform: translateY(-5px); box-shadow: 0 12px 35px 0 rgba(0, 0, 0, 0.15); transition: transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out; }
    .glass-nav, .glass-bottom-nav { background: rgba(26, 9, 51, 0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-color: rgba(255, 255, 255, 0.08); }
    .glass-nav { border-bottom-width: 1px; } .glass-bottom-nav { border-top-width: 1px; }
    /* .page-container foi movido para o início para incorporar as melhorias */
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

// CÓDIGO NOVO (SUBSTITUA TODO O BLOCO DE ESTILOS DO TEMA SERENIDADE POR ESTE)
    /* --- INÍCIO: NOVO TEMA 'SERENIDADE' (BASEADO NO TEMA PADRÃO) --- */

    /* 1. Define os novos gradientes de fundo com a paleta de azul */
    .theme-serenity_theme.modern-body,
    .theme-serenity_theme.premium-body {
        background-size: 200% 200%;
        animation: gradient-animation 25s ease-in-out infinite;
        /* A cor do texto principal é herdada do .modern-body padrão */
    }

    .theme-serenity_theme.modern-body {
        background: linear-gradient(220deg, #0b1a33, #0b2c4d, #1b3a57);
    }
    
    .theme-serenity_theme.premium-body {
         background: linear-gradient(220deg, #0b2c4d, #144a8c, #1b3a57);
    }
    
    /* 2. Garante que o Sistema Solar, que era oculto no tema antigo, agora seja visível */
    .theme-serenity_theme .solar-system-container {
        display: flex;
    }

    /* 3. Altera a cor do texto dos botões primários para o novo tom de azul escuro */
    .theme-serenity_theme .modern-btn-primary {
        color: #0b2c4d; /* Substitui o roxo #2c0b4d */
    }

    /* 4. Ajusta a cor de texto do seletor de tema ativo (botão amarelo) nas Configurações */
    .theme-serenity_theme button.bg-\[\#FFD54F\] {
        color: #0b2c4d;
    }

    /* AVISO: Como removemos todas as regras do tema antigo que sobrescreviam
      o .glass-card, .input-field, etc., eles agora herdarão automaticamente
      os estilos do tema Padrão (com efeito de vidro), que é o comportamento desejado.
    */

    /* --- FIM: NOVO TEMA 'SERENIDADE' --- */

  `}</style>
));

// --- DADOS DOS MANTRAS ---
// SUBSTITUA TODA A SUA CONSTANTE 'MANTRAS_DATA' POR ESTA
const MANTRAS_DATA = [
  {
    id: 1,
    nome: "Afirmação da Paz",
    texto: "Eu sou, Eu sou, Eu sou a luz que emana paz",
    finalidade: "Acalma a mente e afasta pensamentos negativos.",
    repeticoes: 12,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Afirmac%CC%A7a%CC%83o%20da%20paz.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Eu%20sou%20a%20luz%20que%20emana%20paz%20fade.MP3",
    imageSrc: "https://i.postimg.cc/bNbZDBGR/paz.png",
    imagePrompt:
      "A serene and ethereal visual representation of inner peace. Abstract art, soft glowing light, calming energy, spiritual, high resolution, beautiful.",
  },
  {
    id: 2,
    nome: "Chama Violeta",
    texto: "Eu sou um ser de fogo violeta, eu sou a pureza que Deus deseja",
    finalidade: "Limpa culpas, libera o passado e eleva a vibração.",
    repeticoes: 36,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Chama%20Violeta.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/chama%20violeta%20fade.MP3",
    imageSrc: "https://i.postimg.cc/BvJ4vhDt/violet.png",
    imagePrompt:
      "An abstract representation of the violet flame of transmutation. Swirls of purple, magenta, and indigo light, cleansing energy, spiritual fire, high resolution, ethereal.",
  },
   // --- NOVOS MANTRAS ADICIONADOS ABAIXO ---
  {
    id: 13,
    nome: "Paz de Cristo",
    texto: "A paz de Jesus, o Cristo, está em mim e nos outros",
    finalidade: "Cultiva a paz interior e a harmonia com os outros.",
    repeticoes: 12,
    libraryAudioSrc: null, // Sem versão musical por enquanto
    spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/1%20fade.MP3",
    imageSrc: "https://i.postimg.cc/bNbZDBGR/paz.png", // Imagem genérica
    imagePrompt: "The calming and universal presence of peace.",
  },
  {
    id: 14,
    nome: "Ressurreição e Vida",
    texto: "Eu sou, eu sou, a ressurreição e a vida",
    finalidade: "Afirma a força vital e a capacidade de renovação.",
    repeticoes: 12,
    libraryAudioSrc: null,
    spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/2%20fade.MP3",
    imageSrc: "https://i.postimg.cc/HnktsCW3/healing.png",
    imagePrompt: "The eternal cycle of renewal and life force.",
  },
  {
    id: 15,
    nome: "A Porta Aberta",
    texto: "Eu sou a porta aberta, que nenhum homem pode fechar",
    finalidade: "Para abrir caminhos e remover bloqueios percebidos.",
    repeticoes: 12,
    libraryAudioSrc: null,
    spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/3%20fade.MP3",
    imageSrc: "https://i.postimg.cc/285HCnVm/obstacles.png",
    imagePrompt: "An open door shimmering with golden light and opportunities.",
  },
  {
    id: 16,
    nome: "Expectativa Positiva",
    texto: "Hoje, coisas maravilhosas me acontecerão",
    finalidade: "Atrai acontecimentos positivos e abre a percepção para o bem.",
    repeticoes: 12,
    libraryAudioSrc: null,
    spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/4%20fade.MP3",
    imageSrc: "https://i.postimg.cc/vBLPZzr8/manifestation.png",
    imagePrompt: "A beautiful sunrise with sparkles of magic in the air.",
  },
  {
    id: 17,
    nome: "Afirmação de Plenitude",
    texto: "Eu estou vivendo a melhor fase da minha vida",
    finalidade: "Reforça a gratidão e a percepção de um momento presente próspero.",
    repeticoes: 12,
    libraryAudioSrc: null,
    spokenAudioSrc: "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/5%20fade.MP3",
    imageSrc: "https://i.postimg.cc/xTF68qzm/possibility.png",
    imagePrompt: "A person with arms outstretched, joyfully embracing the present moment.",
  },
   // --- FIM NOVOS MANTRAS ADICIONADOS ---

  {
    id: 3,
    nome: "Harmonia nos Relacionamentos",
    texto: "Satya Naraya Ni Namostute Sarva Mangala Mangayê",
    finalidade: "Melhora vínculos e atrai harmonia.",
    repeticoes: 24,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Harmonia%20nos%20relacionamentos1.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Satya%20Naraya%20Ni.%20Namostute%CC%82.%20Sa%CC%81rva%20Mangala%CC%81.%20Mangaye%CC%82.mp3",
    imageSrc: "https://i.postimg.cc/bwhsQ9kf/harmony.png",
    imagePrompt:
      "A visual representation of harmonious connection between souls. Intertwined golden threads of light, soft pink and green auras, loving energy, beautiful, high resolution.",
  },
  {
    id: 4,
    nome: "Purificação Energética",
    texto: "Om Vajra Sattva Hum",
    finalidade: "Purifica pensamentos, emoções e o campo energético.",
    repeticoes: 36,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Purificac%CC%A7a%CC%83o%20energe%CC%81tica1.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om.%20Va%CC%81rjira.%20Sa%CC%81ttva.%20Rum.mp3",
    imageSrc: "https://i.postimg.cc/vmxkbf2D/purification.png",
    imagePrompt:
      "A brilliant, diamond-like white light dissolving dark clouds. Abstract art of energetic purification, cleansing waterfall of light, spiritual, high resolution.",
  },
  {
    id: 5,
    nome: "Realização de Desejos",
    texto: "Hansa Soham Ekam",
    finalidade: "Ajuda a realizar desejos e intenções positivas.",
    repeticoes: 48,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Realizac%CC%A7a%CC%83o%20dos%20desejos.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Hansa%20Soham%20Ekam.mp3",
    imageSrc: "https://i.postimg.cc/vBLPZzr8/manifestation.png",
    imagePrompt:
      "A seed of light blooming into a beautiful, intricate mandala. Abstract art of manifestation, creative energy, golden sparks, high resolution, magical.",
  },
  {
    id: 6,
    nome: "Proteção Divina",
    texto: "Jey Sita Ram",
    finalidade: "Protege você e sua família contra energias negativas.",
    repeticoes: 24,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Protec%CC%A7a%CC%83o%20divina.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Jey%20Sita%20Ram.%20jey%20jey%20hanuman.mp3",
    imageSrc: "https://i.postimg.cc/ZR2rZvgY/protection.png",
    imagePrompt:
      "A sphere of brilliant blue and golden light forming a protective shield. Abstract art of divine protection, safe, serene, powerful energy, high resolution.",
  },
  {
    id: 7,
    nome: "Remoção de Obstáculos",
    texto: "Om Shri Ganesha Namaha",
    finalidade: "Remove obstáculos e favorece novos começos.",
    repeticoes: 108,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Remoc%CC%A7a%CC%83o%20de%20obsta%CC%81culos.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Shiri%20Ganeschai%20Namara%CC%81.mp3",
    imageSrc: "https://i.postimg.cc/285HCnVm/obstacles.png",
    imagePrompt:
      "A powerful stream of light breaking through a dark, geometric barrier. Abstract art of overcoming obstacles, new pathways opening, success, high resolution.",
  },
  {
    id: 8,
    nome: "Tornar Tudo Possível",
    texto: "Ganesha Sharanam, Sharanam Ganesha",
    finalidade: "Ajuda a tornar o impossível, possível.",
    repeticoes: 48,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Tornar%20tudo%20possi%CC%81vel.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Gane%CC%82cha%20charana%CC%83%2C%20charana%CC%83%20Gane%CC%82cha%20.mp3",
    imageSrc: "https://i.postimg.cc/xTF68qzm/possibility.png",
    imagePrompt:
      "A swirling galaxy of possibilities and starlight, with new worlds forming. Abstract art of infinite potential, miracles, creative power, high resolution, cosmic.",
  },
  {
    id: 9,
    nome: "Cura e Prosperidade",
    texto: "Om Kala Vidê Namaha",
    finalidade: "Ativa cura, paz interior e prosperidade.",
    repeticoes: 108,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Cura%20e%20prosperidade.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/om%20kala%20vide%CC%82%20namara%CC%81.mp3",
    imageSrc: "https://i.postimg.cc/HnktsCW3/healing.png",
    imagePrompt:
      "A gentle, flowing river of emerald green and golden light. Abstract art representing healing energy and abundance, peaceful, prosperous, high resolution.",
  },
  {
    id: 10,
    nome: "Foco e Memória",
    texto: "Om Mará Patchá Na Dhi",
    finalidade: "Melhora o foco, a memória e o aprendizado.",
    repeticoes: 24,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Foco%20e%20memo%CC%81ria.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Mara%CC%81%20Patcha%CC%81%20Nadi%CC%81.mp3",
    imageSrc: "https://i.postimg.cc/3NfFkbdh/focus.png",
    imagePrompt:
      "A clear, focused beam of light illuminating intricate geometric patterns. Abstract art representing mental clarity, focus, and knowledge, intelligent design, high resolution.",
  },
  {
    id: 11,
    nome: "Atrair Riquezas",
    texto: "Om Zambalá Za Len Dhra Ye Soha",
    finalidade: "Atrai riqueza, abundância e segurança financeira.",
    repeticoes: 36,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Atrair%20riquezas.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/Om%20Zambala%CC%81.%20Za%20Len.%20Draie%CC%82.%20Soha%CC%81.mp3",
    imageSrc: "https://i.postimg.cc/mgfFmsxq/wealth.png",
    imagePrompt:
      "A shower of golden coins and jewels falling like rain into a beautiful landscape. Abstract art representing abundance, wealth, and prosperity, high resolution.",
  },
  {
    id: 12,
    nome: "Calma e Leveza",
    texto:
      "Hare Krishna Hare Krishna Krishna Krishna Hare Hare — Hare Rama Hare Rama Rama Rama Hare Hare",
    finalidade: "Acalma a ansiedade e traz leveza emocional.",
    repeticoes: 24,
    libraryAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/Calma%20e%20leveza.mp3",
    spokenAudioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Mantras@main/rare%CC%82%20Kri%CC%81shina.%20rare%CC%82%20Kri%CC%81shina.%20Kri%CC%81shina%20K.MP3",
    imageSrc: "https://i.postimg.cc/KzH1BXr0/calm.png",
    imagePrompt:
      "Soft, pastel-colored clouds gently floating in a serene sky. Abstract art representing emotional calm, lightness, and peace, high resolution, beautiful.",
  },
 
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
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/LAM1.MP3",
  },
  {
    id: 2,
    name: "Svadhisthana",
    color: "#E57723",
    mantra: "VAM",
    mudra: "Shakti Mudra",
    desc: "O centro da criatividade, da sexualidade e das emoções. Relacionado com a fluidez e a adaptabilidade.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/VAM.MP3",
  },
  {
    id: 3,
    name: "Manipura",
    color: "#F6F65C",
    mantra: "RAM",
    mudra: "Hakini Mudra",
    desc: "O centro do poder pessoal, da força de vontade e do metabolismo. A 'cidade das joias'.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/RAM.MP3",
  },
  {
    id: 4,
    name: "Anahata",
    color: "#46A66C",
    mantra: "YAM",
    mudra: "Hridaya Mudra",
    desc: "O chakra do coração, o centro do amor, da compaixão e da cura.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/YAM.MP3",
  },
  {
    id: 5,
    name: "Vishuddha",
    color: "#37A2D4",
    mantra: "HAM",
    mudra: "Granthi Mudra",
    desc: "O centro da comunicação e da expressão. A garganta é o canal para a verdade interior.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/HAM.MP3",
  },
  {
    id: 6,
    name: "Ajna",
    color: "#314594",
    mantra: "OM",
    mudra: "Shambhavi Mudra",
    desc: "O terceiro olho. Símbolo da intuição, da sabedoria e da percepção extrasensorial.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/OM.MP3",
  },
  {
    id: 7,
    name: "Sahasrara",
    color: "#9759B3",
    mantra: "AUM",
    mudra: "Dhyana Mudra",
    desc: "O lótus de mil pétalas. Conecta-nos com o universo, a iluminação e a consciência pura.",
    audioSrc:
      "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/AUM.MP3",
  },
];

// --- NOVOS DADOS: JORNADAS (CONTEÚDO ESTRUTURADO E REATORADO) ---
const JOURNEYS_DATA = [
  {
    id: "jornada_paz",
    title: "Jornada da Paz Interior",
    description:
      "Uma sequência de 7 dias para acalmar a mente, aliviar o estresse e cultivar a serenidade no seu dia a dia.",
    isPremium: false,
    completionReward: {
      type: "theme",
      value: "serenity_theme",
      message:
        "Parabéns! Você completou a Jornada da Paz e desbloqueou o tema 'Serenidade'. Você pode ativá-lo na tela de Configurações.",
    },
    days: [
      {
        day: 1,
        title: "A Intenção de Paz",
        introText:
          "Hoje, vamos começar plantando a semente da serenidade. Esta prática inicial alinha sua energia com a calma.",
        type: "mantra",
        details: { mantraId: 1, repetitions: 12 },
      },
      {
        day: 2,
        title: "Deixando Ir",
        introText:
          "A paz muitas vezes vem não ao adicionar, mas ao subtrair. Vamos refletir sobre o que podemos liberar hoje.",
        type: "reflexao_guiada",
        details: {
          prompt:
            "Escreva sobre 3 preocupações que você se permite 'deixar ir' apenas por hoje.",
        },
      },
      {
        day: 3,
        title: "Encontrando a Leveza",
        introText:
          "A leveza emocional é um superpoder. Use este mantra para se conectar com a alegria e a tranquilidade.",
        type: "mantra",
        details: { mantraId: 13, repetitions: 24 },
      },
      {
        day: 4,
        title: "O Coração Tranquilo",
        introText:
          "O centro do nosso ser é o coração. Hoje, dedicaremos 5 minutos para acalmar e abrir nosso Chakra Cardíaco, o Anahata.",
        type: "meditacao_chakra",
        details: { chakraId: 4, durationInSeconds: 300 },
      },
      {
        day: 5,
        title: "A Gratidão Harmoniza",
        introText:
          "Reconhecer as bênçãos ao nosso redor é um caminho direto para a paz. Pelo que você é grato hoje?",
        type: "gratitude",
        details: {},
      },
      {
        day: 6,
        title: "Paz em Ação",
        introText:
          "A serenidade cultivada internamente pode transbordar para o mundo. Vamos praticar um pequeno ato de paz.",
        type: "acao_consciente",
        details: {
          taskDescription:
            "Hoje, ofereça uma palavra gentil ou um elogio sincero a alguém, seja um familiar ou um estranho.",
        },
      },
      {
        day: 7,
        title: "Consolidando a Paz",
        introText:
          "Para finalizar nossa jornada, usaremos um mantra poderoso que ativa a cura e a paz interior profunda.",
        type: "mantra",
        details: { mantraId: 17, repetitions: 12 },
      },
    ],
  },
  {
    id: "jornada_abundancia",
    title: "Jornada da Abundância",
    description:
      "Uma jornada de 5 dias para alinhar sua vibração com a energia da prosperidade e atrair mais riqueza para sua vida.",
    isPremium: true,
    completionReward: {
      type: "badge",
      value: "magneto_da_abundancia",
      message:
        "Você concluiu a Jornada da Abundância e ganhou a medalha 'Magneto da Prosperidade' em seu perfil!",
    },
    days: [
      {
        day: 1,
        title: "Removendo Obstáculos",
        introText:
          "O primeiro passo para atrair a abundância é limpar o caminho. Este mantra remove os bloqueios que impedem seu fluxo.",
        type: "mantra",
        details: { mantraId: 7, repetitions: 108 },
      },
      {
        day: 2,
        title: "Sua Relação com a Riqueza",
        introText:
          "Nossas crenças moldam nossa realidade. Vamos refletir sobre nossa mentalidade em relação à prosperidade.",
        type: "reflexao_guiada",
        details: {
          prompt:
            "O que a palavra 'riqueza' significa para você, além do dinheiro? Descreva uma vida rica e abundante em seus próprios termos.",
        },
      },
      {
        day: 3,
        title: "Ativando a Prosperidade",
        introText:
          "Com o caminho limpo e a mente clara, é hora de ativar a energia da prosperidade com este mantra de cura.",
        type: "mantra",
        details: { mantraId: 9, repetitions: 108 },
      },
      {
        day: 4,
        title: "Consulte sua Intuição",
        introText:
          "O Oráculo pode nos dar insights valiosos. Pergunte sobre qual energia você deve focar para manifestar seus desejos.",
        type: "consulta_oraculo",
        details: {
          suggestedQuestion:
            "Qual o próximo passo para manifestar meus desejos?",
        },
      },
      {
        day: 5,
        title: "Sintonizando com a Riqueza",
        introText:
          "Para o último dia, um mantra específico para sintonizar sua vibração com a energia da riqueza, abundância e segurança.",
        type: "mantra",
        details: { mantraId: 11, repetitions: 36 },
      },
    ],
  },

  // --- NOVA JORNADA ADICIONADA ---
  {
    id: "jornada_foco",
    title: "Jornada do Foco e Clareza",
    description:
      "Uma prática curta de 3 dias para treinar sua mente, reduzir distrações e aumentar sua concentração.",
    isPremium: true,
    completionReward: {
      type: "badge",
      value: "mente_clara",
      message:
        "Você concluiu a Jornada do Foco e ganhou a medalha 'Mente Clara' em seu perfil!",
    },
    days: [
      {
        day: 1,
        title: "Ancorando a Mente",
        introText:
          "Para encontrar o foco, primeiro precisamos acalmar as águas da mente. Este mantra serve como uma âncora para o momento presente.",
        type: "mantra",
        details: { mantraId: 10, repetitions: 24 }, // Mantra de Foco e Memória
      },
      {
        day: 2,
        title: "Identificando Distrações",
        introText:
          "A clareza surge quando entendemos o que nos tira do centro. Hoje, vamos observar nossos padrões de distração.",
        type: "reflexao_guiada",
        details: {
          prompt:
            "Quais são as 3 principais coisas que roubam sua atenção durante o dia? Escreva sobre como elas te afetam.",
        },
      },
      {
        day: 3,
        title: "Prática de Atenção Plena",
        introText:
          "O foco é um músculo. Vamos treiná-lo com um exercício simples de atenção plena no aqui e agora.",
        type: "acao_consciente",
        details: {
          taskDescription:
            "Escolha uma tarefa rotineira de 5 minutos (como escovar os dentes ou lavar a louça) e execute-a com atenção total, focando em cada sensação, sem se distrair.",
        },
      },
    ],
  },
];

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let app, auth, db, storage, functions, messaging; // ADICIONADO: messaging
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  messaging = getMessaging(app); // ADICIONADO: Inicialização do Messaging
} catch (error) {
  console.error(
    "Erro na inicialização do Firebase. Verifique suas credenciais no .env:",
    error
  );
}

// =================================================================
//  INÍCIO DO CÓDIGO DE CONEXÃO COM EMULADORES (COLE ISTO)
// =================================================================
// 🔗 Conectado diretamente ao Firebase real (sem emuladores)

// =================================================================
//  FIM DO CÓDIGO DE CONEXÃO
// =================================================================

// --- CONTEXTO DA APLICAÇÃO ---
const AppContext = createContext(null);

// INÍCIO DO COMPONENTE AppProvider (VERSÃO RESTAURADA E INTEGRADA)
const AppProvider = ({ children }) => {
    // Estados
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isUserDataLoading, setIsUserDataLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [userName, setUserName] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [streakData, setStreakData] = useState({ currentStreak: 0, lastPracticedDate: null });
    const [photoURL, setPhotoURL] = useState(null);
    const [allEntries, setAllEntries] = useState([]);
    const [permissionError, setPermissionError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [freeQuestionUsed, setFreeQuestionUsed] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [meusAudios, setMeusAudios] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [astroProfile, setAstroProfile] = useState(null);
    const [astroHistory, setAstroHistory] = useState([]);
    const [userGoal, setUserGoal] = useState(null);
    const [journeyProgress, setJourneyProgress] = useState({});
    const [unlockedThemes, setUnlockedThemes] = useState(['default']);
    const [activeTheme, setActiveThemeState] = useState('default');
    const [perguntasAvulsas, setPerguntasAvulsas] = useState(0);

    // Funções de busca de dados
    const fetchAllEntries = useCallback(async (uid) => {
        if (!db || !uid) return [];
        try {
            const q = query(collection(db, `users/${uid}/entries`), orderBy("practicedAt", "desc"));
            const snapshot = await getDocs(q);
            const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllEntries(entries);
            return entries;
        } catch (error) {
            console.error("Erro ao buscar todas as entradas: ", error);
            if (error.code === 'permission-denied') {
                setPermissionError('Firestore');
            }
            return [];
        }
    }, []);

    const fetchMeusAudios = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const q = query(collection(db, `users/${uid}/meusAudios`), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            setMeusAudios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Erro ao buscar 'Meus Áudios':", error); }
    }, []);

    const fetchPlaylists = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const q = query(collection(db, `users/${uid}/playlists`), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Erro ao buscar Playlists:", error); }
    }, []);
    
    const fetchJourneyProgress = useCallback(async (uid) => {
        if (!db || !uid) return;
        try {
            const snapshot = await getDocs(collection(db, `users/${uid}/journeyProgress`));
            const progressData = {};
            snapshot.forEach(doc => { progressData[doc.id] = doc.data(); });
            setJourneyProgress(progressData);
        } catch (error) { console.error("Erro ao buscar progresso das jornadas:", error); }
    }, []);

    // Função de recálculo (versão robusta do seu arquivo original)
    const recalculateAndSetStreak = useCallback(async (entries, currentUserId) => {
  if (!currentUserId || !db) return;
  try {
    const practiceTypes = ['mantra', 'gratitude', 'note', 'playback', 'meditacao_chakra', 'reflexao_guiada', 'acao_consciente'];
    const practiceEntries = entries.filter(e => e.type && practiceTypes.includes(e.type) && e.practicedAt?.toDate);

    if (practiceEntries.length === 0) {
      const newStreakData = { currentStreak: 0, lastPracticedDate: null };
      setStreakData(newStreakData);
      const userRef = doc(db, `users/${currentUserId}`);
      await setDoc(userRef, { 
        currentStreak: newStreakData.currentStreak, 
        lastPracticedDate: null 
      }, { merge: true });
      return;
    }

    const uniquePracticeDays = [...new Set(practiceEntries.map(e => {
      const d = e.practicedAt.toDate();
      d.setHours(0,0,0,0);
      return d.getTime();
    }))].sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastPracticeDay = new Date(uniquePracticeDays[0]);

    let calculatedStreak = 0;

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
      calculatedStreak = 0; // se não praticou ontem ou hoje, streak zera
    }

    const newStreakData = {
      currentStreak: calculatedStreak,
      lastPracticedDate: lastPracticeDay,
    };

    setStreakData(newStreakData);
    const userRef = doc(db, `users/${currentUserId}`);
    await setDoc(userRef, { 
      currentStreak: newStreakData.currentStreak, 
      lastPracticedDate: Timestamp.fromDate(newStreakData.lastPracticedDate) 
    }, { merge: true });

  } catch (error) {
    console.error("Error recalculating streak:", error);
    if (error.code === 'permission-denied') {
      setPermissionError("Firestore");
    }
  }
}, [setPermissionError]);

    // O EFEITO REATIVO FOI REMOVIDO PARA DAR LUGAR ÀS CHAMADAS MANUAIS E DIRETAS,
    // CONFORME A LÓGICA DO SEU ARQUIVO ORIGINAL QUE FUNCIONA CORRETAMENTE.

    // Funções de atualização de dados
    const updateFavorites = useCallback(async (newFavorites) => {
        if (userId) {
            setFavorites(newFavorites);
            await setDoc(doc(db, `users/${userId}`), { favorites: newFavorites }, { merge: true });
        }
    }, [userId]);

    const updateOnboardingStatus = useCallback(async (status) => {
        if (!userId || !db) return;
        try {
            await setDoc(doc(db, `users/${userId}`), { onboardingCompleted: status }, { merge: true });
        } catch (error) { console.error("Erro ao atualizar status do onboarding:", error); }
    }, [userId]);
    
    const logPlaybackActivity = useCallback(async (data) => {
        if (!userId || !db) return;
        const { mantraId, customAudioId, source } = data;
        const playbackData = { type: 'playback', practicedAt: Timestamp.now(), source };
        if (mantraId) playbackData.mantraId = mantraId;
        if (customAudioId) playbackData.customAudioId = customAudioId;
        await addDoc(collection(db, `users/${userId}/entries`), playbackData);
        fetchAllEntries(userId); // Atualiza as entradas para acionar o useEffect
    }, [userId, fetchAllEntries]);
    useEffect(() => {
  if (userId && allEntries) {
    recalculateAndSetStreak(allEntries, userId);
  }
}, [allEntries, userId]);


    // Outras funções que adicionamos...
    const setActiveTheme = useCallback(async (themeId) => {
        if (!userId) return;
        setActiveThemeState(themeId);
        await setDoc(doc(db, `users/${userId}`), { activeTheme: themeId }, { merge: true });
    }, [userId]);

    const unlockTheme = useCallback(async (themeId) => {
        if (!userId || unlockedThemes.includes(themeId)) return;
        const newThemes = [...unlockedThemes, themeId];
        setUnlockedThemes(newThemes);
        await setDoc(doc(db, `users/${userId}`), { unlockedThemes: newThemes }, { merge: true });
    }, [userId, unlockedThemes]);

    const updateJourneyProgress = useCallback(async (journeyId, dayNumber) => {
        if (!userId) return;
        const progressRef = doc(db, `users/${userId}/journeyProgress`, journeyId);
        const currentProgress = journeyProgress[journeyId] || { completedDays: [] };
        if (!currentProgress.completedDays.includes(dayNumber)) {
            const updatedDays = [...currentProgress.completedDays, dayNumber];
            await setDoc(progressRef, { completedDays: updatedDays }, { merge: true });
            setJourneyProgress(prev => ({ ...prev, [journeyId]: { ...prev[journeyId], completedDays: updatedDays } }));
        }
    }, [userId, journeyProgress]);

    // Listener de Autenticação
useEffect(() => {
    const createUserIfNotExists = async (userAuth) => {
        if (!userAuth || !db) return;
        try {
            const userRef = doc(db, "users", userAuth.uid);
            const safeName = userAuth.displayName || (userAuth.providerData?.[0]?.displayName) || "";
const safePhoto = userAuth.photoURL || (userAuth.providerData?.[0]?.photoURL) || null;
const safeEmail = userAuth.email || (userAuth.providerData?.[0]?.email) || "";
const safeCreatedAt = userAuth.metadata?.creationTime
    ? new Date(userAuth.metadata.creationTime)
    : new Date();

const defaultFields = {
    uid: userAuth.uid,
    email: safeEmail,
    name: safeName,
    photoURL: safePhoto,
    isPremium: false,
    createdAt: safeCreatedAt,
    favorites: [],
    activeTheme: "default",
    unlockedThemes: ["default"],
    freeQuestionUsed: false,
    perguntasAvulsas: 0,
    currentStreak: 0,
    lastPracticedDate: null,
    astroProfile: null,
    astroHistory: [],
    journeyProgress: {},
    userGoal: null,
};

// 🔑 Cria ou complementa o documento sem sobrescrever campos já definidos
const snap = await getDoc(userRef);
if (!snap.exists()) {
  // documento não existe -> cria com todos os campos
  await setDoc(userRef, defaultFields);
} else {
  // documento existe -> adiciona apenas campos ausentes
  const existingData = snap.data() || {};
  const fieldsToAdd = {};

  for (const [key, value] of Object.entries(defaultFields)) {
    // adiciona apenas se a chave não existir ou for undefined
    if (!(key in existingData) || typeof existingData[key] === "undefined") {
      fieldsToAdd[key] = value;
    }
  }

  if (Object.keys(fieldsToAdd).length > 0) {
    try {
      await setDoc(userRef, fieldsToAdd, { merge: true });
      console.log("Campos adicionados ao usuário:", userRef.id, Object.keys(fieldsToAdd));
    } catch (e) {
      console.error("Erro ao adicionar campos faltantes ao usuário:", userRef.id, e, fieldsToAdd);
    }
  } else {
    console.log("Nenhum campo faltante para adicionar ao usuário:", userRef.id);
  }
}

        } catch (err) {
            console.error("Erro ao criar documento inicial do usuário:", err);
        }
    };

    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
        if (userAuth) {
            setUser(userAuth);
            setUserId(userAuth.uid);

            // 🔑 Garante inicialização completa do documento
            await createUserIfNotExists(userAuth);

        } else {
            // Limpeza completa no logout
            setUser(null); setUserId(null); setUserName(''); setFavorites([]);
            setStreakData({ currentStreak: 0, lastPracticedDate: null });
            setPhotoURL(null); setAllEntries([]); setIsSubscribed(false);
            setOnboardingCompleted(false); setUserGoal(null); setMeusAudios([]);
            setPlaylists([]); setAstroProfile(null); setAstroHistory([]);
            setJourneyProgress({}); setUnlockedThemes(['default']);
            setActiveThemeState('default'); setPerguntasAvulsas(0);
        }
        setIsAuthLoading(false);
    });

    return () => unsubscribe();
}, []);
    
    // Listener Principal de Dados
    useEffect(() => {
        if (!userId) {
            setIsUserDataLoading(false);
            return;
        }
        setIsUserDataLoading(true);

        const userDocRef = doc(db, "users", userId);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
    const data = doc.data();
    console.log("🔥 Snapshot usuário:", data); // debug completo

    setCurrentUserData(data);
    setUserName(data.name || '');
    setFavorites(data.favorites || []);
    setStreakData({ 
        currentStreak: data.currentStreak || 0, 
        lastPracticedDate: data.lastPracticedDate?.toDate() || null 
    });
    setPhotoURL(data.photoURL || null);
    setOnboardingCompleted(!!data.onboardingCompleted);
    setUserGoal(data.userGoal || null);
    setAstroProfile(data.astroProfile || null);
    setUnlockedThemes(data.unlockedThemes || ['default']);
    setActiveThemeState(data.activeTheme || 'default');

    // 🔑 garante leitura do campo perguntasAvulsas corretamente
    setPerguntasAvulsas(
        typeof data.perguntasAvulsas === "number" ? data.perguntasAvulsas : 0
    );

    setIsSubscribed(data.isPremium || false);
    setFreeQuestionUsed(!!data.freeQuestionUsed);
} else {
    setIsUserDataLoading(false);
}

        });

        const astroHistoryRef = collection(db, "users", userId, "astroHistory");
        const unsubscribeAstro = onSnapshot(query(astroHistoryRef, orderBy('createdAt', 'desc')), (snap) => {
            setAstroHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Carrega todos os dados iniciais
        // Listener reativo para entradas de prática
const entriesRef = collection(db, "users", userId, "entries");
const entriesQuery = query(entriesRef, orderBy("practicedAt", "desc"));
const unsubscribeEntries = onSnapshot(
  entriesQuery,
  (snapshot) => {
    const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setAllEntries(entries);
  },
  (error) => {
    console.error("Erro no listener de entries:", error);
    if (error.code === "permission-denied") {
      setPermissionError("Firestore");
    }
  }
);

        // Carrega os demais dados iniciais
        Promise.all([
          fetchMeusAudios(userId),
          fetchPlaylists(userId),
          fetchJourneyProgress(userId),
        ]).then(() => {
          setIsUserDataLoading(false);
        });


        return () => {
            unsubscribeUser();
            unsubscribeAstro();
            if (typeof unsubscribeEntries === "function") unsubscribeEntries();
        };


    }, [userId, fetchMeusAudios, fetchPlaylists, fetchJourneyProgress]);


    // O objeto 'value' final, com todas as funções corretas e restauradas
        const value = {
        user, userId, isAuthLoading, isUserDataLoading, currentUserData, userName, setUserName,
        favorites, updateFavorites, streakData, photoURL, setPhotoURL, allEntries, fetchAllEntries,
        permissionError, isSubscribed, freeQuestionUsed, setFreeQuestionUsed, onboardingCompleted,
        updateOnboardingStatus, meusAudios, fetchMeusAudios, playlists, fetchPlaylists,
        astroProfile, setAstroProfile, astroHistory, userGoal, journeyProgress, updateJourneyProgress,
        unlockedThemes, unlockTheme, activeTheme, setActiveTheme, perguntasAvulsas, logPlaybackActivity,
        // A função de recálculo não precisa ser exposta, pois age reativamente
    };

    return (
      <AppContext.Provider value={value}>
        <div className="app-container">
          {children}
        </div>
      </AppContext.Provider>
    );
};
// FIM DO COMPONENTE AppProvider

// --- TELAS E COMPONENTES EXISTENTES ---

const SplashScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-purple-700 to-indigo-900 text-white z-50 p-4">
    <style>{`.splash-content{animation:fade-in-splash 1s ease-out forwards}.mandala-path{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw-mandala 2.5s ease-in-out forwards}#mandala-c1{animation-delay:.5s}#mandala-c2{animation-delay:.7s}#mandala-p1{animation-delay:.9s}#mandala-c3{animation-delay:1.2s}#mandala-p2{animation-delay:1.5s}#mandala-c4{animation-delay:1.8s}.splash-title,.splash-subtitle{opacity:0;animation:fade-in-text 1.5s ease-in 2.5s forwards}.splash-subtitle{animation-delay:2.8s}@keyframes draw-mandala{to{stroke-dashoffset:0}}@keyframes fade-in-text{to{opacity:1}}@keyframes fade-in-splash{from{opacity:0}to{opacity:1}}`}</style>
    <div className="splash-content text-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        fill="none"
        className="mx-auto"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path
            id="petal"
            d="M 50,10 C 40,25 40,40 50,50 C 60,40 60,25 50,10 Z"
          />
        </defs>
        <g
          className="text-yellow-300"
          filter="url(#neon-glow)"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            id="mandala-c1"
            className="mandala-path"
            cx="50"
            cy="50"
            r="8"
          />
          <circle
            id="mandala-c2"
            className="mandala-path"
            cx="50"
            cy="50"
            r="12"
          />
          <g id="mandala-p1" className="mandala-path">
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <use
                key={r}
                href="#petal"
                transform={`rotate(${r} 50 50) scale(0.4) translate(0 -30)`}
              />
            ))}
          </g>
          <circle
            id="mandala-c3"
            className="mandala-path"
            cx="50"
            cy="50"
            r="25"
          />
          <g id="mandala-p2" className="mandala-path">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
              <use
                key={r}
                href="#petal"
                transform={`rotate(${r} 50 50) scale(0.8) translate(0 -18)`}
              />
            ))}
          </g>
          <circle
            id="mandala-c4"
            className="mandala-path"
            cx="50"
            cy="50"
            r="45"
          />
        </g>
      </svg>
      <h1
        className="splash-title text-4xl mt-4 text-white tracking-wider"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        Mantras Mais
      </h1>
      <p className="splash-subtitle text-lg mt-2 text-purple-200 tracking-wide">
        A sua jornada começa agora.
      </p>
    </div>
  </div>
);

const AuthScreen = () => {
  const { fetchUserData, setIsSubscribed } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapAuthCodeToMessage = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Formato de e-mail inválido.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "E-mail ou senha incorretos.";
      case "auth/wrong-password":
        return "Senha incorreta.";
      case "auth/email-already-in-use":
        return "Este e-mail já está em uso.";
      case "auth/weak-password":
        return "A senha deve ter pelo menos 6 caracteres.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/popup-closed-by-user":
        return "A janela de login foi fechada. Tente novamente.";
      case "auth/account-exists-with-different-credential":
        return "Já existe uma conta com este e-mail, mas usando um método de login diferente.";
      default:
        return `Ocorreu um erro inesperado. Tente novamente. (Código: ${code})`;
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!auth || !db) {
      setError(
        "O Firebase não foi inicializado corretamente. Verifique a configuração."
      );
      return;
    }
    setError("");
    setMessage("");
    setIsSubmitting(true);
    if (!isLogin && password !== confirmPassword) {
      setError("As senhas não correspondem.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
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
            console.log(
              `Assinatura pendente para ${user.email} ativada e registro removido.`
            );
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
          onboardingCompleted: false,
          activeTheme: "default",
          unlockedThemes: ["default"],
          perguntasAvulsas: 0, // <-- CAMPO ADICIONADO AQUI
        });

        if (isPremium) {
          setMessage(
            "Sua conta foi criada e sua assinatura premium ativada automaticamente!"
          );
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

  // Esta função foi removida.

const handleSocialLogin = async (providerName) => {
    if (!auth || !db) {
      setError("O Firebase não foi inicializado corretamente.");
      return;
    }
    setError("");
    setMessage("");
    setIsSubmitting(true);

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
          onboardingCompleted: false,
          activeTheme: "default",
          unlockedThemes: ["default"],
          perguntasAvulsas: 0, // <-- CAMPO ADICIONADO AQUI
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

// Este useEffect foi removido.

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, insira seu e-mail para redefinir a senha.");
      return;
    }
    if (!auth) {
      setError("O Firebase não foi inicializado corretamente.");
      return;
    }
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada."
      );
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
          <h2 className="page-title !text-2xl !text-white !-mt-2 text-center">
            {isLogin ? "Bem-vindo(a)" : "Crie a Sua Conta"}
          </h2>
          <p className="mt-[-0.5rem] text-base text-white/70 text-center">
            {isLogin
              ? "Acesse seu diário espiritual."
              : "Comece a sua jornada de transformação."}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleEmailAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="O seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field"
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field"
            />
          )}

          <button
            type="submit"
            className="w-full modern-btn-primary h-14"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-black/50 border-t-black rounded-full animate-spin"></div>
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Registrar"
            )}
          </button>
        </form>
        {error && (
          <p className="text-sm text-center text-red-400 bg-red-500/20 p-3 rounded-lg">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-center text-green-400 bg-green-500/20 p-3 rounded-lg">
            {message}
          </p>
        )}

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-white/60 text-xs uppercase">
            Ou continue com
          </span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <div className="space-y-3">
 <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.657-3.356-11.303-8H6.393c3.541,8.337,12.061,14,21.607,14L24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.018,35.245,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            <span>Entrar com Google</span>
          </button>
        </div>

        <div>
          <div className="text-sm text-center mt-4">
            <span className="text-white/60">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="ml-1 text-[#FFD54F] hover:underline"
            >
              {isLogin ? "Registre-se" : "Faça login"}
            </button>
          </div>
          {isLogin && (
            <div className="text-center mt-2">
              <button
                onClick={handlePasswordReset}
                className="text-xs text-white/60 hover:underline"
                disabled={isSubmitting}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- INÍCIO: COMPONENTE DE ONBOARDING ATUALIZADO ---
const OnboardingScreen = () => {
  const { userName, updateOnboardingStatus, updateUserData } =
    useContext(AppContext);
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [recommendedMantra, setRecommendedMantra] = useState(null);
  const [playerData, setPlayerData] = useState({
    mantra: null,
    repetitions: 1,
    audioType: "library",
  });

  const goals = [
    {
      key: "anxiety",
      label: "Reduzir ansiedade e estresse",
      icon: Wind,
      mantraId: 12,
    },
    {
      key: "focus",
      label: "Melhorar foco e concentração",
      icon: BrainCircuit,
      mantraId: 10,
    },
    {
      key: "prosperity",
      label: "Atrair mais prosperidade",
      icon: TrendingUp,
      mantraId: 11,
    },
    { key: "peace", label: "Aumentar a paz interior", icon: Leaf, mantraId: 1 },
  ];

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    const mantra = MANTRAS_DATA.find((m) => m.id === goal.mantraId);
    setRecommendedMantra(mantra);
    if (updateUserData) {
      updateUserData({ userGoal: goal.key });
    }
    setStep(2);
  };

  const handleStartPractice = () => {
    setPlayerData({
      mantra: recommendedMantra,
      repetitions: 1,
      audioType: "library",
    });
  };

  // ATUALIZADO: Agora leva para o passo 3 (Jornadas)
  const handlePlayerClose = () => {
    setPlayerData({ mantra: null, repetitions: 1, audioType: "library" });
    setStep(3); // MUDANÇA AQUI
  };

  const handleFinishOnboarding = () => {
    updateOnboardingStatus(true);
  };

  // ATUALIZADO: Lógica de renderização com os novos passos
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center screen-animation">
            <PageTitle
              subtitle={`Olá, ${
                userName || "Ser de Luz"
              }! Para personalizar sua jornada, conte-nos:`}
            >
              Qual seu principal objetivo?
            </PageTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {goals.map((goal) => (
                <button
                  key={goal.key}
                  onClick={() => handleGoalSelect(goal)}
                  className="glass-card !p-6 text-left flex items-center gap-4 clickable hover:!border-[#FFD54F]"
                >
                  <goal.icon className="h-8 w-8 text-[#FFD54F] flex-shrink-0" />
                  <span className="text-white text-base font-light">
                    {goal.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="text-center screen-animation">
            <PageTitle subtitle="Com base no seu objetivo, recomendamos este mantra para começar:">
              Sua Primeira Prática
            </PageTitle>
            {recommendedMantra && (
              <div className="glass-card mt-8">
                <img
                  src={recommendedMantra.imageSrc}
                  alt={recommendedMantra.nome}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3
                  className="text-xl text-[#FFD54F]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {recommendedMantra.nome}
                </h3>
                <p className="text-white/80 my-3 font-light italic">
                  "{recommendedMantra.texto}"
                </p>
                <button
                  onClick={handleStartPractice}
                  className="w-full modern-btn-primary h-14 mt-4"
                >
                  <Play /> Ouvir por 30 segundos
                </button>
              </div>
            )}
          </div>
        );
      case 3: // <-- NOVO PASSO ADICIONADO AQUI
        return (
          <div className="text-center screen-animation">
            <Map className="mx-auto h-16 w-16 text-[#FFD54F]/80 mb-4" />
            <PageTitle subtitle="Siga sequências guiadas de 7, 5 ou 3 dias para cultivar a paz, a prosperidade e o foco de forma estruturada.">
              Descubra um Caminho Guiado
            </PageTitle>
            <button
              onClick={() => setStep(4)}
              className="w-full max-w-xs mx-auto modern-btn-primary h-14 mt-8"
            >
              Próximo
            </button>
          </div>
        );
      case 4: // Antigo passo 3
        return (
          <div className="text-center screen-animation">
            <Leaf className="mx-auto h-16 w-16 text-[#FFD54F]/80 mb-4" />
            <PageTitle subtitle="No Santuário, você poderá gravar seus próprios mantras, criar playlists de práticas e construir um ritual que é só seu.">
              Seu Espaço Sagrado e Pessoal
            </PageTitle>
            <button
              onClick={() => setStep(5)}
              className="w-full max-w-xs mx-auto modern-btn-primary h-14 mt-8"
            >
              Próximo
            </button>
          </div>
        );
      case 5: // Antigo passo 4
        return (
          <div className="text-center screen-animation">
            <MessageCircleQuestion className="mx-auto h-16 w-16 text-[#FFD54F]/80 mb-4" />
            <PageTitle subtitle="Entenda sua missão de vida, carreira e relacionamentos com análises astrológicas exclusivas, feitas para o seu mapa astral.">
              Receba Orientação para sua Jornada
            </PageTitle>
            <button
              onClick={() => setStep(6)}
              className="w-full max-w-xs mx-auto modern-btn-primary h-14 mt-8"
            >
              Continuar
            </button>
          </div>
        );
      case 6: // Antigo passo 5
        return (
          <div className="text-center screen-animation">
            <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
            <PageTitle subtitle="Você conheceu o potencial da sua jornada de transformação. Continue a explorar e aprofundar sua prática.">
              Parabéns!
            </PageTitle>
            <button
              onClick={handleFinishOnboarding}
              className="w-full max-w-xs mx-auto modern-btn-primary h-14 mt-8"
            >
              Explorar o App
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 modern-body">
        <div className="w-full max-w-lg mx-auto z-10">
          {renderStepContent()}
        </div>
      </div>
      {playerData.mantra && (
        <MantraPlayer
          currentMantra={playerData.mantra}
          onClose={handlePlayerClose}
          onMantraChange={() => {}}
          audioType={playerData.audioType}
          totalRepetitions={1}
        />
      )}
    </>
  );
};
// --- FIM: COMPONENTE DE ONBOARDING ATUALIZADO ---

// --- COMPONENTES AUXILIARES ---
const ScreenAnimator = ({ children, screenKey }) => (
  <div key={screenKey} className="screen-animation">
    {children}
  </div>
);
const PageTitle = ({ children, subtitle }) => (
  <div>
    <h1 className="page-title">{children}</h1>
    {subtitle && <p className="page-subtitle">{subtitle}</p>}
  </div>
);
const PremiumButton = ({ onClick, children, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full modern-btn-primary !py-2 !px-4 !text-sm !font-normal !bg-white/10 !text-white/70 cursor-pointer ${className}`}
  >
    <Lock className="h-4 w-4" />
    {children}
  </button>
);
const Header = ({ setActiveScreen }) => {
  const LOGO_URL =
    "https://i.postimg.cc/Gm7sPsQL/6230-C8-D1-AC9-B-4744-8809-341-B6-F51964-C.png";
  return (
    <header className="fixed top-0 left-0 right-0 z-30 p-4 glass-nav">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Logo Clube dos Mantras"
            className="w-10 h-10"
          />
          <span
            className="text-lg text-white/90"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mantras Mais
          </span>
        </div>
        <button
          onClick={() => setActiveScreen("settings")}
          className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

// --- BOTTOMNAV (COM ÍCONES ATUALIZADOS) ---
const BottomNav = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: "home", icon: Home, label: "Início" },
    { id: "spokenMantras", icon: HandCoins, label: "Mantras" },
    { id: "meuSantuario", icon: Leaf, label: "Santuário" },
    { id: "more", icon: AlignJustify, label: "Mais" },
  ];

  const secondaryScreens = [
    "chakras",
    "mantras",
    "astrologer",
    "history",
    "oracle",
  ];
  const effectiveActiveScreen = secondaryScreens.includes(activeScreen)
    ? "more"
    : activeScreen;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-bottom-nav">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className="relative flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-300 ease-in-out text-white/70 hover:text-white"
          >
            <item.icon
              className={`h-6 w-6 transition-all ${
                effectiveActiveScreen === item.id ? "text-[#FFD54F]" : ""
              }`}
            />
            <span
              className={`text-xs mt-1 transition-opacity ${
                effectiveActiveScreen === item.id
                  ? "opacity-100 text-[#FFD54F]"
                  : "opacity-0"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- COMPONENTES DE MODAL ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  confirmClass = "btn-danger",
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="glass-modal w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl text-white">{title}</h2>
        <p className="text-white/70 my-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className={confirmClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
const ReauthModal = ({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
  isSubmitting,
  title,
  message,
  errorMessage,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="glass-modal w-full max-w-sm text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl">{title}</h2>
        <p className="text-white/70 my-4">{message}</p>
        <form onSubmit={onConfirm} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/80" htmlFor="reauth-password">
              Sua Senha
            </label>
            <input
              id="reauth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-center text-red-400">{errorMessage}</p>
          )}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirmando..." : "Confirmar e Deletar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ATUALIZADO: Modal de Bloqueio Premium com Lógica de Teste A/B ---
const PremiumLockModal = ({ isOpen, onClose, variant }) => {
  const { currentUserData } = useContext(AppContext);
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // SUBSTITUA ESTE LINK PELO SEU LINK DA OFERTA NA KIWIFY
  const OFFER_URL = "https://pay.kiwify.com.br/efohCIH";
  const REGULAR_URL = "https://pay.kiwify.com.br/efohCIH";

  useEffect(() => {
  let intervalId;
  if (isOpen && currentUserData?.createdAt) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const createdAtDate = currentUserData.createdAt.toDate
      ? currentUserData.createdAt.toDate()
      : currentUserData.createdAt;

    const expirationTime = createdAtDate.getTime() + twentyFourHours;

    const updateTimer = () => {
      const now = Date.now();
      const remainingTime = expirationTime - now;
      if (remainingTime > 0) {
        setIsOfferActive(true);
          const hours = String(
            Math.floor((remainingTime / (1000 * 60 * 60)) % 24)
          ).padStart(2, "0");
          const minutes = String(
            Math.floor((remainingTime / 1000 / 60) % 60)
          ).padStart(2, "0");
          const seconds = String(
            Math.floor((remainingTime / 1000) % 60)
          ).padStart(2, "0");
          setTimeLeft(`${hours}:${minutes}:${seconds}`);
        } else {
        setIsOfferActive(false);
        setTimeLeft("");
        clearInterval(intervalId);
      }
    };

    updateTimer();
    intervalId = setInterval(updateTimer, 1000);
  }
  return () => clearInterval(intervalId);
}, [isOpen, currentUserData]);

  const handleSubscribe = () => {
    const url = isOfferActive ? OFFER_URL : REGULAR_URL;
    window.open(url, "_blank");
    onClose();
  };

  if (!isOpen || !variant) return null; // Não renderiza se não houver variante

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isOfferActive && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm rounded-lg p-3 mb-4">
            <p className="font-bold">✨ OFERTA DE BOAS-VINDAS</p>
            <p className="text-xs mt-1">
              50% OFF no 1º mês! Termina em{" "}
              <span className="font-semibold">{timeLeft}</span>
            </p>
          </div>
        )}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-900/50 border border-white/10 mb-5">
          <Sparkles className="h-7 w-7 text-[#FFD54F]" />
        </div>
        <h2
          className="text-2xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {variant.title}
        </h2>
        <p className="text-white/70 my-3 font-light text-base">
          {variant.subtitle}
        </p>

        {/* Lista de Benefícios/Funcionalidades */}
        <div className="text-left my-6 space-y-3">
          {variant.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <feature.icon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/80 font-light">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSubscribe}
            className="w-full modern-btn-primary !py-3 !text-base"
          >
            {isOfferActive ? "Aproveitar Oferta" : "Assinar Agora"}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:underline py-2"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ATUALIZADO: Modal de Gerenciamento de Assinatura com Oferta de Boas-Vindas ---
const SubscriptionManagementModal = ({ isOpen, onClose }) => {
  const { currentUserData } = useContext(AppContext);
  const [isOfferActive, setIsOfferActive] = useState(false);

  // SUBSTITUA ESTE LINK PELO SEU LINK DA OFERTA NA KIWIFY
  const OFFER_URL = "https://pay.kiwify.com.br/efohCIH";
  const REGULAR_URL = "https://pay.kiwify.com.br/efohCIH";

  useEffect(() => {
  if (isOpen && currentUserData?.createdAt) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const createdAtDate = currentUserData.createdAt.toDate
      ? currentUserData.createdAt.toDate()
      : currentUserData.createdAt;

    const expirationTime = createdAtDate.getTime() + twentyFourHours;

    if (Date.now() < expirationTime) {
      setIsOfferActive(true);
    }
  }
}, [isOpen, currentUserData]);

  const handleNewSubscription = () => {
    const url = isOfferActive ? OFFER_URL : REGULAR_URL;
    window.open(url, "_blank");
    onClose();
  };

  const handleManageSubscription = () => {
    window.open(
      "https://subscription.kiwify.com/subscription/manage",
      "_blank"
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-900/50 border border-white/10 mb-5">
          <Sparkles className="h-7 w-7 text-[#FFD54F]" />
        </div>
        <h2
          className="text-xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Assinatura Premium
        </h2>
        <p className="text-white/70 my-3 font-light text-base">
          O que você gostaria de fazer?
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleNewSubscription}
            className="w-full modern-btn-primary !py-3 !text-sm"
          >
            {isOfferActive
              ? "Aproveitar Oferta de Boas-Vindas"
              : "Tornar-se Premium"}
          </button>
          <button
            onClick={handleManageSubscription}
            className="w-full btn-secondary !py-3 !text-sm !font-normal"
          >
            Gerenciar Assinatura Atual
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ATUALIZADO: Modal de Permissão de Notificação Push com Design Moderno ---
const PushPermissionModal = ({ onAllow, onDeny }) => (
  <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
    onClick={onDeny}
  >
    <div
      className="glass-modal w-full max-w-sm text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-900/50 border border-white/10 mb-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FFD54F]"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </div>
      <h2
        className="text-xl text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Ótimo trabalho!
      </h2>
      <p className="text-white/70 my-3 font-light text-base">
        Gostaria de receber lembretes diários para manter sua prática em dia?
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={onDeny}
          className="w-full btn-secondary !py-3 !text-sm !font-normal"
        >
          Agora não
        </button>
        <button
          onClick={onAllow}
          className="w-full modern-btn-primary !py-3 !text-sm"
        >
          Sim, por favor!
        </button>
      </div>
    </div>
  </div>
);

// --- INÍCIO: NOVO COMPONENTE DE SUGESTÃO PERSONALIZADA ---
const PersonalizedSuggestionCard = ({ userGoal, onSelectMantra }) => {
  const SUGGESTION_DATA = {
    anxiety: {
      title: "Para sua busca por calma",
      text: "A ansiedade se dissipa quando focamos no agora. Este mantra é uma poderosa âncora para o presente.",
      mantraId: 12, // Calma e Leveza
    },
    focus: {
      title: "Para seu objetivo de foco",
      text: "A clareza mental é como um farol na escuridão. Use este mantra para iluminar seus pensamentos.",
      mantraId: 10, // Foco e Memória
    },
    prosperity: {
      title: "Para sua jornada de prosperidade",
      text: "A abundância é um estado de espírito. Sintonize sua vibração com a energia da riqueza universal.",
      mantraId: 11, // Atrair Riquezas
    },
    peace: {
      title: "Para nutrir sua paz interior",
      text: "A verdadeira paz reside dentro de você. Este mantra ajuda a silenciar o ruído externo e a ouvir sua alma.",
      mantraId: 1, // Afirmação da Paz
    },
  };

  const suggestion = SUGGESTION_DATA[userGoal];
  if (!suggestion) return null;

  const mantra = MANTRAS_DATA.find((m) => m.id === suggestion.mantraId);
  if (!mantra) return null;

  return (
    <div className="w-full glass-card p-6 space-y-3 text-center mb-6 screen-animation">
      <h2
        className="text-xl text-white/90"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {suggestion.title}
      </h2>
      <p className="text-base text-white/70 font-light">{suggestion.text}</p>
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => onSelectMantra(mantra)}
          className="modern-btn-primary !py-2 !px-5 !text-sm !font-semibold"
        >
          <Mic2 className="h-4 w-4" /> Praticar {mantra.nome}
        </button>
      </div>
    </div>
  );
};
// --- FIM: NOVO COMPONENTE ---

// --- TELAS EXISTENTES (alteradas para navegação) ---
const HomeScreen = ({
  setActiveScreen,
  openCalendar,
  openDayDetail,
  onSelectMantra,
}) => {
  const { userName, streakData, allEntries, isSubscribed, userGoal } =
    useContext(AppContext);
  const dailyMessages = [
    "A luz do Sol renasce em você. Que seu domingo seja de alma renovada.",
    "A força está em acolher-se por inteiro. Que sua segunda seja leve e clara.",
    "Coragem para agir com alma. A terça-feira pede passos verdadeiros.",
    "Palavras curam. Silêncios ensinam. Que sua quarta seja de conexão interna.",
    "Sabedoria está em ver beleza no simples. Que sua quinta seja próspera.",
    "Celebre suas conquistas, grandes e pequenas. A sexta-feira chegou!",
    "Silencie, desacelere, retorne ao centro. O sábado é um templo sagrado.",
  ];
  const premiumMessages = [
    "Como membro Mantra+, sua jornada hoje é guiada pela energia da prosperidade.",
    "Sua assinatura ilumina o caminho. Que a prática de hoje aprofunde sua conexão.",
    "Agradecemos por ser Mantra+. Que sua intenção para hoje se manifeste com força.",
    "Seu apoio nos inspira. Que a vibração do universo ressoe em você hoje.",
    "Membro Mantra+, sua luz é essencial. Que hoje seja um dia de clareza e paz.",
    "Sua energia contribui para este espaço. Que a sexta-feira traga realizações.",
    "Aproveite o descanso, membro Mantra+. Sua paz interior é a nossa alegria.",
  ];
  const todayIndex = new Date().getDay();
  const message = isSubscribed
    ? premiumMessages[todayIndex]
    : dailyMessages[todayIndex];
  const messageColor = "text-[#FFD54F]/80";

  const WeekView = () => {
    const today = new Date();
    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      return date;
    });
    const practicedDays = new Set(
      (allEntries || [])
        .filter((e) => e.practicedAt?.toDate)
        .map((entry) => entry.practicedAt.toDate().toDateString())
    );
    return (
      <div className="w-full glass-card p-4 space-y-3 premium-card-glow">
        <div className="flex justify-around">
          {days.map((day, index) => {
            const isPracticed = practicedDays.has(day.toDateString());
            const isToday = day.toDateString() === new Date().toDateString();
            const buttonClasses = `w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm ${
              isToday && isPracticed
                ? "bg-yellow-400/20 ring-2 ring-[#FFD54F]"
                : isToday
                ? "ring-2 ring-[#FFD54F] bg-white/10"
                : isPracticed
                ? "bg-white/10 border-2 border-[#FFD54F]"
                : "bg-white/10"
            }`;
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <span
                  className={`text-sm font-light ${
                    isToday ? "text-[#FFD54F]" : "text-white/60"
                  }`}
                >
                  {weekDays[day.getDay()]}
                </span>
                <button
                  onClick={() => openDayDetail(day)}
                  className={buttonClasses}
                >
                  {isToday ? (
                    <Flame className="text-yellow-400" size={16} />
                  ) : (
                    day.getDate()
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="text-center pt-3 border-t border-white/10">
          <button
            onClick={openCalendar}
            className="text-sm text-[#FFD54F] hover:underline font-light"
          >
            Ver calendário completo
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container text-center">
      {userGoal && (
        <PersonalizedSuggestionCard
          userGoal={userGoal}
          onSelectMantra={onSelectMantra}
        />
      )}

      <div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="page-title !text-3xl !mb-0">
            Olá, {userName || "Ser de Luz"}
          </h1>
          {isSubscribed && (
            <div className="bg-white/10 text-[#FFD54F] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 self-center mt-[-4px]">
              <span>PREMIUM</span>
            </div>
          )}
        </div>
        <p className={`${messageColor} mt-1 mb-4 text-base italic font-light`}>
          "{message}"
        </p>
      </div>
      {(
  (allEntries && allEntries.some(entry =>
    ["mantra", "gratitude", "note"].includes(entry.type)
  )) ||
  (streakData && streakData.currentStreak > 0)
) && (
  <div className="glass-card p-6 flex items-center justify-center gap-5 text-center premium-card-glow">
    <Flame
      className="h-10 w-10 text-[#FFD54F]"
      style={{ filter: "drop-shadow(0 0 10px rgba(255, 213, 79, 0.5))" }}
    />
    <div>
      <p className="text-xl text-white">
        {streakData?.currentStreak || 0}{" "}
        {(streakData?.currentStreak || 0) > 1 ? "dias" : "dia"} de prática
      </p>
      <p className="text-sm text-white/60 font-light">Continue assim!</p>
    </div>
  </div>
)}

      <WeekView />
      <div className="w-full max-w-md mx-auto space-y-3">
        <button
          onClick={() => setActiveScreen("diary")}
          className="w-full btn-secondary h-16 flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-6 w-6" /> Registrar Prática de Mantra
        </button>
        <button
          onClick={() => setActiveScreen("gratitude")}
          className="w-full btn-secondary h-16 flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-6 w-6" /> Registrar Gratidão Diária
        </button>
        {/* --- ALTERAÇÃO APLICADA AQUI --- */}
        <button
          onClick={() => setActiveScreen("noteEditor", { from: "home" })}
          className="w-full btn-secondary h-16 flex items-center justify-center gap-2"
        >
          <BookOpen className="h-6 w-6" /> Registrar Anotação
        </button>
      </div>
    </div>
  );
};
const DiaryScreen = ({ entryToEdit, onSave, onCancel, openPremiumModal }) => {
  const { userId, fetchAllEntries, recalculateStreak, isSubscribed } =
    useContext(AppContext);
  const [selectedMantra, setSelectedMantra] = useState(MANTRAS_DATA[0].id);
  const [repetitions, setRepetitions] = useState("");
  const [timeOfDay, setTimeOfDay] = useState([]);
  const [feelings, setFeelings] = useState("");
  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [reflection, setReflection] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setSelectedMantra(entryToEdit.mantraId);
      setRepetitions(entryToEdit.repetitions);
      setTimeOfDay(entryToEdit.timeOfDay);
      setFeelings(entryToEdit.feelings);
      setObservations(entryToEdit.observations || "");
    }
  }, [entryToEdit]);

  useEffect(() => {
    if (!entryToEdit) {
      const mantra = MANTRAS_DATA.find((m) => m.id === selectedMantra);
      if (mantra) {
        setRepetitions(mantra.repeticoes);
      }
    }
  }, [selectedMantra, entryToEdit]);

  // Melhoria 2: Lógica para habilitar/desabilitar o botão Salvar
  const canSave =
    selectedMantra &&
    repetitions &&
    timeOfDay.length > 0 &&
    feelings.trim() !== "";

  const handleGenerateReflection = async () => {
    if (!feelings) return;
    setIsGenerating(true);
    setReflection("");
    try {
      const prompt = `Um usuário de um aplicativo de mantras descreveu seus sentimentos hoje como: "${feelings}". Escreva uma reflexão curta (máximo 3 frases), gentil e inspiradora em português, baseada nesse sentimento, para encorajá-lo em sua jornada espiritual. Não ofereça conselhos médicos.`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = firebaseConfig.apiKey;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setReflection(text);
      } else {
        console.error("Unexpected API response structure:", result);
        setReflection(
          "Não foi possível gerar uma reflexão no momento. Tente novamente."
        );
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error.message.includes("403")) {
        setReflection(
          "Erro de permissão (403). Verifique se a sua Chave de API está correta no código e se as restrições no Google Cloud estão configuradas corretamente."
        );
      } else if (error.message.includes("404")) {
        setReflection(
          "Erro (404). O modelo de IA não foi encontrado. O nome pode estar incorreto."
        );
      } else {
        setReflection(
          "Ocorreu um erro ao se conectar com a sabedoria interior. Tente novamente."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };
  const handleTimeOfDayToggle = (time) =>
    setTimeOfDay((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) {
      setStatus({ type: "error", message: "Preencha os campos obrigatórios." });
      return;
    }
    if (!userId || !db) return;
    
    const entryData = {
      type: "mantra",
      mantraId: selectedMantra,
      repetitions: Number(repetitions),
      timeOfDay,
      feelings,
      observations,
    };

    try {
      if (entryToEdit && entryToEdit.id) {
        await setDoc(
        doc(db, `users/${userId}/entries`, entryToEdit.id),
        entryData,
        { merge: true }
        );

        setStatus({ type: "success", message: "Registro atualizado!" });
      } else {
        await addDoc(collection(db, `users/${userId}/entries`), {
          ...entryData,
          practicedAt: Timestamp.now(),
        });
        setStatus({ type: "success", message: "Registro salvo com sucesso!" });
      }
      
      // Apenas busca as entradas. O useEffect no AppProvider cuidará do recálculo.
      fetchAllEntries(userId); 
      setTimeout(() => onSave(), 1500);
    } catch (error) {
      console.error("Erro ao salvar no diário:", error);
      setStatus({ type: "error", message: "Erro ao salvar." });
    }
  };

  const currentMantra = MANTRAS_DATA.find((m) => m.id === selectedMantra);
  const LabelWithIcon = ({ icon: Icon, text }) => (
    <label className="text-white/80 flex items-center gap-2 font-light">
      <Icon size={18} className="text-[#FFD54F]/80" />
      <span>{text}</span>
    </label>
  );
  const handleSelectMantraAndClose = (id) => {
    setSelectedMantra(id);
    setIsMantraModalOpen(false);
  };

  return (
    <>
      <div className="page-container">
        <PageTitle subtitle="Registre os detalhes da sua prática diária para acompanhar sua evolução e insights.">
          {entryToEdit ? "Editar Registro" : "Diário de Prática"}
        </PageTitle>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg mx-auto glass-card space-y-8"
        >
          <div className="space-y-3">
            <LabelWithIcon icon={Star} text="Mantra do Dia" />
            <div className="p-4 rounded-lg bg-black/20 text-center">
              <p className="italic text-white/80">"{currentMantra?.texto}"</p>
              <button
                type="button"
                onClick={() => setIsMantraModalOpen(true)}
                className="text-sm text-[#FFD54F] hover:underline mt-2 font-light"
              >
                Trocar Mantra
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <LabelWithIcon icon={GaugeCircle} text="Repetições" />
            <input
              type="number"
              value={repetitions}
              onChange={(e) => setRepetitions(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="space-y-3">
            <LabelWithIcon icon={Clock} text="Horário da Prática" />
            <div className="grid grid-cols-3 gap-2">
              {["Manhã", "Tarde", "Noite"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeOfDayToggle(time)}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    timeOfDay.includes(time)
                      ? "bg-[#FFD54F] text-[#3A1B57]"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-light">{time}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <LabelWithIcon icon={Heart} text="Como se sentiu?" />
            <textarea
              value={feelings}
              onChange={(e) => setFeelings(e.target.value)}
              className="textarea-field"
              rows="3"
              placeholder="Ex: Em paz, com a mente clara..."
              required
            ></textarea>
          </div>
          {feelings && (
            <div className="text-center">
              {isSubscribed ? (
                <button
                  type="button"
                  onClick={handleGenerateReflection}
                  className="modern-btn-primary !py-2 !px-4 !text-sm !font-semibold"
                  disabled={isGenerating}
                >
                  <Sparkles className="h-5 w-5" />
                  {isGenerating ? "Gerando..." : "✨ Gerar Reflexão com IA"}
                </button>
              ) : (
                <PremiumButton onClick={openPremiumModal}>
                  Gerar Reflexão com IA (Premium)
                </PremiumButton>
              )}
            </div>
          )}
          {reflection && (
            <div className="p-4 bg-black/20 rounded-lg italic text-white/80 text-center font-light">
              <p>{reflection}</p>
            </div>
          )}
          <div className="space-y-3">
            <LabelWithIcon icon={BookOpen} text="Observações" />
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="textarea-field"
              rows="3"
              placeholder="Algum insight, sincronicidade..."
            ></textarea>
          </div>

          {/* Melhoria 3: Botão Cancelar adicionado e botões atualizados */}
          <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="w-full btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full modern-btn-primary h-14"
                disabled={!canSave}
              >
                {entryToEdit ? "Atualizar" : "Salvar"}
              </button>
            </div>
            {status.message && (
              <p
                className={`p-3 rounded-lg text-center text-sm ${
                  status.type === "success"
                    ? "bg-green-500/30 text-green-300"
                    : "bg-red-500/30 text-red-400"
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
      <MantraSelectionModal
        isOpen={isMantraModalOpen}
        onClose={() => setIsMantraModalOpen(false)}
        onSelectMantra={handleSelectMantraAndClose}
        currentMantraId={selectedMantra}
      />
    </>
  );
};
const MantraSelectionModal = ({
  isOpen,
  onClose,
  onSelectMantra,
  currentMantraId,
}) => {
  if (!isOpen) return null;
  const handleSelect = (id) => {
    onSelectMantra(id);
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-xl text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Selecione um Mantra
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
          {MANTRAS_DATA.map((mantra) => (
            <div
              key={mantra.id}
              onClick={() => handleSelect(mantra.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentMantraId === mantra.id
                  ? "bg-[#FFD54F] text-[#3A1B57]"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <p>{mantra.nome}</p>
              <p
                className={`text-sm font-light ${
                  currentMantraId === mantra.id ? "opacity-80" : "text-white/70"
                }`}
              >
                {mantra.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// SUBSTITUA TODO O SEU COMPONENTE 'MantrasScreen' POR ESTE
const MantrasScreen = ({ onPlayMantra, openPremiumModal }) => {
  const { isSubscribed } = useContext(AppContext);
  const FREE_MANTRA_IDS = [1, 2, 13, 14, 15, 16, 17]; // <-- ALTERAÇÃO APLICADA AQUI
  return (
    <div className="page-container">
      <PageTitle subtitle="Explore melodias sagradas para relaxar e meditar.">
        Músicas Mântricas
      </PageTitle>
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {MANTRAS_DATA.map((mantra) => {
          // Apenas mostra mantras que têm uma versão musical (libraryAudioSrc)
          if (!mantra.libraryAudioSrc) return null;

          const isLocked =
            !isSubscribed && !FREE_MANTRA_IDS.includes(mantra.id);
          return (
            <div
              key={mantra.id}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group clickable"
              onClick={() =>
                isLocked
                  ? openPremiumModal()
                  : onPlayMantra(mantra, 1, "library")
              }
            >
              <img
                src={mantra.imageSrc}
                alt={`Visual para ${mantra.nome}`}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  isLocked ? "filter grayscale brightness-50" : ""
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Lock className="h-10 w-10 text-white/70" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 p-4">
                <h3
                  className="text-white text-base leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {mantra.nome}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// SUBSTITUA TODO O SEU COMPONENTE 'SpokenMantrasScreen' POR ESTE
const SpokenMantrasScreen = ({ onSelectMantra, openPremiumModal }) => {
  const { isSubscribed } = useContext(AppContext);
  const FREE_MANTRA_IDS = [1, 2, 13, 14, 15, 16, 17]; // <-- ALTERAÇÃO APLICADA AQUI
  return (
    <div className="page-container">
      <PageTitle subtitle="Escolha um mantra para focar e iniciar sua prática de repetição.">
        Mantras para Praticar
      </PageTitle>
      <div className="space-y-4">
        {MANTRAS_DATA.map((mantra) => {
          // Apenas mostra mantras que têm uma versão falada (spokenAudioSrc)
          if (!mantra.spokenAudioSrc) return null;

          const isLocked =
            !isSubscribed && !FREE_MANTRA_IDS.includes(mantra.id);
          return (
            <div key={mantra.id} className="glass-card !p-5 text-left">
              <h3
                className="text-lg text-[#FFD54F]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mantra.nome}
              </h3>
              <p className="text-white/80 my-3 font-light italic">
                "{mantra.texto}"
              </p>
              <div className="mt-4 text-right">
                {isLocked ? (
                  <PremiumButton
                    onClick={openPremiumModal}
                    className="!w-auto !py-2 !px-5 !text-sm !font-semibold"
                  >
                    Praticar
                  </PremiumButton>
                ) : (
                  <button
                    onClick={() => onSelectMantra(mantra)}
                    className="modern-btn-primary !py-2 !px-5 !text-sm !font-semibold"
                  >
                    <Mic2 className="h-4 w-4" />
                    Praticar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const HistoryScreen = ({
  onEditMantra,
  onEditNote,
  onDelete,
  onEditGratitude,
}) => {
  const { allEntries } = useContext(AppContext);
  const [expandedId, setExpandedId] = useState(null);

  // 1. Filtra APENAS as entradas que devem ser exibidas nesta tela
  const displayableTypes = ["mantra", "gratitude", "note"];
  const displayableEntries = allEntries.filter(entry => 
    displayableTypes.includes(entry.type)
  );

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // 2. Filtra as categorias a partir da lista já filtrada de 'displayableEntries'
  const praticas = displayableEntries.filter((e) => e.type === "mantra");
  const gratidoes = displayableEntries.filter((e) => e.type === "gratitude");
  const anotacoes = displayableEntries.filter((e) => e.type === "note");

  // Componente auxiliar para renderizar cada seção (sem alteração)
  const EntrySection = ({ title, entries, children }) => {
    if (entries.length === 0) return null;
    return (
      <div className="w-full space-y-4">
        <h2
          className="text-xl text-white/90 mt-6 border-b border-white/10 pb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        {children}
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageTitle subtitle="Reveja todas as suas práticas, gratidões e anotações passadas.">
        Meu Diário
      </PageTitle>

      {/* 3. CONDIÇÃO CORRIGIDA: Verifica a lista de entradas VISÍVEIS */}
      {displayableEntries.length > 0 ? (
        <>
          <EntrySection title="Práticas de Mantra" entries={praticas}>
            {praticas.map((entry) => {
              const mantra = MANTRAS_DATA.find((m) => m.id === entry.mantraId);
              if (!mantra || !entry.practicedAt?.toDate) return null;
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="glass-card !p-0 overflow-hidden">
                  <div
                    className="p-5 text-left cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div>
                      <p className="text-sm text-[#FFD54F] font-light">
                        {entry.practicedAt
                          .toDate()
                          .toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                      </p>
                      <h3
                        className="text-lg text-white mt-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {mantra.nome}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`text-white/70 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-white/10 space-y-2 text-sm font-light text-white/70">
                      <p>
                        <span className="text-white/90 font-normal">
                          Repetições:
                        </span>{" "}
                        {entry.repetitions}
                      </p>
                      <p>
                        <span className="text-white/90 font-normal">
                          Período:
                        </span>{" "}
                        {entry.timeOfDay.join(", ")}
                      </p>
                      <p>
                        <span className="text-white/90 font-normal">
                          Sentimentos:
                        </span>{" "}
                        {entry.feelings}
                      </p>
                      {entry.observations && (
                        <p>
                          <span className="text-white/90 font-normal">
                            Observações:
                          </span>{" "}
                          {entry.observations}
                        </p>
                      )}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => onEditMantra(entry)}
                          className="btn-secondary !text-xs !py-1 !px-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(entry)}
                          className="btn-danger-outline !text-xs !py-1 !px-3"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </EntrySection>

          <EntrySection title="Pote da Gratidão" entries={gratidoes}>
            {gratidoes.map((entry) => {
              if (!entry.practicedAt?.toDate) return null;
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="glass-card !p-0 overflow-hidden">
                  <div
                    className="p-5 text-left cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div>
                      <p className="text-sm text-[#FFD54F] font-light">
                        {entry.practicedAt
                          .toDate()
                          .toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                      </p>
                      <h3
                        className="text-lg text-white mt-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Registro de Gratidão
                      </h3>
                    </div>
                    <ChevronDown
                      className={`text-white/70 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-white/10 space-y-2 text-sm font-light text-white/70">
                      <ul className="list-disc list-inside space-y-1">
                        {entry.gratefulFor.map((item, index) => (
                          <li key={index} className="italic">
                            "{item}"
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => onEditGratitude(entry)}
                          className="btn-secondary !text-xs !py-1 !px-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(entry)}
                          className="btn-danger-outline !text-xs !py-1 !px-3"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </EntrySection>

          <EntrySection title="Anotações" entries={anotacoes}>
            {anotacoes.map((entry) => {
              if (!entry.practicedAt?.toDate) return null;
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="glass-card !p-0 overflow-hidden">
                  <div
                    className="p-5 text-left cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div>
                      <p className="text-sm text-[#FFD54F] font-light">
                        {entry.practicedAt
                          .toDate()
                          .toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                      </p>
                      <h3
                        className="text-lg text-white mt-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Anotação Pessoal
                      </h3>
                    </div>
                    <ChevronDown
                      className={`text-white/70 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-white/10 space-y-2 text-sm font-light text-white/70">
                      <p className="italic">"{entry.note}"</p>
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => onEditNote(entry)}
                          className="btn-secondary !text-xs !py-1 !px-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(entry)}
                          className="btn-danger-outline !text-xs !py-1 !px-3"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </EntrySection>
        </>
      ) : (
        <div className="glass-card text-center mt-8">
          <History className="mx-auto h-12 w-12 text-white/50" />
          <p className="mt-4 text-white/70">Você ainda não tem registros.</p>
          <p className="text-sm text-white/50 font-light">
            Comece uma prática ou adicione uma anotação.
          </p>
        </div>
      )}
    </div>
  );
};

// --- TELA DE CONFIGURAÇÕES ATUALIZADA ---
const SettingsScreen = ({ setActiveScreen }) => {
  const {
    user,
    userName,
    photoURL,
    setPhotoURL,
    fetchUserData,
    unlockedThemes,
    activeTheme,
    setActiveTheme,
  } = useContext(AppContext);

  const [newName, setNewName] = useState(userName);
  const [nameMessage, setNameMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const fileInputRef = useRef(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const THEMES = [
    { id: "default", name: "Padrão" },
    { id: "serenity_theme", name: "Serenidade" },
  ];
  const isSerenityLocked = !unlockedThemes.includes("serenity_theme");
  const avatarBgColor = activeTheme === "serenity_theme" ? "0b2c4d" : "2c0b4d";

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (newName === userName || !newName.trim() || !user || !db) return;
    setIsSubmitting(true);
    setNameMessage({ type: "", text: "" });
    try {
      const userRef = doc(db, `users/${user.uid}`);
      await setDoc(userRef, { name: newName }, { merge: true });
      // A linha abaixo foi removida, pois a função não existe e o listener onSnapshot já faz a atualização.
      // await fetchUserData(user.uid); 
      setNameMessage({ type: "success", text: "Nome atualizado!" });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      setNameMessage({ type: "error", text: "Erro ao atualizar o nome." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNameMessage({ type: "", text: "" }), 3000);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || !storage || !db) return;
    setIsUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      const userDocRef = doc(db, `users/${user.uid}`);
      await setDoc(userDocRef, { photoURL: url }, { merge: true });
      setPhotoURL(url);
    } catch (error) {
      console.error("Photo Upload Error:", error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  const handlePasswordReset = async () => {
    if (!auth || !user) return;
    setIsSubmitting(true);
    try {
      auth.languageCode = "pt-BR";
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage({
        type: "success",
        text: `E-mail de redefinição enviado.`,
      });
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Erro ao enviar e-mail." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
    }
  };

  // --- INÍCIO DA LÓGICA DE EXCLUSÃO CORRIGIDA ---
  const reauthenticateAndDelete = async () => {
    setIsDeleteModalOpen(false);
    if (!auth.currentUser) return;

    const providerId = auth.currentUser.providerData[0]?.providerId;

    try {
      if (providerId === "password") {
        // Abre o modal de senha para usuários de email
        setIsReauthModalOpen(true);
      } else if (providerId === "google.com") {
        // Inicia o fluxo de pop-up para usuários Google
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
        await deleteUser(auth.currentUser); // Dispara a Cloud Function
      } else {
        throw new Error("Método de login não suportado para exclusão.");
      }
    } catch (error) {
      console.error("Erro na reautenticação:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        alert("Ocorreu um erro durante a reautenticação. Tente novamente.");
      }
    }
  };

  const handlePasswordReauthAndDelete = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !reauthPassword) return;
    setIsSubmitting(true);
    setReauthError("");
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        reauthPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteUser(auth.currentUser); // Dispara a Cloud Function
      setIsReauthModalOpen(false);
    } catch (error) {
      setReauthError("Senha incorreta ou falha na reautenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- FIM DA LÓGICA DE EXCLUSÃO CORRIGIDA ---

  return (
    <>
      <div className="page-container">
        <PageTitle subtitle="Personalize seu perfil, gerencie sua conta e entre em contato conosco.">
          Configurações
        </PageTitle>
        <div className="glass-card space-y-8">
          {/* Seção de Perfil (com avatar dinâmico) */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={
                  photoURL ||
                  `https://ui-avatars.com/api/?name=${
                    userName || "?"
                  }&background=${avatarBgColor}&color=f3e5f5&bold=false`
                }
                alt="Perfil"
                className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
              />
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-[#FFD54F] text-[#3A1B57] p-1.5 rounded-full"
                disabled={isUploadingPhoto}
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-white text-xl">{userName}</h2>
              <p className="text-sm text-white/60 font-light">{user.email}</p>
            </div>
          </div>

          {/* Formulário de Nome */}
          <form onSubmit={handleNameUpdate} className="space-y-3">
            <label className="text-sm text-white/80 font-light">
              Nome de Usuário
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field flex-1"
              />
              <button
                type="submit"
                className="btn-secondary"
                disabled={isSubmitting || newName === userName}
              >
                Salvar
              </button>
            </div>
            {nameMessage.text && (
              <p
                className={`mt-3 p-3 rounded-lg text-center text-sm ${
                  nameMessage.type === "success"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {nameMessage.text}
              </p>
            )}
          </form>

          {/* Seção de Temas (Preservada) */}
          <div className="space-y-3">
            <label className="text-sm text-white/80 font-light">
              Tema Visual
            </label>
            <div className="flex w-full bg-black/20 rounded-full p-1">
              {THEMES.map((theme) => {
                const isActive = activeTheme === theme.id;
                const isLocked =
                  theme.id === "serenity_theme" && isSerenityLocked;

                if (isLocked) {
                  return (
                    <button
                      key={theme.id}
                      disabled
                      className="w-full text-center py-2 rounded-full text-sm font-semibold bg-transparent text-white/40 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock size={14} />
                      <span>{theme.name}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`w-full text-center py-2 rounded-full transition-all text-sm font-semibold ${
                      isActive
                        ? "bg-[#FFD54F] text-[#2c0b4d] shadow-md"
                        : "bg-transparent text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {theme.name}
                  </button>
                );
              })}
            </div>
            {isSerenityLocked && (
              <p className="text-center text-xs text-white/60 font-light pt-2">
                Complete a "Jornada da Paz" para desbloquear.
              </p>
            )}
          </div>

          {/* O resto do JSX continua idêntico */}
          <div className="space-y-3">
            <label className="text-sm text-white/80 font-light">
              Assinatura
            </label>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full btn-secondary text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Sparkles /> <span>Premium</span>
              </div>
              <ChevronLeft className="transform rotate-180" />
            </button>
          </div>
          <div className="space-y-3">
            <label className="text-sm text-white/80 font-light">
              Segurança
            </label>
            <button
              onClick={handlePasswordReset}
              className="w-full btn-secondary text-left flex items-center gap-3"
              disabled={isSubmitting}
            >
              <KeyRound />
              <span>Alterar senha</span>
            </button>
            {passwordMessage.text && (
              <p
                className={`mt-3 p-3 rounded-lg text-center text-sm ${
                  passwordMessage.type === "success"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {passwordMessage.text}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <label className="text-sm text-white/80 font-light">
              Entre em contato
            </label>
            <button
              onClick={() =>
                window.open(
                  "mailto:contato.evoluo.ir@gmail.com?subject=Mantras%2B%20-%20Feedback"
                )
              }
              className="btn-secondary w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <MessageSquare /> <span>Dar feedback</span>
              </div>
              <ChevronLeft className="transform rotate-180" />
            </button>
          </div>
          <div className="space-y-4 pt-6 border-t border-white/10">
            <button
              onClick={() => signOut(auth)}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" /> Sair da Conta
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full btn-danger-outline flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" /> Deletar Conta
            </button>
          </div>
        </div>
      </div>

      <SubscriptionManagementModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
      {/* O onConfirm foi renomeado para maior clareza */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={reauthenticateAndDelete}
        title="Deletar Conta"
        message="Tem certeza de que deseja deletar sua conta? Esta ação é permanente e não pode ser desfeita."
      />
      {/* O onConfirm aqui também foi renomeado */}
      <ReauthModal
        isOpen={isReauthModalOpen}
        onClose={() => setIsReauthModalOpen(false)}
        onConfirm={handlePasswordReauthAndDelete}
        password={reauthPassword}
        setPassword={setReauthPassword}
        isSubmitting={isSubmitting}
        title="Confirme sua identidade"
        message="Para sua segurança, por favor, insira sua senha novamente para deletar sua conta."
        errorMessage={reauthError}
      />
    </>
  );
};

// --- TELA DO ORÁCULO ---
const OracleScreen = ({ onPlayMantra, openPremiumModal }) => {
  const { isSubscribed } = useContext(AppContext);
  const [userInput, setUserInput] = useState("");
  const [suggestedMantra, setSuggestedMantra] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSuggestMantra = async () => {
    if (!userInput) return;
    if (!isSubscribed) {
      if (freeQuestionUsed) {
        openPremiumModal();
        return;
      }
      // 1 pergunta grátis: permite enviar
    }
    setIsLoading(true);
    setSuggestedMantra(null);
    setError("");
    try {
      const mantraListForPrompt = MANTRAS_DATA.map(
        (m) => `ID ${m.id}: ${m.nome} - ${m.finalidade}`
      ).join("\n");
      const prompt = `Um usuário está sentindo: "${userInput}". Baseado nisso, qual dos seguintes mantras é o mais adequado? Por favor, responda APENAS com o número do ID do melhor mantra. \n\nMantras:\n${mantraListForPrompt}`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = firebaseConfig.apiKey;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        const match = text?.match(/\d+/);
        if (match) {
          const mantraId = parseInt(match[0], 10);
          const foundMantra = MANTRAS_DATA.find((m) => m.id === mantraId);
          if (foundMantra) {
            setSuggestedMantra(foundMantra);
          } else {
            setError(
              "O oráculo não encontrou uma sugestão. Tente descrever seu sentimento de outra forma."
            );
          }
        } else {
          setError(
            "Não foi possível interpretar a sugestão do oráculo. Tente novamente."
          );
        }
      } else {
        console.error("Unexpected API response structure:", result);
        setError(
          "O oráculo está em silêncio no momento. Por favor, tente mais tarde."
        );
      }
    } catch (err) {
      console.error("Gemini Suggestion Error:", err);
      if (err.message.includes("403")) {
        setError(
          "Erro de permissão (403). Verifique se a sua Chave de API está correta e se as restrições no Google Cloud estão configuradas."
        );
      } else if (err.message.includes("404")) {
        setError(
          "Erro (404). O modelo de IA não foi encontrado. O nome pode estar incorreto."
        );
      } else {
        setError(
          "Ocorreu um erro ao consultar o oráculo. Verifique sua conexão."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="page-container">
      <PageTitle subtitle="Não sabe qual mantra escolher? Descreva seu sentimento e deixe a sabedoria interior guiá-lo.">
        Oráculo dos Mantras
      </PageTitle>
      <div className="w-full max-w-lg mx-auto space-y-6 glass-card">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="textarea-field"
          rows="4"
          placeholder="Descreva como você está se sentindo hoje..."
        />
        {isSubscribed ? (
          <button
            onClick={handleSuggestMantra}
            className="w-full modern-btn-primary h-14"
            disabled={isLoading}
          >
            <BrainCircuit className="h-6 w-6" />
            {isLoading ? "Consultando..." : "Revelar o meu Mantra"}
          </button>
        ) : (
          <PremiumButton
            onClick={openPremiumModal}
            className="h-14 !text-base !font-semibold"
          >
            Revelar o meu Mantra
          </PremiumButton>
        )}
        {error && (
          <p className="text-sm text-center text-red-400 bg-red-500/20 p-3 rounded-lg">
            {error}
          </p>
        )}
        {suggestedMantra && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-center text-white/70 mb-2 font-light">
              O oráculo sugere:
            </p>
            <div
              className="bg-black/20 p-4 rounded-lg clickable cursor-pointer"
              onClick={() => onPlayMantra(suggestedMantra, 1, "library")}
            >
              <h3
                className="text-lg text-[#FFD54F]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {suggestedMantra.nome}
              </h3>
              <p className="italic text-white/90 my-2 font-light">
                "{suggestedMantra.texto}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const FavoritesScreen = ({ onPlayMantra }) => {
  const { favorites } = useContext(AppContext);
  const favoriteMantras = MANTRAS_DATA.filter((mantra) =>
    favorites.includes(mantra.id)
  );
  return (
    <div className="page-container">
      <PageTitle subtitle="Acesse rapidamente os mantras que mais ressoam com você.">
        Meus Favoritos
      </PageTitle>
      <div className="space-y-4">
        {favoriteMantras.length === 0 ? (
          <div className="glass-card text-center">
            <Heart className="mx-auto h-12 w-12 text-white/50" />
            <p className="mt-4 text-white/70">
              Clique no coração no player para adicionar um mantra aqui.
            </p>
          </div>
        ) : (
          favoriteMantras.map((mantra) => (
            <div
              key={mantra.id}
              className="glass-card clickable cursor-pointer"
              onClick={() => onPlayMantra(mantra, 1, "library")}
            >
              <h3
                className="text-lg text-[#FFD54F]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mantra.nome}
              </h3>
              <p className="italic text-white/80 my-2 font-light">
                "{mantra.texto}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// INÍCIO DO COMPONENTE 'MantraPlayer' //

const MantraPlayer = ({
  currentMantra,
  onClose,
  onMantraChange,
  onPracticeComplete,
  totalRepetitions = 1,
  audioType,
}) => {
  const { favorites, updateFavorites } = useContext(AppContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repetitionCount, setRepetitionCount] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState({ endTime: null, duration: null });

  const audioRef = useRef(null);
  const repetitionCountRef = useRef(1);
  const startTimeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const hideControlsTimeoutRef = useRef(null);
  const practiceTimerRef = useRef(practiceTimer);

  useEffect(() => {
    practiceTimerRef.current = practiceTimer;
  }, [practiceTimer]);

  const isSpokenPractice = audioType === "spoken";
  const isFavorite = favorites.includes(currentMantra.id);
  const audioSrc = audioType === "spoken" ? currentMantra.spokenAudioSrc : currentMantra.libraryAudioSrc;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    repetitionCountRef.current = 1;
    setRepetitionCount(1);
    lastTimeRef.current = 0;
    if (startTimeRef.current === null && isSpokenPractice) {
      startTimeRef.current = Date.now();
    }

    audio.loop = isSpokenPractice && totalRepetitions > 1;
    
    const handleTimeUpdate = () => {
      const currentAudioTime = audio.currentTime;
      if (isSpokenPractice && currentAudioTime < lastTimeRef.current && repetitionCountRef.current < totalRepetitions) {
        repetitionCountRef.current += 1;
        setRepetitionCount(repetitionCountRef.current);
        if (repetitionCountRef.current === totalRepetitions) {
          audio.loop = false;
        }
      }
      lastTimeRef.current = currentAudioTime;
      setCurrentTime(currentAudioTime);
    };

    const handleAudioEnd = () => {
      // Lógica para timer de prática (Músicas Mântricas) - FUNCIONALIDADE RESTAURADA
      const timer = practiceTimerRef.current;
      if (!isSpokenPractice && timer && timer.endTime && Date.now() < timer.endTime) {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (isSpokenPractice && onPracticeComplete) {
        const endTime = Date.now();
        const durationInSeconds = Math.round((endTime - startTimeRef.current) / 1000);
        onPracticeComplete({
          mantra: currentMantra,
          count: totalRepetitions,
          duration: durationInSeconds,
          completedAt: new Date(),
        });
        startTimeRef.current = null;
      } else {
        setIsPlaying(false);
        clearTimeout(hideControlsTimeoutRef.current);
        setAreControlsVisible(true);
      }
    };

    const setAudioData = () => setDuration(audio.duration);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnd);

    audio.play().catch(e => console.error("Falha ao iniciar áudio:", e));
    setIsPlaying(true);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnd);
      audio.loop = false;
    };
  }, [audioSrc, totalRepetitions, isSpokenPractice, onPracticeComplete, currentMantra]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      if (audio.currentTime >= audio.duration) {
        repetitionCountRef.current = 1;
        setRepetitionCount(1);
        audio.currentTime = 0;
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const showControls = useCallback(() => {
    clearTimeout(hideControlsTimeoutRef.current);
    setAreControlsVisible(true);
    if (!isSpokenPractice && !isOptionsMenuOpen && !showSpeedModal && !showTimerModal) {
      hideControlsTimeoutRef.current = setTimeout(() => setAreControlsVisible(false), 4000);
    }
  }, [isSpokenPractice, isOptionsMenuOpen, showSpeedModal, showTimerModal]);
  
  useEffect(() => {
    showControls();
    return () => clearTimeout(hideControlsTimeoutRef.current);
  }, [showControls]);

  const toggleFavorite = useCallback(() => {
    const newFavorites = isFavorite ? favorites.filter((id) => id !== currentMantra.id) : [...favorites, currentMantra.id];
    updateFavorites(newFavorites);
  }, [isFavorite, favorites, currentMantra.id, updateFavorites]);
  
  const changePlaybackRate = useCallback((rate) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedModal(false);
    setIsOptionsMenuOpen(false);
  }, []);

  const handleSetPracticeDuration = useCallback((seconds) => {
    if (seconds > 0) {
      setPracticeTimer({ endTime: Date.now() + seconds * 1000, duration: seconds });
    } else {
      setPracticeTimer({ endTime: null, duration: null });
    }
    setShowTimerModal(false);
    setIsOptionsMenuOpen(false);
  }, []);

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const closeOptionsMenu = useCallback(() => setIsOptionsMenuOpen(false), []);
  const openOptionsMenu = useCallback(() => { setIsOptionsMenuOpen(true); showControls(); }, [showControls]);
  const closeSpeedModal = useCallback(() => setShowSpeedModal(false), []);
  const openSpeedModal = useCallback(() => setShowSpeedModal(true), []);
  const closeTimerModal = useCallback(() => setShowTimerModal(false), []);
  const openTimerModal = useCallback(() => setShowTimerModal(true), []);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    if (!e.touches) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    if (!e.touches) return;
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distanceX = touchStartX.current - touchEndX.current;
    if (Math.abs(distanceX) < minSwipeDistance) return;
    
    const currentIndex = MANTRAS_DATA.findIndex((m) => m.id === currentMantra.id);
    if (distanceX > 0) {
      const nextIndex = (currentIndex + 1) % MANTRAS_DATA.length;
      onMantraChange(MANTRAS_DATA[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + MANTRAS_DATA.length) % MANTRAS_DATA.length;
      onMantraChange(MANTRAS_DATA[prevIndex]);
    }
  };

  if (!currentMantra) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center screen-animation player-background-gradient"
      onClick={showControls}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <MantraVisualizer mantra={currentMantra} isPlaying={isPlaying} />
      <div
        className={`absolute inset-0 z-10 flex flex-col h-full w-full p-6 text-white text-center justify-between transition-opacity duration-500 ${
          areControlsVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-start">
          <button onClick={openOptionsMenu} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg">
            <MoreHorizontal size={22} />
          </button>
          <button onClick={onClose} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg">
            <X size={22} />
          </button>
        </div>
        <div className={`flex-grow flex flex-col items-center justify-center ${isSpokenPractice ? "space-y-4" : "space-y-8"} -mb-10`}>
          <div style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <h2 className="text-xl font-normal" style={{ fontFamily: "var(--font-display)" }}>{currentMantra.nome}</h2>
            <p className="text-base font-light mt-2 text-white/80 max-w-md">"{currentMantra.texto}"</p>
            {isSpokenPractice && (
              <div className="mt-4 px-3 py-1 bg-black/30 rounded-full text-sm font-light flex items-center justify-center gap-2 max-w-min mx-auto">
                <Repeat size={14} />
                <span className="whitespace-nowrap">{repetitionCount} / {totalRepetitions}</span>
              </div>
            )}
          </div>
          <div className="w-full max-w-sm flex flex-col items-center gap-3">
            <div className="w-full">
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = e.target.value; }} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs font-light text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{practiceTimerRef.current.endTime ? `-${formatTime((practiceTimerRef.current.endTime - Date.now()) / 1000)}` : formatTime(duration)}</span>
              </div>
            </div>
            <button onClick={togglePlayPause} className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-lg text-white flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
          </div>
        </div>
        <div />
      </div>
      <audio ref={audioRef} src={audioSrc} crossOrigin="anonymous" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} playsInline />
      <OptionsMenu isOpen={isOptionsMenuOpen} onClose={closeOptionsMenu} isFavorite={isFavorite} onFavorite={toggleFavorite} onSpeed={openSpeedModal} onTimer={openTimerModal} />
      {showSpeedModal && <PlaybackSpeedModal currentRate={playbackRate} onSelectRate={changePlaybackRate} onClose={closeSpeedModal} />}
      {showTimerModal && <PracticeTimerModal activeTimer={practiceTimer} onSetTimer={handleSetPracticeDuration} onClose={closeTimerModal} />}
    </div>
  );
};

// FIM DO COMPONENTE 'MantraPlayer' //

const OptionsMenu = memo(
  ({ isOpen, onClose, isFavorite, onFavorite, onSpeed, onTimer }) => {
    if (!isOpen) return null;
    const OptionButton = ({ icon: Icon, text, onClick, active = false }) => (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 text-left p-4 rounded-lg transition-colors ${
          active ? "text-[#FFD54F]" : "text-white"
        } hover:bg-white/10`}
      >
        <Icon
          size={20}
          className={active ? "text-[#FFD54F]" : "text-white/70"}
        />
        <span className="font-light">{text}</span>
      </button>
    );
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="glass-modal w-full max-w-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            <OptionButton
              icon={Heart}
              text="Favoritar"
              onClick={onFavorite}
              active={isFavorite}
            />
            <OptionButton
              icon={GaugeCircle}
              text="Velocidade"
              onClick={onSpeed}
            />
            <OptionButton
              icon={Clock}
              text="Definir Duração"
              onClick={onTimer}
            />
          </div>
        </div>
      </div>
    );
  }
);
const PlaybackSpeedModal = memo(({ currentRate, onSelectRate, onClose }) => {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full rounded-b-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg text-center mb-4 text-white">
          Velocidade de Reprodução
        </h3>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {speeds.map((speed) => (
            <li
              key={speed}
              onClick={() => onSelectRate(speed)}
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                currentRate === speed
                  ? "bg-[#FFD54F] text-[#3A1B57]"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <span className="font-light">{speed}x</span>
              {currentRate === speed && <CheckCircle />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
const PracticeTimerModal = memo(({ activeTimer, onSetTimer, onClose }) => {
  const timers = [
    { label: "5 Minutos", seconds: 300 },
    { label: "15 Minutos", seconds: 900 },
    { label: "30 Minutos", seconds: 1800 },
    { label: "60 Minutos", seconds: 3600 },
  ];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full rounded-b-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg text-center mb-4 text-white">Definir Duração</h3>
        <ul className="space-y-2">
          {activeTimer.duration && (
            <li
              onClick={() => onSetTimer(null)}
              className="p-4 bg-red-500/30 text-red-300 rounded-lg hover:bg-red-500/40 cursor-pointer text-center font-light"
            >
              Cancelar Timer
            </li>
          )}
          {timers.map((timer) => (
            <li
              key={timer.label}
              onClick={() => onSetTimer(timer.seconds)}
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                activeTimer.duration === timer.seconds
                  ? "bg-[#FFD54F] text-[#3A1B57]"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <span className="font-light">{timer.label}</span>
              {activeTimer.duration === timer.seconds && <CheckCircle />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
const MantraVisualizer = memo(({ mantra, isPlaying }) => {
  const { isSubscribed } = useContext(AppContext);
  const [images, setImages] = useState([mantra.imageSrc]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasStartedGenerating = useRef(false);
  useEffect(() => {
    const generateImages = async () => {
      if (hasStartedGenerating.current || !mantra.imagePrompt || !isSubscribed)
        return;
      hasStartedGenerating.current = true;
      try {
        const payload = {
          instances: [{ prompt: mantra.imagePrompt }],
          parameters: { sampleCount: 4 },
        };
        const apiKey = firebaseConfig.apiKey;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`API request failed`);
        const result = await response.json();
        if (result.predictions && result.predictions.length > 0) {
          const newImageUrls = result.predictions.map(
            (pred) => `data:image/png;base64,${pred.bytesBase64Encoded}`
          );
          setImages((prev) => [...prev, ...newImageUrls]);
        }
      } catch (error) {
        console.error("Slideshow Image Generation Error:", error);
      } finally {
        hasStartedGenerating.current = false;
      }
    };
    if (isPlaying) {
      generateImages();
    }
  }, [isPlaying, mantra.imagePrompt, isSubscribed]);
  useEffect(() => {
    let interval;
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images]);
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-[20000ms] ease-linear ${
          isPlaying ? "animate-ken-burns-outer" : ""
        }`}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
            style={{
              backgroundImage: `url(${src})`,
              opacity: index === currentIndex ? 0.35 : 0,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <style>{` @keyframes ken-burns-outer { 0% { transform: scale(1) translate(0, 0); } 50% { transform: scale(1.15) translate(2%, -2%); } 100% { transform: scale(1) translate(0, 0); } } .animate-ken-burns-outer { animation: ken-burns-outer 20s ease-in-out infinite; } `}</style>
    </div>
  );
});
const CalendarModal = ({ isOpen, onClose, onDayClick }) => {
  const { allEntries } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const practicedDays = useMemo(
    () =>
      new Set(
        (allEntries || [])
          .filter((e) => e.practicedAt?.toDate)
          .map((entry) => entry.practicedAt.toDate().toDateString())
      ),
    [allEntries]
  );
  if (!isOpen) return null;
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const changeMonth = (offset) =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft />
          </button>
          <h2 className="text-xl text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="transform rotate-180" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm text-white/60">
          {daysOfWeek.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2 text-center">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day + 1
            );
            const isPracticed = practicedDays.has(date.toDateString());
            const isToday = date.toDateString() === new Date().toDateString();
            const buttonClasses = `w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm hover:bg-white/20 ${
              isToday && isPracticed
                ? "bg-yellow-400/20 ring-2 ring-[#FFD54F]"
                : isToday
                ? "ring-2 ring-[#FFD54F] bg-white/10"
                : isPracticed
                ? "bg-white/10 border-2 border-[#FFD54F]"
                : "bg-white/10"
            }`;
            return (
              <button
                key={day}
                onClick={() => onDayClick(date)}
                className={buttonClasses}
              >
                {isToday ? (
                  <Flame className="text-yellow-400" size={16} />
                ) : (
                  day + 1
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const DayDetailModal = ({ isOpen, onClose, date, onAddNote }) => {
  const { allEntries } = useContext(AppContext);
  if (!isOpen) return null;
  const entriesForDay = (allEntries || []).filter(
    (entry) =>
      entry.practicedAt?.toDate().toDateString() === date.toDateString()
  );
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl text-white">
          Atividades de {date.toLocaleDateString("pt-BR")}
        </h2>
        <div className="max-h-48 overflow-y-auto space-y-3 pr-2 mt-4">
          {entriesForDay.length > 0 ? (
            entriesForDay.map((entry) => {
              const mantra =
                entry.type === "mantra"
                  ? MANTRAS_DATA.find((m) => m.id === entry.mantraId)
                  : null;
              return (
                <div
                  key={entry.id}
                  className="bg-black/20 p-3 rounded-lg text-sm"
                >
                  {mantra ? (
                    <p className="font-light">
                      <span className="text-[#FFD54F] font-normal">
                        {mantra.nome}:
                      </span>{" "}
                      {entry.feelings}
                    </p>
                  ) : (
                    <p className="font-light">
                      <span className="text-[#FFD54F] font-normal">
                        Anotação:
                      </span>{" "}
                      {entry.note}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-white/70 text-sm font-light">
              Nenhuma prática registrada para este dia.
            </p>
          )}
        </div>
        <div className="pt-4 border-t border-white/10 mt-4">
          <button onClick={onAddNote} className="w-full btn-secondary">
            Adicionar Anotação
          </button>
        </div>
      </div>
    </div>
  );
};
const NoteEditorScreen = ({
  onSave,
  onCancel,
  noteToEdit,
  dateForNewNote,
  journeyPrompt = null,
}) => {
  const { userId, fetchAllEntries, recalculateStreak} =
    useContext(AppContext);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setNote(noteToEdit ? noteToEdit.note : "");
  }, [noteToEdit]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!note.trim() || !userId) return;
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      if (journeyPrompt) {
        onSave(note.trim());
        return;
      }

      if (noteToEdit) {
        const noteRef = doc(db, `users/${userId}/entries`, noteToEdit.id);
        await setDoc(noteRef, { note: note.trim() }, { merge: true });
        setStatus({ type: "success", message: "Anotação atualizada!" });
      } else {
        const noteData = {
          type: "note",
          note: note.trim(),
          practicedAt: Timestamp.fromDate(dateForNewNote),
        };
        await addDoc(collection(db, `users/${userId}/entries`), noteData);
        setStatus({ type: "success", message: "Anotação salva!" });
      }
      // Apenas busca as entradas. O useEffect no AppProvider cuidará do recálculo.
      fetchAllEntries(userId);
      setNote("");
      setTimeout(() => onSave(), 1500);
    } catch (error) {
      console.error("Error saving note:", error);
      setStatus({ type: "error", message: "Erro ao salvar anotação." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define o título e o subtítulo com base no contexto (jornada ou anotação normal)
  const pageTitle = journeyPrompt
    ? "Reflexão do Dia"
    : noteToEdit
    ? "Editar Anotação"
    : "Nova Anotação";
  const pageSubtitle =
    journeyPrompt ||
    "Um espaço para registrar seus pensamentos, sentimentos e sincronicidades do dia.";
  const placeholderText = journeyPrompt
    ? "Escreva sua reflexão aqui..."
    : "Escreva seus pensamentos, sentimentos ou insights do dia...";

  return (
    <div className="page-container">
      <PageTitle subtitle={pageSubtitle}>{pageTitle}</PageTitle>
      <form
        onSubmit={handleSave}
        className="w-full max-w-lg mx-auto glass-card space-y-8"
      >
        <div className="space-y-3">
          <label className="text-white/80 flex items-center gap-2 font-light">
            <BookOpen size={18} className="text-[#FFD54F]/80" />
            <span>
              Sua anotação para{" "}
              {noteToEdit
                ? noteToEdit.practicedAt.toDate().toLocaleDateString("pt-BR")
                : dateForNewNote.toLocaleDateString("pt-BR")}
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="textarea-field"
            rows="8"
            placeholder={placeholderText}
            required
          />
        </div>
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full modern-btn-primary h-14"
              disabled={isSubmitting || !note.trim()}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
          {status.message && (
            <p
              className={`p-3 rounded-lg text-center text-sm ${
                status.type === "success"
                  ? "bg-green-500/30 text-green-300"
                  : "bg-red-500/30 text-red-400"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
const RepetitionModal = ({ isOpen, onClose, onStart, mantra }) => {
  if (!isOpen) return null;
  const repetitionOptions = [12, 24, 36, 48, 108];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl text-white text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {mantra.nome}
        </h2>
        <p className="text-white/70 my-4 text-center font-light">
          Quantas vezes você gostaria de repetir este mantra?
        </p>
        <div className="space-y-3">
          {repetitionOptions.map((reps) => (
            <button
              key={reps}
              onClick={() => onStart(reps)}
              className="w-full btn-secondary"
            >
              {reps} repetições
            </button>
          ))}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- INÍCIO: NOVOS COMPONENTES E TELAS PARA "MEU SANTUÁRIO" ---
const MeuSantuarioScreen = ({
  onStartPlaylist,
  onEditPlaylist,
  onStartAudio,
  onAddAudio,
  onAddPlaylist,
  openPremiumModal,
}) => {
  const { isSubscribed, meusAudios, playlists } = useContext(AppContext);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { userId, fetchMeusAudios, fetchPlaylists } = useContext(AppContext);
  const handleDelete = async () => {
    if (!itemToDelete || !userId) return;
    const { type, item } = itemToDelete;

    try {
      if (type === "audio") {
        await deleteDoc(doc(db, `users/${userId}/meusAudios`, item.id));
        if (item.storagePath) {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef);
        }
        const playlistsRef = collection(db, `users/${userId}/playlists`);
        const playlistsSnapshot = await getDocs(playlistsRef);
        const updatePromises = [];
        playlistsSnapshot.forEach((playlistDoc) => {
          const playlistData = playlistDoc.data();
          const oldSequencia = playlistData.sequencia || [];
          if (oldSequencia.some((track) => track.audioId === item.id)) {
            const newSequencia = oldSequencia.filter(
              (track) => track.audioId !== item.id
            );
            const playlistDocRef = doc(
              db,
              `users/${userId}/playlists`,
              playlistDoc.id
            );
            updatePromises.push(
            setDoc(playlistDocRef, { sequencia: newSequencia }, { merge: true })
            );

          }
        });
        await Promise.all(updatePromises);
        await fetchMeusAudios(userId);
        await fetchPlaylists(userId);
      } else if (type === "playlist") {
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
      .map((item) => {
        const audio = meusAudios.find((a) => a.id === item.audioId);
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
        <PageTitle subtitle="Seu espaço sagrado para criar e praticar com seus próprios áudios e sequências.">
          Meu Santuário
        </PageTitle>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl text-white/90"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Meus Áudios
            </h2>
            <button
              onClick={handleAddAudioClick}
              className="modern-btn-primary !p-2.5 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
          {meusAudios.length > 0 ? (
            meusAudios.map((audio) => (
              <div
                key={audio.id}
                className="glass-card !p-4 flex justify-between items-center"
              >
                <p className="text-white/90">{audio.nome}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartAudio(audio)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Play size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setItemToDelete({ type: "audio", item: audio })
                    }
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card text-center !py-8">
              <Mic2 className="mx-auto h-10 w-10 text-white/50" />
              <p className="mt-3 text-white/70">
                Nenhum áudio gravado ou importado.
              </p>
              <p className="text-sm text-white/50 font-light">
                Clique no '+' para adicionar seu primeiro áudio.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-8">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl text-white/90"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Minhas Playlists
            </h2>
            <button
              onClick={handleAddPlaylistClick}
              className="modern-btn-primary !p-2.5 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="glass-card !p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-white/90">{playlist.nome}</p>
                  <p className="text-xs text-white/60 font-light">
                    {playlist.sequencia?.length || 0} áudio(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartPlaylist(playlist)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Play size={18} />
                  </button>
                  <button
                    onClick={() => onEditPlaylist(playlist)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setItemToDelete({ type: "playlist", item: playlist })
                    }
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card text-center !py-8">
              <Music className="mx-auto h-10 w-10 text-white/50" />
              <p className="mt-3 text-white/70">Nenhuma playlist criada.</p>
              <p className="text-sm text-white/50 font-light">
                Crie sequências de prática personalizadas.
              </p>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title={`Excluir ${
          itemToDelete?.type === "audio" ? "Áudio" : "Playlist"
        }`}
        message={`Tem certeza que deseja excluir "${itemToDelete?.item.nome}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
};
const AudioCreatorModal = ({ isOpen, onClose }) => {
  const { userId, fetchMeusAudios } = useContext(AppContext);
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setNome("");
      setStatus("idle");
      setError("");
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const options = {};
        const supportedTypes = ["audio/mp4", "audio/webm", "audio/ogg"];
        const supportedType = supportedTypes.find((type) =>
          MediaRecorder.isTypeSupported(type)
        );

        if (supportedType) {
          options.mimeType = supportedType;
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current.mimeType,
          });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          setStatus("recorded");
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
        setStatus("recording");
      } catch (err) {
        console.error("Erro ao acessar microfone:", err);
        setError(
          "Não foi possível acessar o microfone. Verifique as permissões do navegador."
        );
        setStatus("error");
      }
    } else {
      setError("Gravação não é suportada neste navegador.");
      setStatus("error");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
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
      setStatus("recorded");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setError("");
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
    setStatus("saving");
    setError("");

    try {
      const fileExtension = audioBlob.type.split("/")[1].split(";")[0];
      const fileName = `${Date.now()}_${nome.replace(
        /\s+/g,
        "_"
      )}.${fileExtension}`;
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
      setStatus("success");
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error("Erro ao salvar áudio:", err);
      setError("Falha ao salvar o áudio. Tente novamente.");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-xl text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Adicionar Novo Áudio
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Nome do seu mantra ou áudio"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-field"
          />

          {status === "idle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleStartRecording}
                className="btn-secondary h-24 flex flex-col items-center justify-center gap-2"
              >
                <Mic2 />
                <span>Gravar com Microfone</span>
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="btn-secondary h-24 flex flex-col items-center justify-center gap-2"
              >
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

          {status === "recording" && (
            <div className="text-center space-y-4">
              <p className="text-white/80 animate-pulse">Gravando...</p>
              <button
                onClick={handleStopRecording}
                className="modern-btn-primary !bg-red-500 !text-white"
              >
                <Pause /> Pausar Gravação
              </button>
            </div>
          )}

          {status === "recorded" && (
            <div className="space-y-4">
              <audio src={audioUrl} controls className="w-full"></audio>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="w-full modern-btn-primary"
                >
                  <Save /> Salvar
                </button>
                <button onClick={handleReset} className="w-full btn-secondary">
                  Descartar
                </button>
              </div>
            </div>
          )}

          {status === "saving" && (
            <p className="text-center text-white/80 animate-pulse">
              Salvando...
            </p>
          )}
          {status === "success" && (
            <p className="text-center text-green-400">
              Áudio salvo com sucesso!
            </p>
          )}
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
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl text-white text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {audio.nome}
        </h2>
        <p className="text-white/70 my-4 text-center font-light">
          Quantas vezes você gostaria de repetir este áudio?
        </p>
        <input
          type="number"
          value={repetitions}
          onChange={(e) => setRepetitions(e.target.value)}
          min="1"
          max="108"
          className="input-field text-center"
        />
        <div className="flex gap-4 mt-4">
          <button onClick={onClose} className="w-full btn-secondary">
            Cancelar
          </button>
          <button onClick={handleStart} className="w-full modern-btn-primary">
            Iniciar
          </button>
        </div>
      </div>
    </div>
  );
};
// INÍCIO DO COMPONENTE 'CustomAudioPlayer'
const CustomAudioPlayer = ({ playlist, singleAudio, repetitions, onClose }) => {
  const { logPlaybackActivity } = useContext(AppContext); // <-- FUNÇÃO OBTIDA DO CONTEXTO
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [repetitionCount, setRepetitionCount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const isPlaylist = !!playlist;
  const currentTrack = isPlaylist
    ? playlist.sequencia[currentTrackIndex]
    : { audio: singleAudio, repeticoes: repetitions };
  const audioSrc = currentTrack?.audio?.downloadURL;

  const advanceTrack = useCallback(() => {
    if (isPlaylist && currentTrackIndex < playlist.sequencia.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [isPlaylist, currentTrackIndex, playlist, onClose]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    // Loga a reprodução da faixa se for uma playlist
    if (isPlaylist && logPlaybackActivity) {
      const currentTrackForLog = playlist.sequencia[currentTrackIndex];
      if (currentTrackForLog) {
        logPlaybackActivity({
          customAudioId: currentTrackForLog.audio.id,
          source: 'santuario_playlist'
        });
      }
    }
    
    setRepetitionCount(1);
    setCurrentTime(0);
    setDuration(0);
    audio.play().catch((e) => {
      console.error("Erro ao iniciar a reprodução do áudio:", e);
      setIsPlaying(false);
    });
  }, [audioSrc]);

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  let playCount = 0;
  const total = Number(currentTrack.repeticoes) || 1;

  const handleAudioEnd = () => {
    playCount += 1;
    setRepetitionCount(playCount);

    if (playCount >= total) {
      audio.loop = false;      // desliga o loop
      audio.pause();           // garante que pare
      advanceTrack();          // passa para a próxima
    } else {
      audio.currentTime = 0;   // reinicia imediatamente
      audio.play();            // toca de novo
    }
  };

  audio.addEventListener("ended", handleAudioEnd);

  return () => {
    audio.removeEventListener("ended", handleAudioEnd);
  };
}, [audioSrc, advanceTrack, currentTrack.repeticoes]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  if (!audioSrc) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center screen-animation p-6 player-background-gradient">
      <div className="absolute top-6 right-6">
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg"
        >
          <X size={22} />
        </button>
      </div>
      <div className="text-center text-white space-y-4 w-full max-w-md">
        {isPlaylist && <p className="text-sm text-white/70">{playlist.nome}</p>}
        <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          {currentTrack.audio.nome}
        </h2>
        <div className="mt-4 px-3 py-1 bg-black/30 rounded-full text-sm font-light flex items-center justify-center gap-2 max-w-min mx-auto">
          <Repeat size={14} />
          <span className="whitespace-nowrap">
            {repetitionCount} / {currentTrack.repeticoes}
          </span>
        </div>
        {isPlaylist && (
          <p className="text-xs text-white/60">
            Faixa {currentTrackIndex + 1} de {playlist.sequencia.length}
          </p>
        )}
      </div>
      <div className="w-full max-w-sm flex flex-col items-center gap-3 mt-8">
        <div className="w-full">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current)
                audioRef.current.currentTime = e.target.value;
            }}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs font-light text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <button
          onClick={togglePlayPause}
          className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-lg text-white flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all"
        >
          {isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>
      </div>
      <audio
      ref={audioRef}
      src={audioSrc}
      preload="auto"
      playsInline
      loop
    />
  </div>
  );
};

// FIM DO COMPONENTE 'CustomAudioPlayer'

const ChakraScreen = ({ preselectChakraId, onComplete }) => {
  const [selectedChakra, setSelectedChakra] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const backgroundAudioRef = useRef(null);
  const mantraAudioRef = useRef(null);
  const chakraPositions = {
    1: "17%",
    2: "27%",
    3: "37%",
    4: "47%",
    5: "57%",
    6: "67%",
    7: "77%",
  };

  const handleSelectChakra = useCallback((chakra) => {
    setSelectedChakra(chakra);
    setIsPlaying(true);
  }, []);

  // Efeito para pré-selecionar o chakra se vier de uma jornada
  useEffect(() => {
    if (preselectChakraId) {
      const chakraToSelect = CHAKRAS_DATA.find(
        (c) => c.id === preselectChakraId
      );
      if (chakraToSelect) {
        // Timeout para dar tempo da tela animar antes do som começar
        setTimeout(() => {
          handleSelectChakra(chakraToSelect);
        }, 500);
      }
    }
  }, [preselectChakraId, handleSelectChakra]);

  useEffect(() => {
    if (!backgroundAudioRef.current) {
      backgroundAudioRef.current = new Audio(
        "https://cdn.jsdelivr.net/gh/PaulaF7/Clube-dos-Mantras@main/som-fundo.mp3"
      );
      backgroundAudioRef.current.loop = true;
      backgroundAudioRef.current.volume = 0.5;
    }
    if (!isPlaying && !selectedChakra) {
      backgroundAudioRef.current
        .play()
        .catch((e) => console.error("Erro ao tocar música de fundo:", e));
    }
    return () => {
      backgroundAudioRef.current?.pause();
    };
  }, [isPlaying, selectedChakra]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
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
      backgroundAudioRef.current?.pause();
      mantraAudioRef.current
        .play()
        .catch((e) => console.error("Erro ao tocar áudio do chakra:", e));
    } else {
      mantraAudioRef.current.pause();
      if (!onComplete) {
        // Só volta a tocar o som de fundo se não for uma jornada
        backgroundAudioRef.current
          ?.play()
          .catch((e) => console.error("Erro ao retomar som de fundo:", e));
      }
    }
    // Limpeza ao desmontar o componente
    return () => {
      mantraAudioRef.current?.pause();
    };
  }, [isPlaying, selectedChakra, onComplete]);

  const orderedChakras = [...CHAKRAS_DATA].reverse();
  return (
    <div
      className="page-container"
      style={{
        backgroundColor: selectedChakra?.color
          ? `${selectedChakra.color}20`
          : "transparent",
        transition: "background-color 1s ease",
      }}
    >
      <PageTitle subtitle="Conecte-se e equilibre seus centros de energia através da meditação sonora.">
        Meditação de Chakras
      </PageTitle>
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex w-full items-center justify-center space-x-4 md:space-x-8">
          <div className="relative w-full max-w-[150px] md:max-w-[200px] h-96 flex items-center justify-center flex-shrink-0">
            <img
              src="https://i.postimg.cc/fkQNDZH4/mente.png"
              alt="Figura humana com chakras"
              className="h-full object-contain"
            />
            {CHAKRAS_DATA.map((chakra) => (
              <div
                key={chakra.id}
                style={{
                  bottom: chakraPositions[chakra.id],
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: chakra.color,
                  filter:
                    selectedChakra?.id === chakra.id
                      ? `drop-shadow(0 0 8px ${chakra.color})`
                      : "none",
                  zIndex: 10 - chakra.id,
                  marginLeft: "-0.7rem",
                }}
                className={`absolute left-[50%] w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-500 ${
                  selectedChakra?.id === chakra.id && isPlaying
                    ? "chakra-pulse-effect"
                    : ""
                }`}
                onClick={() => handleSelectChakra(chakra)}
              ></div>
            ))}
          </div>
          <div
            className="flex flex-col space-y-2 p-2 w-full max-w-[150px] flex-shrink-0"
            style={{ height: "384px" }}
          >
            {orderedChakras.map((chakra) => (
              <div
                key={chakra.id}
                onClick={() => handleSelectChakra(chakra)}
                className={`glass-card !p-3 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-transform duration-300 ${
                  selectedChakra?.id === chakra.id
                    ? "bg-white/10 scale-105"
                    : "bg-white/5 hover:scale-[1.02]"
                }`}
                style={{
                  flex: "1 1 auto",
                  borderColor:
                    selectedChakra?.id === chakra.id
                      ? chakra.color
                      : "rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    selectedChakra?.id === chakra.id
                      ? `0 0 10px ${chakra.color}`
                      : "none",
                  borderWidth: "2px",
                }}
              >
                <p className="text-sm font-light text-white/90 text-center">
                  {chakra.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        {selectedChakra && (
          <div className="glass-card w-full max-w-md text-center space-y-4 mt-8">
            <h3
              className="text-xl text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {selectedChakra.name}
            </h3>
            <div className="flex justify-center items-center gap-4">
              <PlayCircle size={64} style={{ color: selectedChakra.color }} />
              <div>
                <p className="text-white/80 text-sm font-light">
                  Mantra:{" "}
                  <span className="font-medium">{selectedChakra.mantra}</span>
                </p>
                <p className="text-white/80 text-sm font-light">
                  Mudra:{" "}
                  <span className="font-medium">{selectedChakra.mudra}</span>
                </p>
              </div>
            </div>
            <button
              onClick={togglePlayPause}
              className="w-full modern-btn-primary !py-2 !px-4 !text-sm flex items-center justify-center"
            >
              {isPlaying ? (
                <>
                  <Pause size={20} /> Pausar Meditação
                </>
              ) : (
                <>
                  <Play size={20} /> Retomar Meditação
                </>
              )}
            </button>
          </div>
        )}
        {/* --- BOTÃO DE CONCLUSÃO ADICIONADO --- */}
        {selectedChakra && onComplete && (
          <div className="mt-4 w-full max-w-md">
            <button
              onClick={onComplete}
              className="w-full modern-btn-primary !py-2 !text-sm flex items-center justify-center gap-2 !bg-green-500/80 hover:!filter-none"
            >
              <CheckCircle size={18} />{" "}
              {/* Opcional: Reduzir o ícone para combinar */}
              Concluir e Voltar para Jornada
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Adicione estes três novos componentes ANTES do componente AstrologerScreen

const SupportAstrologerCard = ({ onClick }) => (
  <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm rounded-lg p-4 text-center">
    <p className="font-light">
      Gostou da resposta? Sua jornada pode continuar.
    </p>
    <button
      onClick={onClick}
      className="mt-2 font-semibold text-white bg-yellow-400/20 hover:bg-yellow-400/30 px-4 py-2 rounded-full transition-colors"
    >
      Ofereça um café ao astrólogo
    </button>
  </div>
);

// Substitua o componente PayOrSubscribeModal inteiro por este
const PayOrSubscribeModal = ({
  isOpen,
  onClose,
  onGoToCheckout,
  onSubscribe,
}) => {
  // ALTERADO: onPayWithPix virou onGoToCheckout
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-2xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Continue sua Jornada
        </h2>
        <p className="text-white/70 my-3 font-light text-base">
          Sua pergunta gratuita foi utilizada. Para continuar recebendo
          orientação, escolha uma opção:
        </p>
        <div className="flex flex-col gap-3 mt-6">
          {/* ALTERADO: O onClick agora usa a nova prop 'onGoToCheckout' e o texto está mais claro */}
          <button
            onClick={onGoToCheckout}
            className="w-full modern-btn-primary !py-3 !text-base"
          >
            Comprar crédito para 1 pergunta
          </button>
          <button
            onClick={onSubscribe}
            className="w-full btn-secondary !py-3 !text-sm !font-normal"
          >
            Virar Premium (Perguntas Ilimitadas)
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
          </div>
          <p className="text-xs text-center text-white/60 -mt-2">
            Após a confirmação do pagamento, sua pergunta será liberada
            automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

const SupportModal = ({ isOpen, onClose }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Copiar Código");

  const handleCopy = (pixCode) => {
    navigator.clipboard.writeText(pixCode).then(
      () => {
        setCopyStatus("Copiado!");
        setTimeout(() => setCopyStatus("Copiar Código"), 2000);
      },
      () => {
        setCopyStatus("Falhou!");
        setTimeout(() => setCopyStatus("Copiar Código"), 2000);
      }
    );
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedTier(null);
      setCopyStatus("Copiar Código");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[51] p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-white/70" />
        </button>
        <h2
          className="text-2xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Um Café para o Astrólogo
        </h2>
        <p className="text-white/70 my-3 font-light text-base">
          Seu apoio é muito apreciado! O conhecimento astrológico sempre te
          recompensará de volta.
        </p>

        {!selectedTier ? (
          <div className="flex flex-col gap-3 mt-6">
            {PIX_TIERS.map((tier) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(tier)}
                className="w-full btn-secondary !py-3 !text-base !justify-start !text-left !gap-4 flex items-center"
              >
                <tier.icon className="h-6 w-6 text-[#FFD54F]/80 flex-shrink-0" />
                <span>
                  {tier.name} - {tier.value}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-lg text-white">
              Apoio:{" "}
              <span className="text-[#FFD54F]">
                {selectedTier.name} ({selectedTier.value})
              </span>
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                selectedTier.pixCode
              )}&bgcolor=4A148C&color=FFFFFF&qzone=1`}
              alt="QR Code PIX"
              className="mx-auto rounded-lg border-4 border-white/20"
            />
            <div className="p-3 bg-black/20 rounded-lg text-left">
              <label className="text-xs text-white/60">PIX Copia e Cola</label>
              <p className="text-xs text-white break-all">
                {selectedTier.pixCode}
              </p>
            </div>
            <button
              onClick={() => handleCopy(selectedTier.pixCode)}
              className="w-full modern-btn-primary !py-3"
            >
              {copyStatus}
            </button>
            <button
              onClick={() => setSelectedTier(null)}
              className="text-sm text-white/60 hover:underline py-2"
            >
              ← Escolher outro valor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- TELA DO ASTROLOGER ATUALIZADA COM LÓGICA DE PERGUNTA GRÁTIS ---
// Substitua o seu AstrologerScreen por esta versão completa e correta
const AstrologerScreen = ({ openPremiumModal }) => {
    // --- MUDANÇA PRINCIPAL: Pegando 'perguntasAvulsas' do contexto ---
    const { 
        userId, 
        isSubscribed, 
        freeQuestionUsed, 
        astroProfile, 
        setAstroProfile, 
        astroHistory,
        perguntasAvulsas // <-- O valor global, vindo do AppProvider
    } = useContext(AppContext);

    console.log("AstrologerScreen RENDERIZOU. Créditos do CONTEXTO:", perguntasAvulsas);

    // Estados que a tela ainda controla
    const [question, setQuestion] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(!astroProfile);
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [isPayOrSubscribeModalOpen, setIsPayOrSubscribeModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    
    const PERGUNTA_AVULSA_CHECKOUT_URL = 'https://pay.kiwify.com.br/psyk1pM';

    // A lógica de `canAsk` agora usa o valor do contexto
    const canAsk = isSubscribed || !freeQuestionUsed || perguntasAvulsas > 0;
    const needsToPayOrSubscribe = !isSubscribed && freeQuestionUsed && perguntasAvulsas === 0;

    // Garante que apenas no carregamento inicial, quando já existe um perfil,
// o modo de edição seja fechado. NÃO desliga o modo de edição a cada
// alteração do astroProfile (isso era o que travava a edição ao digitar).
const initialProfileLoadedRef = useRef(false);

useEffect(() => {
    if (astroProfile && !initialProfileLoadedRef.current) {
        setIsEditingProfile(false);
        initialProfileLoadedRef.current = true;
    }
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
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { astroProfile }, { merge: true });
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
            } else {
                throw new Error(result.data.message || 'Erro ao obter resposta do backend.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setStatusMessage(err.message || 'Ocorreu um erro. Verifique seus créditos ou tente mais tarde.');
        } finally {
             setTimeout(() => setStatusMessage(''), 5000);
        }
    };
    
    const handleSave = async (id) => {
        try {
        await setDoc(doc(db, `users/${userId}/astroHistory/${id}`), { saved: true }, { merge: true });
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

    const handleMarkAsRead = async (historyId) => {
        if (!userId) return;
        try {
            const historyRef = doc(db, `users/${userId}/astroHistory`, historyId);
            await setDoc(historyRef, { isRead: true }, { merge: true });
        } catch (error) {
            console.error("Erro ao marcar como lido:", error);
        }
    };
    
    const handlePrimaryAction = () => {
        if (canAsk) {
            handleAskQuestion();
        } else if (needsToPayOrSubscribe) {
            setIsPayOrSubscribeModalOpen(true);
        }
    };
    
    const isFormComplete = astroProfile?.nomeCompleto && astroProfile?.cidadeNascimento && astroProfile?.dataNascimento && astroProfile?.horaNascimento;

    return (
        <>
            <div className="page-container">
                <PageTitle subtitle="Receba uma análise astrológica profunda e exclusiva, revisada por um especialista.">Pergunte ao Astrólogo</PageTitle>

                <div className="w-full max-w-lg mx-auto glass-card space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Seu Mapa Astral</h2>
                        <button onClick={() => setIsEditingProfile(true)} className="p-2 rounded-full text-white/60 hover:bg-white/10" disabled={isEditingProfile}>
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
                        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="textarea-field" rows="4" placeholder="Faça sua pergunta sobre sua missão de vida, carreira ou relacionamentos..." disabled={!canAsk} />
                        
                        <button onClick={handlePrimaryAction} className="w-full modern-btn-primary h-14" disabled={status === 'submitting'}>
                        {status === 'submitting' ? 'Enviando...' : (needsToPayOrSubscribe ? 'Faça uma nova pergunta' : 'Enviar Pergunta')}
                        </button>


                        {!isSubscribed && !freeQuestionUsed && (
                            <p className="text-center text-sm text-green-400 font-light">🎁 Você tem direito a 1 pergunta grátis!</p>
                        )}
                        
                        {!isSubscribed && perguntasAvulsas > 0 && (
                             <p className="text-center text-sm text-green-400 font-light">Você possui {perguntasAvulsas} pergunta(s) disponível(is).</p>
                        )}

                        {statusMessage && (
                            <p className={`p-3 rounded-lg text-center text-sm ${ status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400' }`}>{statusMessage}</p>
                        )}
                    </div>
                </div>
                
                <div className="w-full max-w-lg mx-auto space-y-4 pt-8">
                    <h2 className="text-xl text-white/90" style={{ fontFamily: "var(--font-display)" }}>Histórico de Perguntas</h2>
                    {astroHistory && astroHistory.length > 0 ? (
                        astroHistory.map((item, index) => (
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

                                        {index === 0 && !isSubscribed && !item.isRead && (
                                            <div className="text-center mt-4">
                                                <button onClick={() => handleMarkAsRead(item.id)} className="btn-secondary !py-2 !px-4 !text-sm flex items-center justify-center gap-2">
                                                <CheckCircle size={16} />
                                                <span>Li e agradeço pela orientação</span>
                                                </button>
                                            </div>
                                        )}
                                        {index === 0 && !isSubscribed && item.isRead && (
                                            <SupportAstrologerCard onClick={() => setIsSupportModalOpen(true)} />
                                        )}
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

            <PayOrSubscribeModal 
                isOpen={isPayOrSubscribeModalOpen}
                onClose={() => setIsPayOrSubscribeModalOpen(false)}
                onGoToCheckout={() => {
                    window.open(PERGUNTA_AVULSA_CHECKOUT_URL, '_blank');
                    setIsPayOrSubscribeModalOpen(false);
                }}
                onSubscribe={() => { setIsPayOrSubscribeModalOpen(false); openPremiumModal(); }}
            />
            <SupportModal 
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
            />
        </>
    );
};

// --- INÍCIO: NOVAS TELAS E COMPONENTES PARA JORNADAS ---
const JourneysListScreen = ({ setActiveScreen, openPremiumModal }) => {
  const { journeyProgress, isSubscribed } = useContext(AppContext);

  const handleSelectJourney = (journey) => {
    if (journey.isPremium && !isSubscribed) {
      openPremiumModal();
    } else {
      setActiveScreen("journeyDetail", { journeyId: journey.id });
    }
  };

  return (
    <div className="page-container">
      <PageTitle subtitle="Siga sequências guiadas de práticas diárias para atingir objetivos específicos.">
        Jornadas de Prática
      </PageTitle>
      <div className="space-y-4">
        {JOURNEYS_DATA.map((journey) => {
          const progress =
            journeyProgress[journey.id]?.completedDays?.length || 0;
          const isLocked = journey.isPremium && !isSubscribed;
          return (
            <div
              key={journey.id}
              onClick={() => handleSelectJourney(journey)}
              className="glass-card !p-5 text-left clickable relative overflow-hidden"
            >
              {isLocked && (
                <div className="absolute top-2 right-2 bg-black/30 p-1.5 rounded-full">
                  <Lock className="h-4 w-4 text-white/70" />
                </div>
              )}
              <h3
                className="text-lg text-[#FFD54F]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {journey.title}
              </h3>
              <p className="text-white/80 my-2 font-light text-sm">
                {journey.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
                <span>{journey.days.length} DIAS</span>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div
                    className="bg-[#FFD54F] h-2 rounded-full"
                    style={{
                      width: `${(progress / journey.days.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span>
                  {progress}/{journey.days.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const JourneyDetailScreen = ({
  journeyId,
  setActiveScreen,
  onStartJourneyTask,
}) => {
  const { journeyProgress } = useContext(AppContext);
  const journey = JOURNEYS_DATA.find((j) => j.id === journeyId);

  if (!journey)
    return (
      <div className="page-container text-center">Jornada não encontrada.</div>
    );

  const completedDays = journeyProgress[journey.id]?.completedDays || [];
  const currentDay = completedDays.length + 1;
  // --- LÓGICA DE MELHORIA ADICIONADA AQUI ---
  const isJourneyComplete = completedDays.length === journey.days.length;

  const getTaskInfo = (dayInfo) => {
    switch (dayInfo.type) {
      case "mantra":
        return {
          icon: <Mic2 size={18} />,
          text: `Mantra - ${dayInfo.details.repetitions} repetições`,
        };
      case "gratitude":
        return { icon: <Heart size={18} />, text: "Registro de Gratidão" };
      case "reflexao_guiada":
        return { icon: <MessageSquare size={18} />, text: "Reflexão Guiada" };
      case "meditacao_chakra":
        return { icon: <Circle size={18} />, text: "Meditação de Chakra" };
      case "consulta_oraculo":
        return {
          icon: <BrainCircuit size={18} />,
          text: "Consulta ao Oráculo",
        };
      case "acao_consciente":
        return { icon: <Leaf size={18} />, text: "Ação Consciente" };
      case "santuario_pessoal":
        return { icon: <Music size={18} />, text: "Prática do Santuário" };
      default:
        return { icon: <Star size={18} />, text: "Tarefa Especial" };
    }
  };

  return (
    <div className="page-container">
      <button
        onClick={() => setActiveScreen("journeysList")}
        className="flex items-center gap-2 text-sm text-[#FFD54F] mb-4"
      >
        <ChevronLeft size={16} /> Voltar para Jornadas
      </button>
      <PageTitle subtitle={journey.description}>{journey.title}</PageTitle>
      <div className="space-y-3">
        {journey.days.map((dayInfo) => {
          const isCompleted = completedDays.includes(dayInfo.day);
          const isCurrent = !isJourneyComplete && dayInfo.day === currentDay;
          // Um dia só está bloqueado se for futuro E a jornada não estiver completa.
          const isLocked = !isJourneyComplete && dayInfo.day > currentDay;
          const taskInfo = getTaskInfo(dayInfo);

          return (
            <div
              key={dayInfo.day}
              // Permite o clique se não estiver bloqueado (ou seja, completo ou atual)
              onClick={() =>
                !isLocked && onStartJourneyTask(journey.id, dayInfo)
              }
              className={`glass-card !p-4 flex items-center justify-between transition-all 
                                ${isCurrent ? "border-[#FFD54F]" : ""}
                                ${isCompleted ? "opacity-70" : ""}
                                ${
                                  !isLocked
                                    ? "clickable"
                                    : "opacity-40 cursor-default"
                                }`}
            >
              <div className="flex items-center gap-4">
                {isCompleted ? (
                  <CheckCircle size={24} className="text-green-400" />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#FFD54F]/20 text-[#FFD54F]"
                        : "bg-black/20 text-white/50"
                    }`}
                  >
                    {dayInfo.day}
                  </div>
                )}
                <div>
                  <p
                    className={`text-base ${
                      isCurrent ? "text-white" : "text-white/80"
                    }`}
                  >
                    {dayInfo.title}
                  </p>
                  <p className="text-xs text-white/60 font-light flex items-center gap-1.5">
                    {taskInfo.icon} {taskInfo.text}
                  </p>
                </div>
              </div>
              {!isLocked && <ChevronLeft className="transform rotate-180" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- FIM: NOVAS TELAS E COMPONENTES PARA JORNADAS ---

// --- NOVA TELA "MAIS" PARA AGRUPAR ITENS DE NAVEGAÇÃO ---
const MoreScreen = ({ setActiveScreen }) => {
  const secondaryNavItems = [
    { id: "journeysList", icon: Map, label: "Jornadas de Prática" },
    { id: "chakras", icon: Circle, label: "Meditação de Chakras" },
    { id: "mantras", icon: Music, label: "Músicas Mântricas" },
    {
      id: "astrologer",
      icon: MessageCircleQuestion,
      label: "Pergunte ao Astrólogo",
    },
    { id: "history", icon: BookOpen, label: "Meu Diário" }, // <-- CORREÇÃO APLICADA AQUI
    { id: "oracle", icon: BrainCircuit, label: "Oráculo dos Mantras" },
  ];

  return (
    <div className="page-container">
      <PageTitle subtitle="Explore outras ferramentas para sua jornada.">
        Mais Opções
      </PageTitle>
      <div className="space-y-3">
        {secondaryNavItems.map((item) => (
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

// Hook simulado para manter o código limpo, adicione isso ANTES de AppContent
const usePushNotifications = () => {
  const { userId } = useContext(AppContext);
  // As funções que estavam em AppContent podem ser movidas para cá.
  // Para simplificar, vamos assumir que elas existem no escopo.
  // Nenhuma mudança funcional aqui, apenas organização.
  const saveFcmToken = useCallback(
    async (fcmToken) => {
      if (!userId || !db) return;
      try {
        const tokenRef = doc(db, `users/${userId}/fcmTokens/${fcmToken}`);
        await setDoc(tokenRef, {
          createdAt: Timestamp.now(),
          userAgent: navigator.userAgent,
        });
        console.log("Token FCM salvo no Firestore.");
      } catch (error) {
        console.error("Erro ao salvar token FCM:", error);
      }
    },
    [userId]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!messaging) return;
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem("pushPermissionRequested", "true");
      if (permission === "granted") {
        const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;
        const currentToken = await getToken(messaging, { vapidKey });
        if (currentToken) await saveFcmToken(currentToken);
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
    }
  }, [saveFcmToken]);

  const triggerPushPermissionRequest = useCallback(() => {
    setTimeout(() => {
      const permissionRequested = localStorage.getItem(
        "pushPermissionRequested"
      );
      if (permissionRequested === "true" || !("Notification" in window)) return;
      // A lógica de mostrar o modal será controlada pelo AppContent
    }, 1000);
  }, []);

  return {
    saveFcmToken,
    requestNotificationPermission,
    triggerPushPermissionRequest,
  };
};

// --- COMPONENTE PRINCIPAL (ATUALIZADO com lógica de Jornadas) ---
// INÍCIO DO COMPONENTE 'AppContent'
const AppContent = () => {
  // ESTADO DE NAVEGAÇÃO ATUALIZADO para lidar com parâmetros
  const [activeScreen, setActiveScreenInternal] = useState({
    screen: "home",
    payload: null,
  });
  const setActiveScreen = (screen, payload = null) =>
    setActiveScreenInternal({ screen, payload });

  // ESTADO PARA RASTREAR TAREFA ATIVA DA JORNADA
  const [activeJourneyTask, setActiveJourneyTask] = useState(null);

  // --- ADICIONE OS NOVOS ESTADOS AQUI ---
  const [introTaskModalData, setIntroTaskModalData] = useState(null);
  const [consciousActionModalData, setConsciousActionModalData] =
    useState(null);
  const [playerData, setPlayerData] = useState({
    mantra: null,
    repetitions: 1,
    audioType: "library",
  });

  // Contexto e outros estados existentes
  const {
    isSubscribed,
    userId,
    journeyProgress,
    fetchAllEntries,
    recalculateStreak,
    updateJourneyProgress,
    unlockTheme,
    activeTheme,
    logPlaybackActivity, // <-- FUNÇÃO OBTIDA DO CONTEXTO
  } = useContext(AppContext);
  const [repetitionModalData, setRepetitionModalData] = useState({
    isOpen: false,
    mantra: null,
  });
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAudioCreatorOpen, setIsAudioCreatorOpen] = useState(false);
  const [customAudioToPlay, setCustomAudioToPlay] = useState(null);
  const [isCustomRepModalOpen, setIsCustomRepModalOpen] = useState(false);
  const [playlistToPlay, setPlaylistToPlay] = useState(null);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [showPushPermissionModal, setShowPushPermissionModal] = useState(false);
  const [practiceResult, setPracticeResult] = useState(null);

  // --- INÍCIO: LÓGICA DO TESTE A/B ---
  const [paywallVariant, setPaywallVariant] = useState(null);

  // --- NOVO ESTADO E FUNÇÃO PARA EDIÇÃO DE GRATIDÃO ---
  const [gratitudeToEdit, setGratitudeToEdit] = useState(null);
  const handleEditGratitude = (entry) => {
    setGratitudeToEdit(entry);
    setActiveScreen("gratitude");
  };

  useEffect(() => {
    // Esta lógica é executada apenas uma vez para atribuir o usuário a um grupo.
    let assignedGroup = localStorage.getItem("paywallVariantGroup");
    if (!assignedGroup) {
      assignedGroup = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem("paywallVariantGroup", assignedGroup);
    }
    setPaywallVariant(
      assignedGroup === "A" ? paywallVariantA : paywallVariantB
    );
  }, []); // O array vazio garante que isso execute apenas uma vez.

  const openPremiumModal = () => {
    // Simulação do evento de analytics
    const variantGroup = localStorage.getItem("paywallVariantGroup");
    console.log(`Analytics Event: view_paywall | variant: ${variantGroup}`);

    // ReactGA.event({ category: 'ecommerce', action: 'view_paywall', label: `variant_${variantGroup}` }); // Exemplo com ReactGA

    setIsPremiumModalOpen(true);
  };
  // --- FIM: LÓGICA DO TESTE A/B ---

  // --- INÍCIO: LÓGICA DE NOTIFICAÇÃO PUSH ---

  const saveFcmToken = useCallback(
    async (fcmToken) => {
      if (!userId || !db) return;
      try {
        const tokenRef = doc(db, `users/${userId}/fcmTokens/${fcmToken}`);
        await setDoc(tokenRef, {
          createdAt: Timestamp.now(),
          userAgent: navigator.userAgent,
        });
        console.log("Token FCM salvo no Firestore.");
      } catch (error) {
        console.error("Erro ao salvar token FCM:", error);
      }
    },
    [userId]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!messaging) {
      console.error("Firebase Messaging não está inicializado.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      localStorage.setItem("pushPermissionRequested", "true");
      setShowPushPermissionModal(false);

      if (permission === "granted") {
        console.log("Permissão para notificações concedida.");
        const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error(
            "VAPID key não encontrada. Defina REACT_APP_FIREBASE_VAPID_KEY no seu arquivo .env"
          );
          alert("Configuração de notificação incompleta: VAPID Key faltando.");
          return;
        }

        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
          console.log("Token FCM obtido:", currentToken);
          await saveFcmToken(currentToken);
        } else {
          console.log(
            "Não foi possível obter o token. A permissão foi concedida?"
          );
        }
      } else {
        console.log("Permissão para notificações negada.");
      }
    } catch (error) {
      console.error(
        "Ocorreu um erro ao solicitar permissão de notificação:",
        error
      );
    }
  }, [saveFcmToken]);

  const triggerPushPermissionRequest = useCallback(() => {
    setTimeout(() => {
      const permissionRequested = localStorage.getItem(
        "pushPermissionRequested"
      );
      if (
        permissionRequested === "true" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        console.log(
          "A permissão de notificação já foi solicitada ou não é suportada."
        );
        return;
      }
      setShowPushPermissionModal(true);
    }, 1000); // Atraso de 1s para o usuário perceber a conclusão da ação
  }, []);

  // Efeito para escutar mensagens de push com o app aberto
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Mensagem recebida em primeiro plano: ", payload);
      alert(`Lembrete: ${payload.notification.title}`); // Simples alerta para notificação em primeiro plano
    });

    return () => unsubscribe();
  }, []);

  // --- FIM DA LÓGICA DE NOTIFICAÇÃO PUSH ---

  const handlePlayMantra = (mantra, repetitions, audioType) => {
    // CORREÇÃO: Apenas registra o 'playback' se NÃO for um mantra falado ('spoken'),
    // para evitar a criação de registros "fantasmas" antes da conclusão da prática.
    if (audioType !== 'spoken' && logPlaybackActivity) {
      logPlaybackActivity({
        mantraId: mantra.id,
        source: 'library', // Neste fluxo, se não é 'spoken', só pode ser 'library'.
      });
    }
    setPlayerData({ mantra, repetitions, audioType });
    setRepetitionModalData({ isOpen: false, mantra: null });
  };
  const handleSaveOrUpdate = () => {
    // Ação padrão após salvar uma anotação, gratidão ou prática (fora de uma jornada)
    setActiveScreen("history");
    // Mantém a consistência chamando o gatilho de permissão de notificação
    triggerPushPermissionRequest();
  };
  const handleSelectSpokenMantra = (mantra) => {
    setRepetitionModalData({ isOpen: true, mantra: mantra });
  };

  // FUNÇÃO ATUALIZADA para lidar com a conclusão da tarefa
  const handleTaskCompletion = () => {
    if (activeJourneyTask) {
      const { journeyId, dayInfo } = activeJourneyTask;
      updateJourneyProgress(journeyId, dayInfo.day);
      setActiveJourneyTask(null);

      const journey = JOURNEYS_DATA.find((j) => j.id === journeyId);
      const progress = journeyProgress[journeyId]?.completedDays || [];
      const isNowComplete = progress.length + 1 === journey.days.length;

      if (isNowComplete) {
        // --- LÓGICA DE DESBLOQUEIO ADICIONADA AQUI ---
        if (journey.completionReward?.type === "theme") {
          unlockTheme(journey.completionReward.value);
        }
        setActiveScreen("journeyCompletion", { journey });
      } else {
        setActiveScreen("journeyDetail", { journeyId });
      }
    } else {
      setActiveScreen("history");
    }
    triggerPushPermissionRequest();
  };

  // FUNÇÃO PARA INICIAR UMA TAREFA DA JORNADA
  const handleStartJourneyTask = (journeyId, dayInfo) => {
    const startTask = () => {
      setIntroTaskModalData(null); // Fecha o modal de introdução
      setActiveJourneyTask({ journeyId, dayInfo }); // Mantém o estado da tarefa ativa

      switch (dayInfo.type) {
        case "mantra":
          const mantra = MANTRAS_DATA.find(
            (m) => m.id === dayInfo.details.mantraId
          );
          if (mantra) {
            handlePlayMantra(mantra, dayInfo.details.repetitions, "spoken");
          }
          break;

        case "gratitude":
          setActiveScreen("gratitude");
          break;

        case "reflexao_guiada":
          setActiveScreen("journeyReflection", {
            prompt: dayInfo.details.prompt,
          });
          break;

        case "meditacao_chakra":
          // Lógica a ser implementada futuramente
          setActiveScreen("chakras", { preselect: dayInfo.details.chakraId });
          break;

        case "acao_consciente":
          // Lógica a ser implementada futuramente
          setConsciousActionModalData(dayInfo.details);
          break;

        case "consulta_oraculo":
          // Lógica a ser implementada futuramente
          setActiveScreen("oracle", {
            suggestedQuestion: dayInfo.details.suggestedQuestion,
          });
          break;

        default:
          console.error(
            "Tipo de tarefa de jornada desconhecido:",
            dayInfo.type
          );
          setActiveJourneyTask(null);
      }
    };

    // Mostra o modal de introdução antes de iniciar a tarefa
    setIntroTaskModalData({ dayInfo, onStart: startTask });
  };

  const handleDeleteEntry = async () => {
  if (!entryToDelete || !userId || !db) return;

  try {
    if (entryToDelete.id) {
      // Caso padrão: documento tem ID
      await deleteDoc(doc(db, `users/${userId}/entries`, entryToDelete.id));
    } else {
      // Caso especial: entrada sem id (ex.: vinda da tela de conclusão)
      const entriesRef = collection(db, "users", userId, "entries");
      const entriesQuery = query(entriesRef, orderBy("practicedAt", "desc"), limit(10));
      const snapshot = await getDocs(entriesQuery);

      let candidate = null;
      let minDiff = Infinity;
      const targetDate = entryToDelete.practicedAt?.toDate ? entryToDelete.practicedAt.toDate() : null;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data?.practicedAt) return;
        const docDate = data.practicedAt.toDate ? data.practicedAt.toDate() : null;
        if (!docDate || !targetDate) return;
        const diff = Math.abs(docDate.getTime() - targetDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          candidate = { id: docSnap.id, ...data };
        }
      });

      if (candidate) {
        await deleteDoc(doc(db, `users/${userId}/entries`, candidate.id));
      } else {
        console.warn("Nenhum documento correspondente encontrado para exclusão.");
      }
    }

  } catch (error) {
    console.error("Error deleting entry:", error);
    fetchAllEntries(userId); // fallback em caso de erro
  } finally {
    setEntryToDelete(null);
  }
};


  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsCalendarOpen(false);
    setIsDayDetailOpen(true);
  };
  const handleAddNoteForDate = () => {
    setNoteToEdit(null);
    setIsDayDetailOpen(false);
    setActiveScreen("noteEditor");
  };
  const handleStartCustomAudio = (audio) => {
    if (logPlaybackActivity) {
      logPlaybackActivity({
        customAudioId: audio.id,
        source: 'santuario_audio',
      });
    }
    setCustomAudioToPlay({ audio });
    setIsCustomRepModalOpen(true);
  };
  const handleEditPlaylist = (playlist) => {
    setPlaylistToEdit(playlist);
    setActiveScreen("playlistEditor");
  };
  const handleAddPlaylist = () => {
    setPlaylistToEdit({});
    setActiveScreen("playlistEditor");
  };
  const handleSavePlaylist = () => {
    setPlaylistToEdit(null);
    setActiveScreen("meuSantuario");
  };

  const renderScreen = () => {
    if (entryToEdit && activeScreen.screen !== "diary") setEntryToEdit(null);
    if (noteToEdit && activeScreen.screen !== "noteEditor") setNoteToEdit(null);
    const openPremiumModal = () => setIsPremiumModalOpen(true);

    switch (activeScreen.screen) {
      case "home":
        return (
          <HomeScreen
            setActiveScreen={setActiveScreen}
            openCalendar={() => setIsCalendarOpen(true)}
            openDayDetail={handleDayClick}
            onSelectMantra={handleSelectSpokenMantra}
          />
        );
      case "diary":
        return (
          <DiaryScreen
            onSave={handleSaveOrUpdate}
            entryToEdit={entryToEdit}
            onCancel={() => {
              setEntryToEdit(null);
              setActiveScreen(entryToEdit ? "history" : "home");
            }}
            openPremiumModal={openPremiumModal}
          />
        );
      // --- MUDANÇA AQUI: Passando dados de edição para a GratitudeScreen ---
      case "gratitude":
  return (
    <GratitudeScreen
      onSave={activeJourneyTask ? handleTaskCompletion : handleSaveOrUpdate}
      onCancel={() => {
        setGratitudeToEdit(null);
        // LÓGICA CORRIGIDA: Verifica se está editando ou em uma jornada.
        // Se não for nenhum dos dois, volta para a 'home'.
        if (activeJourneyTask) {
          setActiveScreen("journeyDetail", { journeyId: activeJourneyTask.journeyId });
        } else {
          setActiveScreen(gratitudeToEdit ? "history" : "home");
        }
      }}
      entryToEdit={gratitudeToEdit}
    />
  );
      case "mantras":
        return (
          <MantrasScreen
            onPlayMantra={handlePlayMantra}
            openPremiumModal={openPremiumModal}
          />
        );
      case "spokenMantras":
        return (
          <SpokenMantrasScreen
            onSelectMantra={handleSelectSpokenMantra}
            openPremiumModal={openPremiumModal}
          />
        );
      case "meuSantuario":
        return (
          <MeuSantuarioScreen
            onStartPlaylist={setPlaylistToPlay}
            onEditPlaylist={handleEditPlaylist}
            onStartAudio={handleStartCustomAudio}
            onAddAudio={() => setIsAudioCreatorOpen(true)}
            onAddPlaylist={handleAddPlaylist}
            openPremiumModal={openPremiumModal}
          />
        );
      case "playlistEditor":
        return (
          <PlaylistEditorScreen
            playlistToEdit={playlistToEdit}
            onSave={handleSavePlaylist}
            onCancel={handleSavePlaylist}
          />
        );
      // --- MUDANÇA AQUI: Passando a nova função para a HistoryScreen ---
      case "history":
        return (
          <HistoryScreen
            onEditMantra={(entry) => {
              setEntryToEdit(entry);
              setActiveScreen("diary");
            }}
            onEditNote={(note) => {
              setNoteToEdit(note);
              setActiveScreen("noteEditor");
            }}
            onEditGratitude={handleEditGratitude}
            onDelete={(entry) => setEntryToDelete(entry)}
          />
        );

        case "noteEditor":
        return (
          <NoteEditorScreen
            onSave={() => setActiveScreen("history")}
            onCancel={() => {
              setNoteToEdit(null);
              // Se veio da home, volta pra home, senão, para o histórico
              if (activeScreen.payload?.from === "home") {
                setActiveScreen("home");
              } else {
                setActiveScreen("history");
              }
            }}
            noteToEdit={noteToEdit}
            dateForNewNote={selectedDate} // Usa a data selecionada no calendário
          />
        );

      case "settings":
        return <SettingsScreen setActiveScreen={setActiveScreen} />;
      case "oracle":
        return (
          <OracleScreen
            onPlayMantra={handlePlayMantra}
            openPremiumModal={openPremiumModal}
          />
        );
      case "favorites":
        return <FavoritesScreen onPlayMantra={handlePlayMantra} />;
      case "chakras":
        return (
          <ChakraScreen
            preselectChakraId={activeScreen.payload?.preselect}
            onComplete={activeJourneyTask ? handleTaskCompletion : null}
          />
        );
      case "astrologer":
        return <AstrologerScreen openPremiumModal={openPremiumModal} />;
      case "journeysList":
        return (
          <JourneysListScreen
            setActiveScreen={setActiveScreen}
            openPremiumModal={openPremiumModal}
          />
        );
      case "journeyDetail":
        return (
          <JourneyDetailScreen
            journeyId={activeScreen.payload.journeyId}
            setActiveScreen={setActiveScreen}
            onStartJourneyTask={handleStartJourneyTask}
          />
        );
      case "journeyReflection":
        return (
          <NoteEditorScreen
            onSave={(noteText) => {
              handleTaskCompletion(); /* Aqui poderia salvar o 'noteText' se quisesse */
            }}
            onCancel={() => {
              setActiveJourneyTask(null);
              setActiveScreen("journeyDetail", {
                journeyId: activeJourneyTask?.journeyId,
              });
            }}
            journeyPrompt={activeScreen.payload.prompt}
            dateForNewNote={new Date()}
          />
        );
      case "journeyCompletion":
        return (
          <JourneyCompletionScreen
            journey={activeScreen.payload.journey}
            onNext={() => setActiveScreen("journeysList")}
          />
        );
      case "more":
        return <MoreScreen setActiveScreen={setActiveScreen} />;
      default:
        return (
          <HomeScreen
            setActiveScreen={setActiveScreen}
            openCalendar={() => setIsCalendarOpen(true)}
            openDayDetail={handleDayClick}
            onSelectMantra={handleSelectSpokenMantra}
          />
        );
    }
  };

  return (
    <div className={`modern-body premium-body theme-${activeTheme}`}>
      <SolarSystemBackground />

      <Header setActiveScreen={setActiveScreen} />
      <ScreenAnimator screenKey={activeScreen.screen}>
        {renderScreen()}
      </ScreenAnimator>
      <BottomNav
        activeScreen={activeScreen.screen}
        setActiveScreen={setActiveScreen}
      />

      {playerData.mantra && (
    <MantraPlayer
      currentMantra={playerData.mantra}
      totalRepetitions={playerData.repetitions}
      audioType={playerData.audioType}
      onPracticeComplete={(result) => {
        setPlayerData({ mantra: null, repetitions: 1, audioType: "library" });
        setPracticeResult(result);
        triggerPushPermissionRequest(); // Aproveitamos para pedir permissão
      }}
      onClose={() => {
        setPlayerData({
          mantra: null,
          repetitions: 1,
          audioType: "library",
        });
        // CORREÇÃO APLICADA AQUI:
        // Só executa a conclusão da tarefa se a música fazia parte de uma jornada ativa.
        if (
          activeJourneyTask &&
          activeJourneyTask.dayInfo.type === "mantra"
        ) {
          handleTaskCompletion();
        }
      }}
      onMantraChange={(newMantra) =>
        setPlayerData((prev) => ({ ...prev, mantra: newMantra }))
      }
    />
  )}

      <RepetitionModal
        isOpen={repetitionModalData.isOpen}
        mantra={repetitionModalData.mantra}
        onClose={() => setRepetitionModalData({ isOpen: false, mantra: null })}
        onStart={(repetitions) =>
          handlePlayMantra(repetitionModalData.mantra, repetitions, "spoken")
        }
      />
      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntry}
        title="Apagar Registro"
        message="Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita."
      />
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDayClick={handleDayClick}
      />
      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        date={selectedDate}
        onAddNote={handleAddNoteForDate}
      />

      {paywallVariant && (
        <PremiumLockModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          variant={paywallVariant}
        />
      )}

      <AudioCreatorModal
        isOpen={isAudioCreatorOpen}
        onClose={() => setIsAudioCreatorOpen(false)}
      />
      {customAudioToPlay?.audio && (
        <CustomRepetitionModal
          isOpen={isCustomRepModalOpen}
          onClose={() => setIsCustomRepModalOpen(false)}
          audio={customAudioToPlay.audio}
          onStart={(repetitions) => {
            setCustomAudioToPlay((prev) => ({
              ...prev,
              repeticoes: repetitions,
            }));
            setIsCustomRepModalOpen(false);
          }}
        />
      )}
      {customAudioToPlay?.repeticoes && (
        <CustomAudioPlayer
          singleAudio={customAudioToPlay.audio}
          repetitions={customAudioToPlay.repeticoes}
          onClose={() => {
            setCustomAudioToPlay(null);
            triggerPushPermissionRequest();
          }}
        />
      )}
      {playlistToPlay && (
        <CustomAudioPlayer
          playlist={playlistToPlay}
          onClose={() => {
            setPlaylistToPlay(null);
            triggerPushPermissionRequest();
          }}
        />
      )}

      {/* --- ADICIONE OS NOVOS MODAIS AQUI --- */}
      <IntroTaskModal
        isOpen={!!introTaskModalData}
        onClose={() => setIntroTaskModalData(null)}
        dayInfo={introTaskModalData?.dayInfo}
        onStart={introTaskModalData?.onStart}
      />
      <ConsciousActionModal
        isOpen={!!consciousActionModalData}
        onClose={() => setConsciousActionModalData(null)}
        taskDescription={consciousActionModalData?.taskDescription}
        onComplete={() => {
          setConsciousActionModalData(null);
          handleTaskCompletion();
        }}
      />

      {showPushPermissionModal && (
        <PushPermissionModal
          onAllow={requestNotificationPermission}
          onDeny={() => {
            localStorage.setItem("pushPermissionRequested", "true");
            setShowPushPermissionModal(false);
          }}
        />
      )}
      
      {practiceResult && (
        <PracticeCompletionScreen
          result={practiceResult}
          onClose={() => setPracticeResult(null)}
          onExportToDiary={() => {
            const entryData = {
              mantraId: practiceResult.mantra.id,
              repetitions: practiceResult.count,
              practicedAt: { toDate: () => practiceResult.completedAt }, // Simula um objeto do Firestore para edição
              // Preenchemos com valores padrão para o diário
              timeOfDay: [],
              feelings: "",
              observations: ""
            };
            setPracticeResult(null); // Fecha a tela de conclusão
            setEntryToEdit(entryData); // Define os dados para o diário
            setActiveScreen("diary"); // Abre o diário
          }}
        />
      )}

    </div>
  );
};

// FIM DO COMPONENTE 'AppContent'


const PermissionErrorScreen = ({ type }) => (
  <div className="min-h-screen flex items-center justify-center p-4 modern-body">
    <div className="glass-card w-full max-w-lg text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-red-400" />
      <h2 className="text-xl text-white mt-4">Erro de Permissão do Firebase</h2>
      <p className="text-white/70 mt-2">
        O aplicativo não conseguiu acessar seus dados devido a um problema de
        permissão com o Firebase {type}.
      </p>
      <p className="text-white/70 mt-2">
        Para corrigir, acesse seu console do Firebase, vá até as Regras (Rules)
        do <strong>{type}</strong> e cole as regras adequadas para permitir a
        leitura/escrita autenticada.
      </p>
    </div>
  </div>
);

// --- VERIFICADOR DE AUTENTICAÇÃO E RENDERIZAÇÃO PRINCIPAL (COM LÓGICA DE ONBOARDING) ---
function AppWithAuthCheck() {
  // Adicionamos 'currentUserData' para saber quando os dados do usuário foram carregados
  const {
    user,
    loading,
    permissionError,
    onboardingCompleted,
    currentUserData,
  } = useContext(AppContext);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashVisible(false), 4000); // Mantém a duração mínima do splash
    return () => clearTimeout(timer);
  }, []);

  // --- LÓGICA DE CARREGAMENTO CORRIGIDA ---
  // A SplashScreen agora espera o auth (loading) E TAMBÉM os dados do usuário (currentUserData)
  if (isSplashVisible || loading || (user && !currentUserData)) {
    return <SplashScreen />;
  }

  if (permissionError) return <PermissionErrorScreen type={permissionError} />;

  if (!user) {
    return <AuthScreen />;
  }

  // Neste ponto, já temos certeza do valor real de 'onboardingCompleted'
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

const GratitudeScreen = ({ onSave, onCancel, entryToEdit }) => {
  // Adicionado entryToEdit
  const [items, setItems] = useState(["", "", ""]);
  const { userId, fetchAllEntries } = useContext(AppContext);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Efeito para preencher os campos quando estiver editando
  useEffect(() => {
    if (entryToEdit) {
      const existingItems = entryToEdit.gratefulFor || [];
      // Garante que o array tenha sempre 3 posições para os 3 inputs
      const filledItems = [...existingItems, "", "", ""].slice(0, 3);
      setItems(filledItems);
    } else {
      setItems(["", "", ""]); // Limpa os campos para um novo registro
    }
  }, [entryToEdit]);

  const canSave = items.some((item) => item.trim() !== "");

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gratefulFor = items.filter((item) => item.trim() !== "");
    if (gratefulFor.length === 0 || !userId || !db) {
      setStatus({ type: "error", message: "Preencha pelo menos um campo." });
      return;
    }

    try {
      if (entryToEdit) {
        const entryRef = doc(db, `users/${userId}/entries`, entryToEdit.id);
        await setDoc(entryRef, { gratefulFor }, { merge: true });
        setStatus({ type: "success", message: "Gratidão atualizada!" });
      } else {
        await addDoc(collection(db, `users/${userId}/entries`), {
          type: "gratitude",
          gratefulFor,
          practicedAt: Timestamp.now(),
        });
        setStatus({ type: "success", message: "Gratidão registrada!" });
      }

      // Apenas busca as entradas. O useEffect no AppProvider cuidará do recálculo.
      fetchAllEntries(userId);
      setTimeout(onSave, 1500);
    } catch (error) { // <-- CHAVE DE ABERTURA ADICIONADA
      console.error("Error saving gratitude entry:", error);
      setStatus({ type: "error", message: "Erro ao salvar." });
    } // <-- CHAVE DE FECHAMENTO ADICIONADA
  };

  return (
    <div className="page-container">
      <PageTitle subtitle="Dedique um momento para reconhecer as bênçãos em sua vida.">
        {entryToEdit ? "Editar Gratidão" : "Pote da Gratidão"}
      </PageTitle>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mx-auto glass-card space-y-8"
      >
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3">
              <Heart size={20} className="text-[#FFD54F]/80 flex-shrink-0" />
              <input
                type="text"
                value={items[index]}
                onChange={(e) => handleItemChange(index, e.target.value)}
                className="input-field"
                placeholder={`Sou grato(a) por...`}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full modern-btn-primary h-14"
              disabled={!canSave}
            >
              {entryToEdit ? "Atualizar Gratidão" : "Salvar Gratidão"}
            </button>
          </div>
          {status.message && (
            <p
              className={`p-3 rounded-lg text-center text-sm ${
                status.type === "success"
                  ? "bg-green-500/30 text-green-300"
                  : "bg-red-500/30 text-red-400"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

const PlaylistEditorScreen = ({ playlistToEdit, onSave, onCancel }) => {
  const { userId, meusAudios, fetchPlaylists } = useContext(AppContext);
  const [nome, setNome] = useState(playlistToEdit?.nome || "");
  const [sequencia, setSequencia] = useState(playlistToEdit?.sequencia || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleAddAudio = (audioId) => {
    if (!sequencia.some((item) => item.audioId === audioId)) {
      setSequencia((prev) => [...prev, { audioId, repeticoes: 1 }]);
    }
  };

  const handleRemoveAudio = (audioId) => {
    setSequencia((prev) => prev.filter((item) => item.audioId !== audioId));
  };

  const handleRepetitionsChange = (audioId, reps) => {
    const newReps = Math.max(1, parseInt(reps, 10) || 1);
    setSequencia((prev) =>
      prev.map((item) =>
        item.audioId === audioId ? { ...item, repeticoes: newReps } : item
      )
    );
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
        const playlistRef = doc(
          db,
          `users/${userId}/playlists`,
          playlistToEdit.id
        );
        await setDoc(playlistRef, playlistData, { merge: true });
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
        {playlistToEdit?.id ? "Editar Playlist" : "Nova Playlist"}
      </PageTitle>

      <div className="w-full max-w-lg mx-auto glass-card space-y-6">
        <input
          type="text"
          placeholder="Nome da Playlist"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
        />

        <div className="space-y-3">
          <h3 className="text-white/80">Sequência da Playlist</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {sequencia.map((item, index) => {
              const audio = meusAudios.find((a) => a.id === item.audioId);
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
                    <GripVertical
                      size={18}
                      className="cursor-grab text-white/50"
                    />
                    <span>{audio.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.repeticoes}
                      onChange={(e) =>
                        handleRepetitionsChange(item.audioId, e.target.value)
                      }
                      className="input-field !p-1 !w-16 text-center"
                    />
                    <button onClick={() => handleRemoveAudio(item.audioId)}>
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {sequencia.length === 0 && (
              <p className="text-center text-sm text-white/60 p-4">
                Adicione áudios da sua biblioteca abaixo.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-white/80">Sua Biblioteca de Áudios</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {meusAudios.map(
              (audio) =>
                !sequencia.some((s) => s.audioId === audio.id) && (
                  <div
                    key={audio.id}
                    className="bg-black/20 p-3 rounded-lg flex items-center justify-between"
                  >
                    <span>{audio.nome}</span>
                    <button
                      onClick={() => handleAddAudio(audio.id)}
                      className="p-1.5 rounded-full bg-green-500/80 text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button onClick={onCancel} className="w-full btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleSavePlaylist}
            disabled={isSubmitting || !nome.trim()}
            className="w-full modern-btn-primary"
          >
            {isSubmitting ? "Salvando..." : "Salvar Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- INÍCIO: NOVOS COMPONENTES PARA JORNADAS ---

// Modal que introduz a tarefa do dia
const IntroTaskModal = ({ isOpen, onClose, dayInfo, onStart }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-[#FFD54F] font-light">
          Jornada - Dia {dayInfo.day}
        </p>
        <h2
          className="text-2xl text-white mt-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {dayInfo.title}
        </h2>
        <p className="text-white/70 my-4 font-light text-base">
          {dayInfo.introText}
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onStart}
            className="w-full modern-btn-primary !py-3 !text-base"
          >
            Começar
          </button>
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:underline py-2"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para tarefas do tipo "Ação Consciente"
const ConsciousActionModal = ({
  isOpen,
  onClose,
  taskDescription,
  onComplete,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 screen-animation"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Leaf className="mx-auto h-14 w-14 text-[#FFD54F]/80 mb-4" />
        <h2
          className="text-xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ação Consciente
        </h2>
        <p className="text-white/70 my-4 font-light text-base">
          {taskDescription}
        </p>
        <button
          onClick={onComplete}
          className="w-full modern-btn-primary !py-3 !text-base"
        >
          Marcar como concluído
        </button>
      </div>
    </div>
  );
};

// Tela a ser exibida ao completar uma jornada
const JourneyCompletionScreen = ({ journey, onNext }) => {
  const rewardIcon = () => {
    switch (journey.completionReward?.type) {
      case "theme":
        return <Sparkles className="h-8 w-8 text-white" />;
      case "badge":
        return <Star className="h-8 w-8 text-white" />;
      default:
        return <CheckCircle className="h-8 w-8 text-white" />;
    }
  };

  return (
    <div className="page-container flex flex-col items-center justify-center text-center">
      <div className="glass-card">
        <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
        <h1 className="page-title !text-3xl mt-4">Jornada Concluída!</h1>
        <p className="page-subtitle">
          Você completou com sucesso a "{journey.title}".
        </p>

        {journey.completionReward && (
          <div className="mt-6 bg-black/20 p-4 rounded-lg">
            <p className="text-sm font-light text-white/70">Sua recompensa:</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <p className="text-white text-base">
                {journey.completionReward.message}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onNext}
          className="w-full modern-btn-primary h-14 mt-8"
        >
          Ver outras jornadas
        </button>
      </div>
    </div>
  );
};

// --- FIM: NOVOS COMPONENTES PARA JORNADAS ---

// --- INÍCIO: NOVOS COMPONENTES PARA CONCLUSÃO DE PRÁTICA ---

// Hook auxiliar para o componente de confetes
const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

// A nova tela de conclusão de prática

const PracticeCompletionScreen = ({ result, onClose, onExportToDiary }) => {
  const { width, height } = useWindowSize();
  const { mantra, count, duration, completedAt } = result;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes} min e ${remainingSeconds} seg`;
    }
    return `${remainingSeconds} segundos`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 screen-animation player-background-gradient">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.1}
      />
      <div className="glass-card w-full max-w-md text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-green-400" />
        <h1 className="page-title !text-3xl mt-4">Prática Concluída!</h1>
        <p className="page-subtitle">
          Você repetiu o mantra "{mantra.nome}" com sucesso.
        </p>

        <div className="mt-6 space-y-3 bg-black/20 p-5 rounded-lg text-left text-base"> {/* Garante um tamanho base */}
          <div className="flex justify-between items-center text-white/90">
            <span className="font-light text-white/70">Repetições:</span>
            {/* CORREÇÃO: Removido 'text-lg' */}
            <span className="text-white">{count}</span>
          </div>
          <div className="flex justify-between items-center text-white/90">
            <span className="font-light text-white/70">Duração:</span>
            {/* CORREÇÃO: Removido 'text-lg' */}
            <span className="text-white">{formatDuration(duration)}</span>
          </div>
          <div className="flex justify-between items-center text-white/90">
            <span className="font-light text-white/70">Finalizada em:</span>
            {/* CORREÇÃO: Removido 'text-lg' */}
            <span className="text-[#FFD54F]">
              {completedAt.toLocaleDateString('pt-BR')} às {completedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <button onClick={onExportToDiary} className="w-full modern-btn-primary h-14">
            <BookOpen /> Exportar para o Diário
          </button>
          <button onClick={onClose} className="w-full btn-secondary h-14">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FIM: NOVOS COMPONENTES PARA CONCLUSÃO DE PRÁTICA ---