ALTER TABLE "video_metas" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "video_metas" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;