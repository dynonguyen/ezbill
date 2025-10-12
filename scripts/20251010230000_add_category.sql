ALTER TABLE groups
ADD COLUMN "categories" jsonb[] not null default '{}'::jsonb[];

ALTER TABLE bills
ADD COLUMN "categoryIds" text[] not null default '{}'::text[];

select create_all_group_views();
select create_all_bill_views();