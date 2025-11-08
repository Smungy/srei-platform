'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Colorful Icon Components
const GamepadIcon = () => (
  <div className="w-20 h-20 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="gamepad-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* Main body */}
      <rect x="12" y="20" width="40" height="24" rx="6" fill="url(#gamepad-gradient)" />
      {/* Handles */}
      <path d="M10 28 L4 36 L8 44 L14 40 Z" fill="url(#gamepad-gradient)" />
      <path d="M54 28 L60 36 L56 44 L50 40 Z" fill="url(#gamepad-gradient)" />
      {/* D-Pad */}
      <rect x="18" y="26" width="4" height="12" rx="1" fill="white" opacity="0.9" />
      <rect x="16" y="28" width="8" height="8" rx="1" fill="white" opacity="0.9" />
      {/* Buttons */}
      <circle cx="42" cy="28" r="3" fill="white" opacity="0.9" />
      <circle cx="46" cy="32" r="3" fill="white" opacity="0.9" />
      <circle cx="42" cy="36" r="3" fill="white" opacity="0.9" />
      <circle cx="38" cy="32" r="3" fill="white" opacity="0.9" />
    </svg>
  </div>
);

const MovieIcon = () => (
  <div className="w-20 h-20 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="movie-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* Film reel */}
      <rect x="10" y="16" width="44" height="32" rx="4" fill="url(#movie-gradient)" />
      {/* Perforations */}
      <rect x="12" y="20" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      <rect x="12" y="30" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      <rect x="12" y="40" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      <rect x="48" y="20" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      <rect x="48" y="30" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      <rect x="48" y="40" width="4" height="4" rx="1" fill="white" opacity="0.8" />
      {/* Play icon */}
      <path d="M28 26 L38 32 L28 38 Z" fill="white" opacity="0.9" />
    </svg>
  </div>
);

const BookIcon = () => (
  <div className="w-20 h-20 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Left page */}
      <path d="M14 16 L14 48 L30 44 L30 12 Z" fill="url(#book-gradient)" />
      {/* Right page */}
      <path d="M34 12 L34 44 L50 48 L50 16 Z" fill="url(#book-gradient)" opacity="0.8" />
      {/* Spine */}
      <rect x="30" y="12" width="4" height="36" fill="#1e293b" opacity="0.3" />
      {/* Lines on pages */}
      <line x1="18" y1="20" x2="26" y2="19" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="18" y1="26" x2="26" y2="25" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="18" y1="32" x2="26" y2="31" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <line x1="38" y1="19" x2="46" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="38" y1="25" x2="46" y2="26" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="38" y1="31" x2="46" y2="32" stroke="white" strokeWidth="1.5" opacity="0.6" />
    </svg>
  </div>
);

const MusicIcon = () => (
  <div className="w-20 h-20 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="music-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Note stems */}
      <rect x="24" y="16" width="3" height="28" rx="1.5" fill="url(#music-gradient)" />
      <rect x="38" y="12" width="3" height="28" rx="1.5" fill="url(#music-gradient)" />
      {/* Connecting beam */}
      <path d="M27 16 L41 12 L41 20 L27 24 Z" fill="url(#music-gradient)" />
      {/* Note heads */}
      <ellipse cx="22" cy="46" rx="6" ry="4" fill="url(#music-gradient)" />
      <ellipse cx="36" cy="42" rx="6" ry="4" fill="url(#music-gradient)" />
      {/* Decorative circles */}
      <circle cx="48" cy="24" r="2" fill="#10b981" opacity="0.6" />
      <circle cx="52" cy="30" r="1.5" fill="#14b8a6" opacity="0.6" />
      <circle cx="16" cy="28" r="2" fill="#06b6d4" opacity="0.6" />
    </svg>
  </div>
);

export function AnimatedHome() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setMounted(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const titleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: 0.1
      }
    }
  };

  const categories = [
    {
      href: '/games',
      icon: GamepadIcon,
      title: 'Videojuegos',
      description: 'Encuentra tu próximo juego favorito',
      available: true,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      glowColor: 'rgba(168, 85, 247, 0.4)'
    },
    {
      icon: MovieIcon,
      title: 'Películas',
      description: 'Próximamente',
      available: false,
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      glowColor: 'rgba(236, 72, 153, 0.4)'
    },
    {
      icon: BookIcon,
      title: 'Libros',
      description: 'Próximamente',
      available: false,
      gradient: 'from-blue-500 via-cyan-600 to-teal-600',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      icon: MusicIcon,
      title: 'Música',
      description: 'Próximamente',
      available: false,
      gradient: 'from-cyan-500 via-teal-600 to-emerald-600',
      glowColor: 'rgba(6, 182, 212, 0.4)'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col items-center justify-center gap-8 p-5"
    >
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-4">
        <motion.h1
          variants={titleVariants}
          className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
        >
          Sistema de Recomendaciones de Entretenimiento Inteligente
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-xl text-muted-foreground"
        >
          Descubre videojuegos personalizados con el poder de la IA
        </motion.p>
      </div>

      {/* Categories */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mt-8"
      >
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={category.available ? { 
                scale: 1.08, 
                y: -10,
                transition: { type: "spring", stiffness: 400, damping: 15 }
              } : {}}
              className={`relative group ${category.available ? '' : 'opacity-50'}`}
            >
              {category.available ? (
                <Link
                  href={category.href!}
                  className="block p-8 border rounded-xl hover:border-transparent transition-all duration-300 text-center relative overflow-hidden"
                >
                  {/* Animated Gradient Background - Super Enhanced */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: 1,
                      scale: 1.15,
                      rotate: [0, 5, -5, 0],
                      transition: { 
                        duration: 0.5,
                        scale: { duration: 0.4 },
                        rotate: { duration: 2, repeat: Infinity }
                      }
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} blur-2xl`}
                  />
                  
                  {/* Glow Effect - Super Enhanced */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ 
                      opacity: 1,
                      scale: [1, 1.1, 1.05, 1.1],
                      transition: { 
                        opacity: { duration: 0.3 },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }
                    }}
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: `0 0 100px ${category.glowColor}, 0 0 150px ${category.glowColor}, 0 0 200px ${category.glowColor}, inset 0 0 80px ${category.glowColor}`
                    }}
                  />

                  {/* Border Gradient */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ 
                      opacity: 1,
                      transition: { duration: 0.3 }
                    }}
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${category.gradient} p-[3px]`}
                  >
                    <div className="w-full h-full bg-background rounded-xl" />
                  </motion.div>
                  
                  {/* Pulsing Ring Effect */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: [0, 0.8, 0],
                      scale: [0.8, 1.3, 1.5],
                      transition: { 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }
                    }}
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${category.gradient} opacity-50`}
                    style={{
                      filter: 'blur(20px)'
                    }}
                  />
                  
                  <div className="relative z-10">
                    {/* Animated Icon - Centered */}
                    <motion.div
                      initial={{ rotate: 0, scale: 1 }}
                      whileHover={{ 
                        rotate: [0, -15, 15, -10, 10, 0],
                        scale: [1, 1.3, 1.4, 1.3, 1.2],
                        y: [0, -15, -10, -15, -5],
                        transition: { duration: 0.8, ease: "easeInOut" }
                      }}
                      className="flex items-center justify-center mb-6"
                    >
                      <motion.div
                        whileHover={{
                          filter: [
                            'drop-shadow(0 0 0px transparent)',
                            `drop-shadow(0 0 20px ${category.glowColor})`,
                            `drop-shadow(0 0 30px ${category.glowColor})`,
                            `drop-shadow(0 0 20px ${category.glowColor})`
                          ],
                          transition: { duration: 0.8, repeat: Infinity }
                        }}
                      >
                        <IconComponent />
                      </motion.div>
                    </motion.div>
                    
                    {/* Title with gradient on hover */}
                    <motion.h3 
                      whileHover={{ 
                        scale: 1.15,
                        y: -5,
                        transition: { duration: 0.3 }
                      }}
                      className={`text-2xl font-bold mb-2 bg-gradient-to-br ${category.gradient} bg-clip-text text-transparent drop-shadow-lg`}
                    >
                      {category.title}
                    </motion.h3>
                    <p className="text-sm text-muted-foreground font-medium">{category.description}</p>
                  </div>

                  {/* Shine Effect - Super Enhanced with Loop */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ 
                      x: ['100%', '200%'],
                      opacity: [0, 1, 0.8, 0],
                      transition: { 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }
                    }}
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12`}
                    style={{
                      filter: 'blur(2px)'
                    }}
                  />
                </Link>
              ) : (
                <div className="p-8 border rounded-xl text-center relative overflow-hidden bg-white/5 backdrop-blur-sm">
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6 opacity-40">
                      <IconComponent />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-br ${category.gradient} bg-clip-text text-transparent opacity-50`}>
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating Particles Effect - Enhanced */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => {
            const colors = [
              'bg-purple-500',
              'bg-pink-500',
              'bg-blue-500',
              'bg-cyan-500',
              'bg-teal-500',
              'bg-orange-500'
            ];
            const glowColors = [
              'shadow-purple-500/50',
              'shadow-pink-500/50',
              'shadow-blue-500/50',
              'shadow-cyan-500/50',
              'shadow-teal-500/50',
              'shadow-orange-500/50'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomGlow = glowColors[Math.floor(Math.random() * glowColors.length)];
            const size = Math.random() * 4 + 2; // 2-6px
            const startX = Math.random() * dimensions.width; // Empieza desde cualquier punto horizontal
            const drift = (Math.random() - 0.5) * 200; // Deriva lateral de -100 a +100
            
            return (
              <motion.div
                key={i}
                initial={{
                  x: startX,
                  y: dimensions.height + 50,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: [dimensions.height + 50, -100],
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1.2, 0.8],
                  x: [startX, startX + drift, startX + drift * 1.5]
                }}
                transition={{
                  duration: Math.random() * 5 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
                className={`absolute ${randomColor} rounded-full blur-sm ${randomGlow} shadow-2xl`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  filter: `blur(${Math.random() * 2}px) drop-shadow(0 0 ${size * 2}px currentColor)`
                }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
