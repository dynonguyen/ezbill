ALTER TABLE groups
ADD COLUMN "paymentTrackingMode" varchar(20);

UPDATE groups SET "paymentTrackingMode" = 'accountant';

drop function if exists create_group_view(uuid);
drop function if exists create_bill_view(uuid);

select create_all_group_views();