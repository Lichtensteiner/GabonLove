export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  birthDate: string;
  city: string;
  bio: string;
  lookingFor: string;
  mainPhoto: string;
  photos: string[];
  updatedAt: any;
  isOnline: boolean;
  lastSeen?: any;
  
  // Extended Fields
  phone?: string;
  email?: string;
  neighborhood?: string; // Quartier
  hobbies?: string; // Loisir
  entertainment?: string; // Divertissement
  sport?: string;
  musicStyle?: string;
  childrenCount?: string;
  educationLevel?: string;
  diploma?: string;
  occupation?: string; // Fonction
  salary?: string;
  
  // Admin fields
  isBanned?: boolean;
  isAdmin?: boolean;
}
