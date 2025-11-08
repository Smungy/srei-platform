'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AnimatedLogo() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const letterVariants = {
    initial: { 
      y: 0,
      rotate: 0,
      scale: 1,
    },
    hover: {
      y: [-5, -10, -5],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut" as const
      }
    }
  };

  const containerVariants = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const letters = ['S', 'R', 'E', 'I'];
  const colors = [
    'from-purple-600 to-pink-600',
    'from-pink-600 to-red-600',
    'from-blue-600 to-cyan-600',
    'from-cyan-600 to-teal-600'
  ];

  return (
    <Link href="/" onClick={handleClick}>
      <motion.div
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
        className="flex items-center gap-1 cursor-pointer"
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            variants={letterVariants}
            transition={{ delay: i * 0.05 }}
            className={`text-2xl font-extrabold bg-gradient-to-br ${colors[i]} bg-clip-text text-transparent relative`}
            style={{
              textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            }}
          >
            {letter}
            <motion.span
              className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ 
                opacity: [0, 1, 0],
                transition: { duration: 0.8, delay: i * 0.05 }
              }}
            >
              {letter}
            </motion.span>
          </motion.span>
        ))}
        
        {/* Sparkle effect */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          whileHover={{ 
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
            transition: { duration: 0.8 }
          }}
          className="absolute -top-1 -right-1 w-2 h-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full text-yellow-400"
          >
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
