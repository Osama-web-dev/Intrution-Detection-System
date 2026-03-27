import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Keep loading screen for 2.4 seconds, then start fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#040d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Parallax Background Grid / Lightning */}
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2 }}
            style={{
              position: 'absolute',
              inset: -50,
              background: 'radial-gradient(circle at center, rgba(15,220,190,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Left Half of Logo */}
          <motion.div
            initial={{ x: '0%', opacity: 0, scale: 0.8 }}
            animate={{ x: ['0%', '0%', '0%', '-20%'], opacity: [0, 1, 1, 1], scale: [0.8, 1, 1, 1] }}
            transition={{ duration: 2.0, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              backgroundImage: 'url(/loading-logo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
              filter: 'drop-shadow(0 0 20px rgba(15,220,190,0.4))'
            }}
          />

          {/* Right Half of Logo */}
          <motion.div
            initial={{ x: '0%', opacity: 0, scale: 0.8 }}
            animate={{ x: ['0%', '0%', '0%', '20%'], opacity: [0, 1, 1, 1], scale: [0.8, 1, 1, 1] }}
            transition={{ duration: 2.0, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              backgroundImage: 'url(/loading-logo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
              filter: 'drop-shadow(0 0 20px rgba(15,220,190,0.4))'
            }}
          />

          {/* Core Lightning Flash in the Center Splitting the Logo */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: ['0px', '0px', '400px', '200px'], opacity: [0, 0, 1, 0] }}
            transition={{ duration: 2.0, times: [0, 0.5, 0.7, 1], ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '4px',
              background: '#0fdcbe',
              boxShadow: '0 0 30px 10px rgba(15,220,190, 0.8), 0 0 60px 20px rgba(15,220,190, 0.4)',
              transformOrigin: 'top',
              borderRadius: '50%'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
