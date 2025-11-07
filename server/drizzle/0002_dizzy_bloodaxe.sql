CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "video_metas" ADD COLUMN "visibility" "visibility" DEFAULT 'private';--> statement-breakpoint
CREATE UNIQUE INDEX "video_id_unique_idx" ON "video_metas" USING btree ("video_id");