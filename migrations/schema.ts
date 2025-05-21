import { pgTable, serial, text, integer, date, index, unique, timestamp, varchar, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const accommodations = pgTable("accommodations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	destinationId: integer("destination_id").notNull(),
	image: text(),
});

export const activities = pgTable("activities", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	destinationId: integer("destination_id").notNull(),
	image: text(),
});

export const tripDestinations = pgTable("trip_destinations", {
	id: serial().primaryKey().notNull(),
	tripId: integer("trip_id").notNull(),
	destinationId: integer("destination_id").notNull(),
});

export const trips = pgTable("trips", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	status: text().default('planned').notNull(),
	userId: integer("user_id"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	bio: text(),
	location: text(),
	phone: text(),
	avatar: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	loginCount: integer("login_count").default(0).notNull(),
}, (table) => [
	index("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const destinations = pgTable("destinations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	country: text().notNull(),
	region: text().notNull(),
	image: text().notNull(),
	status: text().default('wishlist').notNull(),
	description: text().default('').notNull(),
});

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);
