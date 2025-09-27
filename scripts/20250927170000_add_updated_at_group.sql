ALTER TABLE groups
ADD COLUMN "updatedAt" timestamp with time zone not null default now();

select create_all_group_views();