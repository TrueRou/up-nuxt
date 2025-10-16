CREATE TABLE "tbl_server" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"identifier" text NOT NULL,
	"tips_title" text NOT NULL,
	"tips_desc" text NOT NULL,
	"tips_url" text NOT NULL,
	"credentials_strategy" text NOT NULL,
	"credentials_field" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_account" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"server_id" integer NOT NULL,
	"credentials" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_preference" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"maimai_version" text,
	"simplified_code" text,
	"character_name" text,
	"friend_code" text,
	"display_name" text,
	"dx_rating" text,
	"qr_size" integer DEFAULT 15 NOT NULL,
	"mask_type" integer DEFAULT 0 NOT NULL,
	"chara_info_color" text DEFAULT '#fee37c' NOT NULL,
	"dynamic_rating" boolean DEFAULT true NOT NULL,
	"show_date" boolean DEFAULT true NOT NULL,
	"character_id" text,
	"background_id" text,
	"frame_id" text,
	"passname_id" text
);
--> statement-breakpoint
CREATE TABLE "tbl_rating" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tbl_account" ADD CONSTRAINT "tbl_account_server_id_tbl_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."tbl_server"("id") ON DELETE no action ON UPDATE no action;