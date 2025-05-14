import { 
  destinations, type Destination, type InsertDestination,
  activities, type Activity, type InsertActivity,
  accommodations, type Accommodation, type InsertAccommodation,
  trips, type Trip, type InsertTrip,
  tripDestinations, type TripDestination, type InsertTripDestination,
  users, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, sql, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Define the storage interface
export interface IStorage {
  // Session Store
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;
  
  // Activities
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByDestination(destinationId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Accommodations
  getAccommodations(): Promise<Accommodation[]>;
  getAccommodation(id: number): Promise<Accommodation | undefined>;
  getAccommodationsByDestination(destinationId: number): Promise<Accommodation[]>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined>;
  deleteAccommodation(id: number): Promise<boolean>;
  
  // Trips
  getTrips(): Promise<Trip[]>;
  getTripsByUser(userId: number): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Trip Destinations
  getTripDestinations(tripId: number): Promise<TripDestination[]>;
  addDestinationToTrip(tripDestination: InsertTripDestination): Promise<TripDestination>;
  removeDestinationFromTrip(tripId: number, destinationId: number): Promise<boolean>;
  
  // Stats
  getDashboardStats(): Promise<{
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      // First update any trips by this user to remove the userId
      await db
        .update(trips)
        .set({ userId: null })
        .where(eq(trips.userId, id));
      
      // Then delete the user
      const [deleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations);
  }
  
  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination;
  }
  
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const [newDestination] = await db.insert(destinations).values(destination).returning();
    return newDestination;
  }
  
  async updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined> {
    const [updatedDestination] = await db
      .update(destinations)
      .set(destination)
      .where(eq(destinations.id, id))
      .returning();
    
    return updatedDestination;
  }
  
  async deleteDestination(id: number): Promise<boolean> {
    try {
      // First delete any dependent records (activities, accommodations, trip destinations)
      await db.delete(activities).where(eq(activities.destinationId, id));
      await db.delete(accommodations).where(eq(accommodations.destinationId, id));
      await db.delete(tripDestinations).where(eq(tripDestinations.destinationId, id));
      
      // Then delete the destination itself
      const [deleted] = await db
        .delete(destinations)
        .where(eq(destinations.id, id))
        .returning({ id: destinations.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error deleting destination:", error);
      return false;
    }
  }
  
  // Activities
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }
  
  async getActivitiesByDestination(destinationId: number): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.destinationId, destinationId));
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    // Add a default image if one isn't provided
    if (!activity.image) {
      activity.image = `https://images.unsplash.com/photo-1482784160316-6eb046863ece?q=80&w=2070&auto=format&fit=crop`;
    }
    
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
  
  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set(activity)
      .where(eq(activities.id, id))
      .returning();
    
    return updatedActivity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(activities)
        .where(eq(activities.id, id))
        .returning({ id: activities.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  }
  
  // Accommodations
  async getAccommodations(): Promise<Accommodation[]> {
    return await db.select().from(accommodations);
  }
  
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    const [accommodation] = await db.select().from(accommodations).where(eq(accommodations.id, id));
    return accommodation;
  }
  
  async getAccommodationsByDestination(destinationId: number): Promise<Accommodation[]> {
    return await db.select().from(accommodations).where(eq(accommodations.destinationId, destinationId));
  }
  
  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    // Add a default image if one isn't provided
    if (!accommodation.image) {
      accommodation.image = `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop`;
    }
    
    const [newAccommodation] = await db.insert(accommodations).values(accommodation).returning();
    return newAccommodation;
  }
  
  async updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const [updatedAccommodation] = await db
      .update(accommodations)
      .set(accommodation)
      .where(eq(accommodations.id, id))
      .returning();
    
    return updatedAccommodation;
  }
  
  async deleteAccommodation(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(accommodations)
        .where(eq(accommodations.id, id))
        .returning({ id: accommodations.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      return false;
    }
  }
  
  // Trips
  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }
  
  async getTripsByUser(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.userId, userId));
  }
  
  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }
  
  async updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [updatedTrip] = await db
      .update(trips)
      .set(trip)
      .where(eq(trips.id, id))
      .returning();
    
    return updatedTrip;
  }
  
  async deleteTrip(id: number): Promise<boolean> {
    try {
      // First delete any trip destinations for this trip
      await db.delete(tripDestinations).where(eq(tripDestinations.tripId, id));
      
      // Then delete the trip itself
      const [deleted] = await db
        .delete(trips)
        .where(eq(trips.id, id))
        .returning({ id: trips.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error deleting trip:", error);
      return false;
    }
  }
  
  // Trip Destinations
  async getTripDestinations(tripId: number): Promise<TripDestination[]> {
    return await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId));
  }
  
  async addDestinationToTrip(tripDestination: InsertTripDestination): Promise<TripDestination> {
    const [newTripDestination] = await db.insert(tripDestinations).values(tripDestination).returning();
    return newTripDestination;
  }
  
  async removeDestinationFromTrip(tripId: number, destinationId: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(tripDestinations)
        .where(
          and(
            eq(tripDestinations.tripId, tripId),
            eq(tripDestinations.destinationId, destinationId)
          )
        )
        .returning({ id: tripDestinations.id });
      
      return !!deleted;
    } catch (error) {
      console.error("Error removing destination from trip:", error);
      return false;
    }
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }> {
    // Count upcoming trips (planned trips with start date in the future)
    const [upcomingTripsResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(
        and(
          eq(trips.status, "planned"),
          gt(trips.startDate, new Date().toISOString().split('T')[0])
        )
      );
    
    // Count total destinations
    const [destinationsResult] = await db
      .select({ count: count() })
      .from(destinations);
    
    // Count total activities
    const [activitiesResult] = await db
      .select({ count: count() })
      .from(activities);
    
    // Count total accommodations
    const [accommodationsResult] = await db
      .select({ count: count() })
      .from(accommodations);
    
    return {
      upcomingTripsCount: Number(upcomingTripsResult.count),
      destinationsCount: Number(destinationsResult.count),
      activitiesCount: Number(activitiesResult.count),
      accommodationsCount: Number(accommodationsResult.count)
    };
  }
}

// Create a seed data class to initialize the database with sample data if needed
export class DataSeeder {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  async seedDatabase() {
    try {
      // Check if there's already data in the destinations table
      const existingDestinations = await this.storage.getDestinations();
      
      if (existingDestinations.length === 0) {
        console.log("Seeding database with initial data...");
        
        // Sample destinations
        const sampleDestinations: InsertDestination[] = [
          { name: "Paris", country: "France", region: "Europe", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", status: "visited" },
          { name: "Tokyo", country: "Japan", region: "Asia", image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc", status: "planned" },
          { name: "Sydney", country: "Australia", region: "Oceania", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9", status: "wishlist" },
          { name: "Venice", country: "Italy", region: "Europe", image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9", status: "visited" },
          { name: "Santorini", country: "Greece", region: "Europe", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff", status: "wishlist" },
          { name: "Machu Picchu", country: "Peru", region: "South America", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377", status: "planned" },
        ];
        
        // Create destinations and store their IDs
        const destinationMap = new Map<string, number>();
        
        for (const dest of sampleDestinations) {
          const newDest = await this.storage.createDestination(dest);
          destinationMap.set(dest.name, newDest.id);
        }
        
        // Sample activities
        const sampleActivities: InsertActivity[] = [
          { name: "Eiffel Tower Visit", description: "Visit the iconic Eiffel Tower", category: "Sightseeing", destinationId: destinationMap.get("Paris")!, image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e" },
          { name: "Louvre Museum", description: "Explore art at the Louvre", category: "Culture", destinationId: destinationMap.get("Paris")!, image: "https://images.unsplash.com/photo-1565783795132-13a333cdcd75" },
          { name: "Tokyo Skytree", description: "Visit one of the tallest towers in the world", category: "Sightseeing", destinationId: destinationMap.get("Tokyo")!, image: "https://images.unsplash.com/photo-1536984456083-d957495fb197" },
          { name: "Sydney Opera House Tour", description: "Tour the famous Sydney Opera House", category: "Culture", destinationId: destinationMap.get("Sydney")!, image: "https://images.unsplash.com/photo-1510162548618-d50a4c4c8d18" },
        ];
        
        for (const activity of sampleActivities) {
          await this.storage.createActivity(activity);
        }
        
        // Sample accommodations
        const sampleAccommodations: InsertAccommodation[] = [
          { name: "Hotel de Paris", type: "Hotel", destinationId: destinationMap.get("Paris")!, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945" },
          { name: "Tokyo Bay Resort", type: "Resort", destinationId: destinationMap.get("Tokyo")!, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4" },
          { name: "Sydney Harbor View", type: "Apartment", destinationId: destinationMap.get("Sydney")!, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
          { name: "Venice Canal House", type: "Guesthouse", destinationId: destinationMap.get("Venice")!, image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff" },
        ];
        
        for (const accommodation of sampleAccommodations) {
          await this.storage.createAccommodation(accommodation);
        }
        
        // Sample trips
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        const twoMonthsAgo = new Date(today);
        twoMonthsAgo.setMonth(today.getMonth() - 2);
        
        const sampleTrips: InsertTrip[] = [
          { name: "Japan Adventure", startDate: nextMonth.toISOString().split('T')[0], endDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "planned" },
          { name: "Bali Getaway", startDate: twoMonthsAgo.toISOString().split('T')[0], endDate: new Date(twoMonthsAgo.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "completed" },
          { name: "Swiss Alps Adventure", startDate: lastMonth.toISOString().split('T')[0], endDate: new Date(lastMonth.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "completed" },
          { name: "New York City Trip", startDate: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date(lastMonth.getTime() - 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "completed" },
        ];
        
        // Create trips and store their IDs
        const tripMap = new Map<string, number>();
        
        for (const trip of sampleTrips) {
          const newTrip = await this.storage.createTrip(trip);
          tripMap.set(trip.name, newTrip.id);
        }
        
        // Link trips to destinations
        await this.storage.addDestinationToTrip({ tripId: tripMap.get("Japan Adventure")!, destinationId: destinationMap.get("Tokyo")! });
        await this.storage.addDestinationToTrip({ tripId: tripMap.get("Bali Getaway")!, destinationId: destinationMap.get("Paris")! }); // Just for example
        await this.storage.addDestinationToTrip({ tripId: tripMap.get("Swiss Alps Adventure")!, destinationId: destinationMap.get("Venice")! }); // Just for example
        await this.storage.addDestinationToTrip({ tripId: tripMap.get("New York City Trip")!, destinationId: destinationMap.get("Sydney")! }); // Just for example
        
        console.log("Database seeded successfully");
      } else {
        console.log("Database already contains data, skipping seed");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

// Create and export the database storage
export const storage = new DatabaseStorage();

// Seed the database if needed
const seeder = new DataSeeder(storage);
seeder.seedDatabase().catch(console.error);
