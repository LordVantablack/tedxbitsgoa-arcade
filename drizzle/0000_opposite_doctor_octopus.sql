CREATE TABLE `personal_bests` (
	`game_id` text NOT NULL,
	`google_subject` text NOT NULL,
	`score` integer NOT NULL,
	`achieved_at` text NOT NULL,
	`run_ticket_id` text NOT NULL,
	`game_version` text NOT NULL,
	PRIMARY KEY(`game_id`, `google_subject`),
	FOREIGN KEY (`google_subject`) REFERENCES `players`(`google_subject`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`run_ticket_id`) REFERENCES `run_tickets`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `players` (
	`google_subject` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`picture_url` text,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_email_unique` ON `players` (`email`);--> statement-breakpoint
CREATE TABLE `run_evidence` (
	`run_ticket_id` text PRIMARY KEY NOT NULL,
	`evidence_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`run_ticket_id`) REFERENCES `run_tickets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `run_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`google_subject` text NOT NULL,
	`game_id` text NOT NULL,
	`game_version` text NOT NULL,
	`seed` text NOT NULL,
	`issued_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`submitted_at` text,
	`status` text DEFAULT 'issued' NOT NULL,
	FOREIGN KEY (`google_subject`) REFERENCES `players`(`google_subject`) ON UPDATE no action ON DELETE cascade
);
