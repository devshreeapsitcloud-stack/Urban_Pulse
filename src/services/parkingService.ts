import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  setDoc,
  serverTimestamp,
  GeoPoint,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { ParkingSpot, Booking, BookingStatus } from '../types';

const SPOTS_COLLECTION = 'parking_spots';
const BOOKINGS_COLLECTION = 'bookings';

export const parkingService = {
  // Get all parking spots
  async getAllSpots(): Promise<ParkingSpot[]> {
    try {
      const q = query(collection(db, SPOTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSpot));
    } catch (err) {
      handleFirestoreError(err, 'list', SPOTS_COLLECTION);
    }
  },

  // Real-time listener for spots
  subscribeToSpots(callback: (spots: ParkingSpot[]) => void) {
    const q = query(collection(db, SPOTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSpot));
      callback(spots);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
    });
  },

  // Update spot availability (Crowd Update)
  async updateAvailability(spotId: string, availableSpots: number) {
    try {
      const spotRef = doc(db, SPOTS_COLLECTION, spotId);
      await updateDoc(spotRef, {
        available_spots: availableSpots,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `${SPOTS_COLLECTION}/${spotId}`);
    }
  },

  // Create booking
  async createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, 'create', BOOKINGS_COLLECTION);
    }
  },

  // Get user bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (err) {
      handleFirestoreError(err, 'list', BOOKINGS_COLLECTION);
    }
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    try {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await updateDoc(bookingRef, { status });
    } catch (err) {
      handleFirestoreError(err, 'update', `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  },

  // Dynamic Pricing Helpers
  isHappyHour(spot: ParkingSpot): boolean {
    if (!spot.happy_hour) return false;
    const currentHour = new Date().getHours();
    const { start_hour, end_hour } = spot.happy_hour;
    
    if (start_hour <= end_hour) {
      return currentHour >= start_hour && currentHour < end_hour;
    } else {
      // Handles overnight ranges (e.g. 22:00 to 06:00)
      return currentHour >= start_hour || currentHour < end_hour;
    }
  },

  calculateCurrentPrice(spot: ParkingSpot): number {
    if (spot.is_free) return 0;
    if (this.isHappyHour(spot)) {
      return Math.round(spot.price_per_hour * spot.happy_hour!.discount_multiplier);
    }
    return spot.price_per_hour;
  }
};
