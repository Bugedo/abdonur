-- Cancellation metadata and align status CHECK with app workflow.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.cancellation_reason IS 'Motivo opcional ingresado por el local al cancelar';
COMMENT ON COLUMN orders.cancelled_at IS 'Momento en que el pedido fue cancelado';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'confirmed', 'on_the_way', 'ready', 'completed', 'cancelled'));
