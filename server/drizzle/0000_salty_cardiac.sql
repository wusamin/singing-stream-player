CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_meta_id" integer NOT NULL,
	"meta_title" text,
	"meta_artist" text,
	"start_at" integer,
	"end_at" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_metas" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"title" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_video_meta_id_video_metas_id_fk" FOREIGN KEY ("video_meta_id") REFERENCES "public"."video_metas"("id") ON DELETE no action ON UPDATE no action;