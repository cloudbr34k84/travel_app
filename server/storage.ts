/**
 * @file server/storage.ts
 * @description This file defines the storage layer for the application, providing an
 * interface and a database-backed implementation for all data persistence operations.
 * It handles interactions with entities such as Users, Destinations, Activities,
 * Accommodations, and Trips.
 *
 * When adding new schema fields (e.g., a 'description' field to Destinations):
 * 1. Ensure the field is added to the Drizzle schema in `shared/schema.ts`.
 * 2. Verify that `InsertType` and `Type` (e.g., `InsertDestination`, `Destination`)
 *    correctly infer the new field.
 * 3. Confirm that `create` and `update` methods in `DatabaseStorage` correctly
 *    handle the new field (Drizzle typically handles this automatically if types
 *    are correct).
 * 4. Check if `select` queries implicitly include the new field (Drizzle's default
 *    behavior) or if specific column selections need adjustment.
 */

import { 
  destinations, type Destination, type InsertDestination,
  activities, type Activity, type InsertActivity,
  accommodations, type Accommodation, type InsertAccommodation,
  trips, type Trip, type InsertTrip,
  tripDestinations, type TripDestination, type InsertTripDestination,
  users, type User, type InsertUser,
  travelStatuses
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
  getDestinations(): Promise<(Destination & { statusLabel: string | null })[]>;
  getDestination(id: number): Promise<(Destination & { statusLabel: string | null }) | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;
  
  // Activities
  getActivities(): Promise<(Activity & { statusLabel: string | null })[]>;
  getActivity(id: number): Promise<(Activity & { statusLabel: string | null }) | undefined>;
  getActivitiesByDestination(destinationId: number): Promise<(Activity & { statusLabel: string | null })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Accommodations
  getAccommodations(): Promise<(Accommodation & { statusLabel: string | null })[]>;
  getAccommodation(id: number): Promise<(Accommodation & { statusLabel: string | null }) | undefined>;
  getAccommodationsByDestination(destinationId: number): Promise<(Accommodation & { statusLabel: string | null })[]>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined>;
  deleteAccommodation(id: number): Promise<boolean>;
  
  // Trips
  getTrips(): Promise<(Trip & { statusLabel: string | null })[]>;
  getTripsByUser(userId: number): Promise<(Trip & { statusLabel: string | null })[]>;
  getTrip(id: number): Promise<(Trip & { statusLabel: string | null }) | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Trip Destinations
  getTripDestinations(tripId: number): Promise<TripDestination[]>;
  addDestinationToTrip(tripDestination: InsertTripDestination): Promise<TripDestination>;
  removeDestinationFromTrip(tripId: number, destinationId: number): Promise<boolean>;
  
  // Travel Statuses
  getTravelStatuses(): Promise<{ id: number; label: string }[]>;

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
      createTableIfMissing: true,
      ttl: 60 * 60 * 24 * 7, // 7 days in seconds
      pruneSessionInterval: 60 * 60 // 1 hour in seconds
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
  async getDestinations(): Promise<(Destination & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: destinations.id,
        name: destinations.name,
        country: destinations.country,
        region: destinations.region,
        description: destinations.description,
        image: destinations.image,
        statusId: destinations.statusId,
        statusLabel: travelStatuses.label,
      })
      .from(destinations)
      .leftJoin(travelStatuses, eq(destinations.statusId, travelStatuses.id));
    return result;
  }
  
  async getDestination(id: number): Promise<(Destination & { statusLabel: string | null }) | undefined> {
    const [destination] = await db
      .select({
        id: destinations.id,
        name: destinations.name,
        country: destinations.country,
        region: destinations.region,
        description: destinations.description,
        image: destinations.image,
        statusId: destinations.statusId,
        statusLabel: travelStatuses.label,
      })
      .from(destinations)
      .leftJoin(travelStatuses, eq(destinations.statusId, travelStatuses.id))
      .where(eq(destinations.id, id));
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
  async getActivities(): Promise<(Activity & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: activities.id,
        name: activities.name,
        description: activities.description,
        category: activities.category,
        destinationId: activities.destinationId,
        image: activities.image,
        statusId: activities.statusId,
        statusLabel: travelStatuses.label,
      })
      .from(activities)
      .leftJoin(travelStatuses, eq(activities.statusId, travelStatuses.id));
    return result;
  }
  
  async getActivity(id: number): Promise<(Activity & { statusLabel: string | null }) | undefined> {
    const [activity] = await db
      .select({
        id: activities.id,
        name: activities.name,
        description: activities.description,
        category: activities.category,
        destinationId: activities.destinationId,
        image: activities.image,
        statusId: activities.statusId,
        statusLabel: travelStatuses.label,
      })
      .from(activities)
      .leftJoin(travelStatuses, eq(activities.statusId, travelStatuses.id))
      .where(eq(activities.id, id));
    return activity;
  }
  
  async getActivitiesByDestination(destinationId: number): Promise<(Activity & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: activities.id,
        name: activities.name,
        description: activities.description,
        category: activities.category,
        destinationId: activities.destinationId,
        image: activities.image,
        statusId: activities.statusId,
        statusLabel: travelStatuses.label,
      })
      .from(activities)
      .leftJoin(travelStatuses, eq(activities.statusId, travelStatuses.id))
      .where(eq(activities.destinationId, destinationId));
    return result;
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
  async getAccommodations(): Promise<(Accommodation & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: accommodations.id,
        name: accommodations.name,
        type: accommodations.type,
        destinationId: accommodations.destinationId,
        image: accommodations.image,
        statusId: accommodations.statusId,
        priorityLevel: accommodations.priorityLevel,
        notes: accommodations.notes,
        addressStreet: accommodations.addressStreet,
        addressLine2: accommodations.addressLine2,
        addressCity: accommodations.addressCity,
        addressRegion: accommodations.addressRegion,
        addressPostcode: accommodations.addressPostcode,
        addressCountry: accommodations.addressCountry,
        statusLabel: travelStatuses.label,
        description: accommodations.description,
      })
      .from(accommodations)
      .leftJoin(travelStatuses, eq(accommodations.statusId, travelStatuses.id));
    return result;
  }
  
  async getAccommodation(id: number): Promise<(Accommodation & { statusLabel: string | null }) | undefined> {
    const [accommodation] = await db
      .select({
        id: accommodations.id,
        name: accommodations.name,
        type: accommodations.type,
        destinationId: accommodations.destinationId,
        image: accommodations.image,
        statusId: accommodations.statusId,
        priorityLevel: accommodations.priorityLevel,
        notes: accommodations.notes,
        addressStreet: accommodations.addressStreet,
        addressLine2: accommodations.addressLine2,
        addressCity: accommodations.addressCity,
        addressRegion: accommodations.addressRegion,
        addressPostcode: accommodations.addressPostcode,
        addressCountry: accommodations.addressCountry,
        statusLabel: travelStatuses.label,
        description: accommodations.description,
      })
      .from(accommodations)
      .leftJoin(travelStatuses, eq(accommodations.statusId, travelStatuses.id))
      .where(eq(accommodations.id, id));
    return accommodation;
  }
  
  async getAccommodationsByDestination(destinationId: number): Promise<(Accommodation & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: accommodations.id,
        name: accommodations.name,
        type: accommodations.type,
        destinationId: accommodations.destinationId,
        image: accommodations.image,
        statusId: accommodations.statusId,
        priorityLevel: accommodations.priorityLevel,
        notes: accommodations.notes,
        addressStreet: accommodations.addressStreet,
        addressLine2: accommodations.addressLine2,
        addressCity: accommodations.addressCity,
        addressRegion: accommodations.addressRegion,
        addressPostcode: accommodations.addressPostcode,
        addressCountry: accommodations.addressCountry,
        statusLabel: travelStatuses.label,
        description: accommodations.description,
      })
      .from(accommodations)
      .leftJoin(travelStatuses, eq(accommodations.statusId, travelStatuses.id))
      .where(eq(accommodations.destinationId, destinationId));
    return result;
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
  async getTrips(): Promise<(Trip & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        startDate: trips.startDate,
        endDate: trips.endDate,
        statusId: trips.statusId,
        userId: trips.userId,
        statusLabel: travelStatuses.label,
      })
      .from(trips)
      .leftJoin(travelStatuses, eq(trips.statusId, travelStatuses.id));
    return result;
  }
  
  async getTripsByUser(userId: number): Promise<(Trip & { statusLabel: string | null })[]> {
    const result = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        startDate: trips.startDate,
        endDate: trips.endDate,
        statusId: trips.statusId,
        userId: trips.userId,
        statusLabel: travelStatuses.label,
      })
      .from(trips)
      .leftJoin(travelStatuses, eq(trips.statusId, travelStatuses.id))
      .where(eq(trips.userId, userId));
    return result;
  }
  
  async getTrip(id: number): Promise<(Trip & { statusLabel: string | null }) | undefined> {
    const [trip] = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        startDate: trips.startDate,
        endDate: trips.endDate,
        statusId: trips.statusId,
        userId: trips.userId,
        statusLabel: travelStatuses.label,
      })
      .from(trips)
      .leftJoin(travelStatuses, eq(trips.statusId, travelStatuses.id))
      .where(eq(trips.id, id));
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

  // Travel Statuses
  async getTravelStatuses(): Promise<{ id: number; label: string }[]> {
    const statuses = await db
      .select({
        id: travelStatuses.id,
        label: travelStatuses.label,
      })
      .from(travelStatuses);
    return statuses;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    upcomingTripsCount: number;
    destinationsCount: number;
    activitiesCount: number;
    accommodationsCount: number;
  }> {
    // Get the ID for the "planned" status
    const [plannedStatus] = await db
      .select({ id: travelStatuses.id })
      .from(travelStatuses)
      .where(eq(travelStatuses.label, "planned"));

    let plannedStatusId: number | undefined = undefined;
    if (plannedStatus) {
      plannedStatusId = plannedStatus.id;
    } else {
      // Handle the case where "planned" status doesn't exist, though it should.
      // You might throw an error or return counts with upcomingTripsCount as 0.
      console.error("Critical: 'planned' status not found in travel_statuses table.");
    }

    // Count upcoming trips (planned trips with start date in the future)
    const [upcomingTripsResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(
        and(
          plannedStatusId !== undefined ? eq(trips.statusId, plannedStatusId) : sql<boolean>`false`,
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

// Create and export the database storage
export const storage = new DatabaseStorage();

// Database seeding logic has been removed from this file.
