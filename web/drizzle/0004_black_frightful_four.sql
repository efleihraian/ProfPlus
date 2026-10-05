CREATE TABLE `document_labels` (
	`document_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`metadata` text NOT NULL
);
