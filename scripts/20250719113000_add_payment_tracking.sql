ALTER TABLE groups
ADD COLUMN "paymentTrackingMode" varchar(20);

UPDATE groups SET "paymentTrackingMode" = 'accountant';

ALTER TABLE bills
ADD COLUMN "paymentTracking" jsonb not null default '[]'::jsonb;

select create_all_group_views();
select create_all_bill_views();