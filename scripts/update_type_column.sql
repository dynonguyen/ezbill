----------------------------------------------------------------------------
-- Migration script để update cột type trong bảng bills

-- Đầu tiên, tạo một function để kiểm tra xem tất cả các giá trị trong JSONB object có bằng nhau hay không
CREATE OR REPLACE FUNCTION are_jsonb_values_equal(jsonb_data JSONB) RETURNS BOOLEAN AS $$
DECLARE
  values_array NUMERIC[];
  first_value NUMERIC;
BEGIN
  -- Lấy tất cả các giá trị từ JSONB object và chuyển thành array
  SELECT ARRAY_AGG(value::NUMERIC) INTO values_array
  FROM jsonb_each(jsonb_data);

  -- Nếu array rỗng hoặc null thì return false
  IF values_array IS NULL OR array_length(values_array, 1) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Lấy giá trị đầu tiên
  first_value := values_array[1];

  -- So sánh tất cả các giá trị với giá trị đầu tiên
  RETURN NOT EXISTS (
    SELECT 1
    FROM unnest(values_array) AS val
    WHERE val <> first_value
  );
END;
$$ LANGUAGE plpgsql;

-- Update cột type dựa trên điều kiện
UPDATE bills
SET type = CASE
  WHEN are_jsonb_values_equal(members) THEN 'equally'
  ELSE 'exact'
END;

-- Optional: Xóa function sau khi sử dụng
DROP FUNCTION IF EXISTS are_jsonb_values_equal(jsonb);

----------------------------------------------------------------------------
-- Recreate bill view
DO $$
DECLARE
    rec RECORD;
    group_id_uuid uuid;
BEGIN
    -- Xóa tất cả các view bắt đầu bằng 'bill_'
    FOR rec IN (
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname LIKE 'bill_%'
    ) LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE;', rec.viewname);
        RAISE NOTICE 'Dropped view: %', rec.viewname;
    END LOOP;

    -- Lấy tất cả id từ bảng groups và tạo lại các view
    FOR rec IN (
        SELECT id
        FROM groups
    ) LOOP
        group_id_uuid := rec.id;
        PERFORM create_bill_view(group_id_uuid);
        RAISE NOTICE 'Created view for group_id: %', group_id_uuid;
    END LOOP;
END $$;