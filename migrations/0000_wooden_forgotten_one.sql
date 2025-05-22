CREATE TABLE "accommodations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"destination_id" integer NOT NULL,
	"image" text,
	"status_id" integer NOT NULL,
	"priority_level" text DEFAULT 'medium' NOT NULL,
	"notes" text,
	"address_street" text,
	"address_line2" text,
	"address_city" text,
	"address_region" text,
	"address_postcode" text,
	"address_country" text
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"destination_id" integer NOT NULL,
	"image" text,
	"status_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" text NOT NULL,
	"status_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text,
	CONSTRAINT "travel_statuses_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "trip_destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"destination_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status_id" integer NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"bio" text,
	"location" text,
	"phone" text,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	"login_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");