export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  favorites: string[];
  vehicle_number: string;
  theme: 'light' | 'dark';
}

export type ParkingType = 'Street' | 'Garage' | 'Private';

export interface ParkingSpot {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  total_spots: number;
  available_spots: number;
  price_per_hour: number;
  type: ParkingType;
  amenities: string[];
  rating: number;
  images: string[];
  last_updated: string;
  is_free: boolean;
  is_covered: boolean;
  has_ev: boolean;
  is_open: boolean;
  ev_details?: {
    speed: string; // e.g. "50kW"
    tariff: string; // e.g. "₹12/unit"
  };
  green_score?: number; // 1-100
  neighbourhood_discovery?: {
    busy_level: 'Low' | 'Moderate' | 'Heavy';
    safety_score: number; // 1-100
    points_of_interest: string[]; // e.g. ["Metro Station", "CCD", "Police Station"]
  };
  happy_hour?: {
    start_hour: number; // 0-23
    end_hour: number; // 0-23
    discount_multiplier: number; // e.g. 0.7 for 30% off
  };
}

export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  parking_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: BookingStatus;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
