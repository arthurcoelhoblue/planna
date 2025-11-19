ALTER TABLE `plans` ADD `totalPlanTime` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `timeFits` boolean;--> statement-breakpoint
ALTER TABLE `plans` DROP COLUMN `estimatedTime`;