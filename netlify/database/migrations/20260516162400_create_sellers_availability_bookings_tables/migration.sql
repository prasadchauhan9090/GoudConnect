CREATE TABLE "availability" (
	"id" serial PRIMARY KEY,
	"seller_id" integer NOT NULL,
	"date" date NOT NULL,
	"morning_available" boolean DEFAULT false,
	"evening_available" boolean DEFAULT false,
	"stock_count" integer DEFAULT 0,
	CONSTRAINT "availability_seller_id_date_unique" UNIQUE("seller_id","date")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY,
	"seller_id" integer NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"quantity" integer NOT NULL,
	"pickup_time" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sellers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"phone" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"village" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"rating" double precision DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_seller_id_sellers_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_seller_id_sellers_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id");