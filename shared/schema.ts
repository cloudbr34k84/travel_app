import { pgTable, text, serial, integer, date, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Destination table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  image: text("image").notNull(),
  status: text("status").notNull().default("wishlist"), // wishlist, planned, visited
});

export const destinationsRelations = relations(destinations, ({ many }) => ({
  activities: many(activities),
  accommodations: many(accommodations),
  tripDestinations: many(tripDestinations),
}));

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

// Activity table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  destinationId: integer("destination_id").notNull(),
  image: text("image"),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  destination: one(destinations, {
    fields: [activities.destinationId],
    references: [destinations.id],
  }),
}));

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Accommodation table
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  destinationId: integer("destination_id").notNull(),
  image: text("image"),
});

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  destination: one(destinations, {
    fields: [accommodations.destinationId],
    references: [destinations.id],
  }),
}));

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
});

export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type Accommodation = typeof accommodations.$inferSelect;

// Trip table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("planned"), // planned, completed, cancelled
  userId: integer("user_id"),
});

export const tripsRelations = relations(trips, ({ many, one }) => ({
  tripDestinations: many(tripDestinations),
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
}));

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Trip Destinations (to handle the many-to-many relationship)
export const tripDestinations = pgTable("trip_destinations", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  destinationId: integer("destination_id").notNull(),
});

export const tripDestinationsRelations = relations(tripDestinations, ({ one }) => ({
  trip: one(trips, {
    fields: [tripDestinations.tripId],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [tripDestinations.destinationId],
    references: [destinations.id],
  }),
}));

export const insertTripDestinationSchema = createInsertSchema(tripDestinations).omit({
  id: true,
});

export type InsertTripDestination = z.infer<typeof insertTripDestinationSchema>;
export type TripDestination = typeof tripDestinations.$inferSelect;

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  location: text("location"),
  phone: text("phone"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").notNull().default(0),
}, (table) => {
  /**
   * Index for fast username lookups used in authentication flows
   * 
   * This index significantly improves the performance of queries that filter
   * or join on the username column, especially for the getUserByUsername function.
   * 
   * Without this index, username lookups would require a full table scan, which
   * becomes increasingly inefficient as the user table grows.
   * 
   * Drizzle migrations will automatically generate the appropriate SQL to
   * create this index in the database.
   */
  return {
    usernameIdx: index("username_idx").on(table.username),
    
    /**
     * Index for fast email lookups used in authentication and user verification
     * 
     * This index optimizes queries that search by email address, such as password
     * reset flows, email verification, and checking for duplicate emails during
     * registration.
     * 
     * Email lookups are common operations in user management workflows, and
     * this index ensures they remain fast even with large user tables.
     * 
     * Drizzle migrations will automatically generate the appropriate SQL to
     * create this index in the database.
     */
    emailIdx: index("email_idx").on(table.email)
  };
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
