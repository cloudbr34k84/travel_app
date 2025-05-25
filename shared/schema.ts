import { pgTable, text, serial, integer, date, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

/**
 * @table travel_statuses
 * Stores different statuses for travel-related items.
 * These statuses can be applied to destinations, accommodations, trips, and activities.
 * 
 * Special Rules:
 *  - `label`: Must be unique and is not nullable.
 *  - `description`: Optional text describing the status.
 *  - `colour`: Optional text for a display colour associated with the status.
 */
// Travel Statuses table
export const travelStatuses = pgTable("travel_statuses", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().unique(), // e.g., "wishlist", "planned"
  description: text("description"),
  colour: text("colour"),                   // Optional
});

export type TravelStatus = typeof travelStatuses.$inferSelect;

export const travelStatusesRelations = relations(travelStatuses, ({ many }) => ({
  destinations: many(destinations),
  accommodations: many(accommodations),
  trips: many(trips),
  activities: many(activities), // Added activities relation
}));

/**
 * @table travel_priority_levels
 * Stores different priority levels for travel-related items.
 * These priority levels can be applied to accommodations, destinations, activities, and trips.
 * 
 * Special Rules:
 *  - `label`: Must be unique and is not nullable.
 *  - `description`: Optional text describing the priority level.
 *  - `colour`: Optional text for a display colour associated with the priority level.
 */
// Travel Priority Levels table
export const travelPriorityLevels = pgTable("travel_priority_levels", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().unique(), // e.g., "low", "medium", "high"
  description: text("description"),        // Optional
  colour: text("colour"),
});

export type TravelPriorityLevel = typeof travelPriorityLevels.$inferSelect;
export const travelPriorityLevelsRelations = relations(travelPriorityLevels, ({ many }) => ({
  accommodations: many(accommodations),
  destinations: many(destinations),
  activities: many(activities),
  trips: many(trips), 
}));

/**
 * @table destinations
 * Represents travel destinations.
 * 
 * Foreign Keys:
 *  - `statusId`: References `travel_statuses.id`. Indicates the current status of the destination (e.g., wishlist, planned).
 *  - `priorityId`: References `travel_priority_levels.id`. Indicates the priority of visiting this destination.
 *  - `userId`: References `users.id`. Associates the destination with a specific user. (Nullable)
 * 
 * Special Rules:
 *  - `name`, `country`, `region`, `image`, `statusId`, `priorityId`: Are not nullable.
 *  - `description`: Not nullable, defaults to an empty string.
 *  - `userId`: Optional (nullable).
 */
// Destination table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull(),
  statusId: integer("status_id").notNull(),
  priorityId: integer("priority_id").notNull(),
  userId: integer("user_id"),
});

export const destinationsRelations = relations(destinations, ({ many, one }) => ({
  activities: many(activities),
  accommodations: many(accommodations),
  tripDestinations: many(tripDestinations),
  status: one(travelStatuses, {
    fields: [destinations.statusId],
    references: [travelStatuses.id],
  }),
  priority: one(travelPriorityLevels, {
    fields: [destinations.priorityId],
    references: [travelPriorityLevels.id],
  }),
  user: one(users, {
    fields: [destinations.userId],
    references: [users.id],
  }),
}));

export const insertDestinationSchema = createInsertSchema(destinations, {
  statusId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
}).omit({
  id: true,
});

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

/**
 * @table activities
 * Represents activities that can be done at a destination.
 * 
 * Foreign Keys:
 *  - `destinationId`: References `destinations.id`. Links the activity to a specific destination.
 *  - `statusId`: References `travel_statuses.id`. Indicates the status of the activity (e.g., planned, completed).
 *  - `priorityId`: References `travel_priority_levels.id`. Indicates the priority of this activity.
 *  - `userId`: References `users.id`. Associates the activity with a specific user. (Nullable)
 * 
 * Special Rules:
 *  - `name`, `description`, `category`, `destinationId`, `statusId`, `priorityId`: Are not nullable.
 *  - `image`, `addressStreet`, `addressLine2`, `addressCity`, `addressRegion`, `addressPostcode`, `addressCountry`, `userId`: Optional (nullable).
 */
// Activity table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  destinationId: integer("destination_id").notNull(),
  image: text("image"),
  statusId: integer("status_id").notNull(),
  priorityId: integer("priority_id").notNull(),
  addressStreet: text("address_street"),
  addressLine2: text("address_line2"),
  addressCity: text("address_city"),
  addressRegion: text("address_region"),
  addressPostcode: text("address_postcode"),
  addressCountry: text("address_country"),
  userId: integer("user_id"),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  destination: one(destinations, {
    fields: [activities.destinationId],
    references: [destinations.id],
  }),
  status: one(travelStatuses, {
    fields: [activities.statusId],
    references: [travelStatuses.id],
  }),
  priority: one(travelPriorityLevels, {
    fields: [activities.priorityId],
    references: [travelPriorityLevels.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const insertActivitySchema = createInsertSchema(activities, {
  statusId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
}).omit({
  id: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

/**
 * @table accommodations
 * Represents accommodation options for destinations.
 * 
 * Foreign Keys:
 *  - `destinationId`: References `destinations.id`. Links the accommodation to a specific destination.
 *  - `statusId`: References `travel_statuses.id`. Indicates the booking status or interest level.
 *  - `priorityId`: References `travel_priority_levels.id`. Indicates the priority of this accommodation choice.
 *  - `userId`: References `users.id`. Associates the accommodation with a specific user. (Nullable)
 * 
 * Special Rules:
 *  - `name`, `type`, `destinationId`, `statusId`, `priorityId`: Are not nullable.
 *  - `description`: Not nullable, defaults to an empty string.
 *  - `image`, `notes`, `addressStreet`, `addressLine2`, `addressCity`, `addressRegion`, `addressPostcode`, `addressCountry`, `userId`: Optional (nullable).
 */
// Accommodation table
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  destinationId: integer("destination_id").notNull(),
  image: text("image"),
  description: text("description").notNull().default(""),
  statusId: integer("status_id").notNull(), // 🔄 FK to travel_statuses
  priorityId: integer("priority_id").notNull(), // 🔄 FK to travel_priority_levels
  notes: text("notes"),
  addressStreet: text("address_street"),
  addressLine2: text("address_line2"),
  addressCity: text("address_city"),
  addressRegion: text("address_region"),
  addressPostcode: text("address_postcode"),
  addressCountry: text("address_country"),
  userId: integer("user_id"),
});

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  destination: one(destinations, {
    fields: [accommodations.destinationId],
    references: [destinations.id],
  }),
  status: one(travelStatuses, {
    fields: [accommodations.statusId],
    references: [travelStatuses.id],
  }),
  priority: one(travelPriorityLevels, {
    fields: [accommodations.priorityId],
    references: [travelPriorityLevels.id],
  }),
  user: one(users, {
    fields: [accommodations.userId],
    references: [users.id],
  }),
}));

export const insertAccommodationSchema = createInsertSchema(accommodations, {
  statusId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
}).omit({
  id: true,
});

export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type Accommodation = typeof accommodations.$inferSelect;

/**
 * @table trips
 * Represents planned or past travel trips.
 * 
 * Foreign Keys:
 *  - `statusId`: References `travel_statuses.id`. Indicates the current status of the trip (e.g., planned, ongoing, completed).
 *  - `priorityId`: References `travel_priority_levels.id`. Indicates the priority of this trip.
 *  - `userId`: References `users.id`. Associates the trip with a specific user. (Nullable)
 * 
 * Special Rules:
 *  - `name`, `startDate`, `endDate`, `statusId`, `priorityId`: Are not nullable.
 *  - `description`: Not nullable, defaults to an empty string.
 *  - `image`, `userId`: Optional (nullable).
 */
// Trip table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  statusId: integer("status_id").notNull(), // FK now references travel_statuses
  priorityId: integer("priority_id").notNull(), // FK now references travel_priority_levels
  image: text("image"),
  userId: integer("user_id"),
});

export const tripsRelations = relations(trips, ({ many, one }) => ({
  tripDestinations: many(tripDestinations),
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  status: one(travelStatuses, {
    fields: [trips.statusId],
    references: [travelStatuses.id],
  }),
  priority: one(travelPriorityLevels, {
    fields: [trips.priorityId],
    references: [travelPriorityLevels.id],
  }),
}));

export const insertTripSchema = createInsertSchema(trips, {
  statusId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
}).omit({
  id: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

/**
 * @table trip_destinations
 * A join table to manage the many-to-many relationship between trips and destinations.
 * Each row links a specific trip to a specific destination included in that trip.
 * 
 * Foreign Keys:
 *  - `tripId`: References `trips.id`. The ID of the trip.
 *  - `destinationId`: References `destinations.id`. The ID of the destination included in the trip.
 * 
 * Special Rules:
 *  - `tripId`, `destinationId`: Both are not nullable and form the composite key for the relationship.
 */
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

/**
 * @table users
 * Represents the users of the travel application.
 * 
 * Special Rules:
 *  - `username`, `email`: Must be unique and are not nullable.
 *  - `password`: Not nullable.
 *  - `firstName`, `lastName`, `bio`, `location`, `phone`, `avatar`: Optional fields for user profile information.
 *  - `createdAt`: Automatically set to the current timestamp when the user is created.
 *  - `lastLogin`: Timestamp of the user's last login. (Nullable)
 *  - `loginCount`: Not nullable, defaults to 0. Tracks the number of times the user has logged in.
 */
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
