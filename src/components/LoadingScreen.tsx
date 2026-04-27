import React from 'react';
import { motion } from 'motion/react';

const LoadingScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut"
        }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black italic shadow-2xl shadow-blue-500/40 text-4xl mb-6">
          UP
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">Urban Pulse</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Igniting Mobility</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-blue-600"
          />
        </div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Optimizing your route...</p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
