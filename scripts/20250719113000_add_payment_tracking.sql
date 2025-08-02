ALTER TABLE groups
ADD COLUMN "paymentTrackingMode" varchar(20);

UPDATE groups SET "paymentTrackingMode" = 'accountant';

ALTER TABLE bills
ADD COLUMN "paymentTracking" jsonb not null default '[]'::jsonb;

select create_all_group_views();
select create_all_bill_views();

CREATE OR REPLACE FUNCTION mark_bills_as_paid(
	bill_view_name TEXT,
  member_id TEXT,
  bill_ids INTEGER[],
  payment_timestamp TEXT
) RETURNS VOID AS $$
DECLARE
  payment_entry JSONB;
BEGIN
  -- Create payment entry JSON
  payment_entry := jsonb_build_object(
    'createdAt', payment_timestamp,
    'memberId', member_id
  );

  -- Update bills where the member hasn't already paid
  EXECUTE format('
    UPDATE %I
    SET "paymentTracking" = COALESCE("paymentTracking", ''[]''::jsonb) || $1::jsonb
    WHERE id = ANY($2)
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE("paymentTracking", ''[]''::jsonb)) AS elem
      WHERE elem->>''memberId'' = $3
    )
  ', bill_view_name)
  USING jsonb_build_array(payment_entry), bill_ids, member_id;
END;
$$ LANGUAGE plpgsql;