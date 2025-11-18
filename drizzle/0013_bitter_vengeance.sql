ALTER TABLE `plans` ADD `dietType` varchar(128);--> statement-breakpoint
ALTER TABLE `plans` ADD `mode` varchar(64);--> statement-breakpoint
ALTER TABLE `plans` ADD `skillLevel` varchar(64);--> statement-breakpoint
ALTER TABLE `plans` ADD `availableTime` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `estimatedTime` int;--> statement-breakpoint
ALTER TABLE `plans` ADD `allowNewIngredients` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `plans` ADD `maxKcalPerServing` int;