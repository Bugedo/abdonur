-- Cancellation metadata and align status CHECK with app workflow.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.cancellation_reason IS 'Optional reason entered by branch staff when cancelling';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when the order was cancelled';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'confirmed', 'on_the_way', 'ready', 'completed', 'cancelled'));
