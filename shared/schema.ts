import { pgTable, text, serial, integer, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Destination table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  image: text("image").notNull(),
  status: text("status").notNull().default("wishlist"), // wishlist, planned, visited
});

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
});

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

export const insertTripDestinationSchema = createInsertSchema(tripDestinations).omit({
  id: true,
});

export type InsertTripDestination = z.infer<typeof insertTripDestinationSchema>;
export type TripDestination = typeof tripDestinations.$inferSelect;
