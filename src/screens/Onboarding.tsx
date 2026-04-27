import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../components/ui';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white text-gray-900 p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-64 w-full bg-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden"
        >
          <img 
            src="/src/assets/images/urban_smart_parking_1777014089635.png" 
            alt="Smart Parking" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-display font-bold leading-tight"
          >
            Find Parking <span className="text-blue-600">in Seconds</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            Real-time vacant spots near you with AI-powered suggestions and easy navigation.
          </motion.p>
        </div>

        <div className="flex flex-col w-full space-y-4">
          <Button 
            className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-blue-100"
            onClick={() => navigate('/signup')} 
          >
            Get Started
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500"
            onClick={() => navigate('/login')}
          >
            I already have an account
          </Button>
        </div>
      </div>

      <div className="flex space-x-8 text-gray-400 py-8">
        <div className="flex flex-col items-center space-y-1">
          <Zap className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Real-time</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Secure</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <MapPin className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Precise</span>
        </div>
      </div>
    </div>
  );
}
