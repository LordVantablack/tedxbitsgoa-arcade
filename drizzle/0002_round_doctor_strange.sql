ALTER TABLE `players` ADD `handle` text;--> statement-breakpoint
ALTER TABLE `players` ADD `handle_normalized` text;--> statement-breakpoint
ALTER TABLE `players` ADD `avatar_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `players_handle_normalized_unique` ON `players` (`handle_normalized`);