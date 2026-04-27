import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { geminiService } from '../services/geminiService';
import { ParkingSpot } from '../types';
import { Button, Card, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { format, addHours, differenceInHours } from 'date-fns';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    parkingService.getAllSpots().then(spots => {
      const found = spots.find(s => s.id === id);
      if (found) {
        setSpot(found);
        // Get AI prediction
        geminiService.predictSpotAvailability(found.name, found.total_spots - found.available_spots, found.total_spots)
          .then(setPrediction);
      }
    });
  }, [id]);

  const [upiId, setUpiId] = useState('');
  const [showUpiInput, setShowUpiInput] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'upi' | 'biometric'>('biometric');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBooking = async () => {
    if (!user || !spot) return;
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      alert("Please enter a valid UPI ID");
      return;
    }

    if (selectedMethod === 'biometric') {
      setIsAuthenticating(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate FaceID/TouchID
      setIsAuthenticating(false);
    }

    setLoading(true);
    try {
      const startTime = new Date().toISOString();
      const endTime = addHours(new Date(), hours).toISOString();
      const currentPrice = parkingService.calculateCurrentPrice(spot);
      const totalPrice = currentPrice * hours;

      await parkingService.createBooking({
        user_id: user.uid,
        parking_id: spot.id,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        status: 'active'
      });

      // Update spot availability
      await parkingService.updateAvailability(spot.id, Math.max(0, spot.available_spots - 1));

      setBooked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!spot) return <div className="p-8 text-center">Loading parking details...</div>;

  const currentPrice = parkingService.calculateCurrentPrice(spot);
  const totalPrice = currentPrice * hours;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white p-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Reserve Spot</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-lg mx-auto w-full pb-32">
        <div className="space-y-3">
          <Card className="flex items-center space-x-4 p-5 border-slate-100 shadow-sm rounded-3xl">
            <img src={spot.images[0]} className="h-24 w-24 rounded-2xl object-cover" alt="" />
            <div className="flex-1">
              <h3 className="font-black text-slate-800 text-lg leading-tight">{spot.name}</h3>
              <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                <Badge variant="available" className="mr-2">AVAILABLE</Badge>
                <span>{spot.type}</span>
              </div>
            </div>
          </Card>

          {spot.has_ev && spot.ev_details && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-amber-100 text-xl shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">EV Station Ready</div>
                  <div className="text-sm font-black text-amber-900">{spot.ev_details.speed} Charger • {spot.ev_details.tariff}</div>
                </div>
              </div>
              <div className="bg-amber-100/50 px-2.5 py-1 rounded-lg text-[9px] font-black text-amber-700 uppercase">FAST CHARGE</div>
            </motion.div>
          )}
        </div>

        {/* AI Insight */}
        {prediction !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 flex items-start space-x-4 border border-white/20"
          >
            <div className="bg-white/20 p-3 rounded-2xl">
              <Zap className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="font-black text-[10px] uppercase tracking-[0.2em] opacity-80 mb-1">Pulse AI Analysis</div>
              <p className="text-sm font-bold leading-relaxed">
                High probability of spot availability in <span className="text-2xl underline underline-offset-4 decoration-2">{prediction}m</span>. 
                Securing now is recommended.
              </p>
            </div>
          </motion.div>
        )}

        {/* Time Picker */}
        <div className="space-y-4">
          <h4 className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
            <Clock className="h-4 w-4 mr-2" />
            Parking Schedule
          </h4>
          <Card className="bg-white border-slate-100 shadow-sm p-8 rounded-[2rem]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-black text-slate-900">{hours}</span>
                <span className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Hours</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="h-14 w-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                >-</button>
                <button 
                  onClick={() => setHours(Math.min(24, hours + 1))}
                  className="h-14 w-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-slate-50 transition-colors"
                >+</button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
              <div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Check-in</div>
                <div className="font-bold text-slate-700 text-lg">{format(new Date(), 'HH:mm')}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Check-out</div>
                <div className="font-bold text-blue-600 text-lg underline underline-offset-4 decoration-2">{format(addHours(new Date(), hours), 'HH:mm')}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-4">
          <h4 className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
            <CreditCard className="h-4 w-4 mr-2" />
            Express Checkout
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => { setSelectedMethod('biometric'); setShowUpiInput(false); }}
              className={cn(
                "flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group",
                selectedMethod === 'biometric' ? "border-blue-600 bg-slate-900 text-white shadow-2xl shadow-blue-200 scale-[1.02]" : "border-slate-50 bg-white shadow-sm"
              )}
            >
              <div className="flex items-center space-x-5">
                <div className={cn(
                  "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-colors shadow-lg",
                  selectedMethod === 'biometric' ? "bg-blue-600 shadow-blue-500/20" : "bg-slate-50 border border-slate-100"
                )}>
                  <Fingerprint className={cn("h-10 w-10", selectedMethod === 'biometric' ? "text-white" : "text-slate-400")} />
                </div>
                <div>
                  <div className={cn(
                    "font-black text-[10px] uppercase tracking-widest leading-none mb-1.5",
                    selectedMethod === 'biometric' ? "text-blue-400" : "text-slate-400"
                  )}>Biometric Pay</div>
                  <div className="font-black text-xl tracking-tight">One-Tap Auth</div>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter",
                selectedMethod === 'biometric' ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"
              )}>RECOMMENDED</div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setSelectedMethod('gpay'); setShowUpiInput(false); }}
                className={cn(
                  "flex items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all shadow-sm",
                  selectedMethod === 'gpay' ? "border-blue-600 bg-blue-50/50" : "border-slate-50 bg-white"
                )}
              >
                <div className="font-black text-slate-800 text-base">GPay</div>
                {selectedMethod === 'gpay' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
              </button>

              <button 
                onClick={() => { setSelectedMethod('phonepe'); setShowUpiInput(false); }}
                className={cn(
                  "flex items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all shadow-sm",
                  selectedMethod === 'phonepe' ? "border-blue-600 bg-blue-50/50" : "border-slate-50 bg-white"
                )}
              >
                <div className="font-black text-slate-800 text-base">PhonePe</div>
                {selectedMethod === 'phonepe' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
              </button>
            </div>

            <div className={cn(
              "p-6 rounded-3xl border-2 transition-all space-y-4 shadow-sm",
              selectedMethod === 'upi' ? "border-blue-600 bg-blue-50/50" : "border-slate-50 bg-white"
            )}>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => { setSelectedMethod('upi'); setShowUpiInput(true); }}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xs text-slate-600 border border-slate-100 uppercase">UPI</div>
                  <div className="font-black text-slate-800 text-sm">Custom UPI ID</div>
                </div>
                {selectedMethod === 'upi' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
              </div>
              
              {selectedMethod === 'upi' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-2"
                >
                  <input 
                    type="text" 
                    placeholder="Enter VPA (e.g. user@okaxis)" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-blue-200 outline-none font-black text-sm text-slate-800 placeholder:text-slate-300"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-slate-950 text-white rounded-[2rem] p-8 shadow-2xl space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs font-black uppercase tracking-widest">Rate (₹{currentPrice}/hr)</span>
              {parkingService.isHappyHour(spot) && (
                <span className="text-[8px] text-green-400 font-black uppercase tracking-[0.2em] mt-0.5">Happy Hour Applied</span>
              )}
            </div>
            <span className="font-black">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest">Platform Fee</span>
            <span className="font-black">₹5</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-white font-black text-xl uppercase tracking-widest">Total Pay</span>
            <span className="text-3xl font-black text-blue-500">₹{totalPrice + 5}</span>
          </div>
        </div>
      </div>

      {/* Floating Checkout Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 z-[60] bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-lg mx-auto">
          <Button 
            className="w-full py-7 text-xl rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] bg-blue-600 hover:bg-blue-700 uppercase tracking-widest font-black"
            disabled={loading || booked || isAuthenticating}
            onClick={handleBooking}
          >
            {isAuthenticating ? (
              <div className="flex items-center gap-3">
                <Fingerprint className="h-6 w-6 animate-pulse" />
                <span>Authenticating...</span>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Securing...</span>
              </div>
            ) : (
              booked ? 'BOOKED ✅' : `Confirm Reservation`
            )}
          </Button>
        </div>
      </div>

      {/* Auth Success Overlay */}
      <AnimatePresence>
        {isAuthenticating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-white"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
              <Fingerprint className="h-32 w-32 relative text-blue-500" />
            </motion.div>
            <h2 className="mt-8 text-2xl font-black uppercase tracking-[0.2em]">Authenticating</h2>
            <p className="mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Verifying Biometric Link</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success & FCM Simulation Modal */}
      <AnimatePresence>
        {booked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="absolute top-10 left-0 right-0 p-6 flex justify-center pointer-events-none">
              <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm w-full border border-blue-100"
              >
                <div className="bg-blue-600 text-white p-2 rounded-xl">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pulse Notification</div>
                  <div className="text-xs font-black text-slate-800 leading-tight">Confirmed: {spot.name}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase leading-none mt-1">Ashok Nagar • MG Road</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Until {format(addHours(new Date(), hours), 'HH:mm')}</div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center relative overflow-hidden"
            >
              <div className="h-28 w-28 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-green-100">
                <CheckCircle2 className="h-14 w-14 text-green-600" />
              </div>
              <div className="space-y-3 mb-10">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Booking<br/>Secure</h2>
                <p className="text-slate-400 text-sm font-bold leading-relaxed px-4">
                  Check-in details have been pushed to your device. Arrival timestamp logged.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full py-5 text-sm font-black bg-blue-600 rounded-2xl uppercase tracking-widest shadow-xl shadow-blue-100" 
                  onClick={() => navigate(`/navigation/${spot.id}`)}
                >
                  START NAVIGATION
                </Button>
                <button 
                  className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors" 
                  onClick={() => navigate('/')}
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
