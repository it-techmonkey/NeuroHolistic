-- ============================================================
-- Client discounts table
-- Allows admins to assign 10%, 15%, or 20% discounts to specific clients
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent IN (10, 15, 20)),
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One active discount per client at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_discount_per_client
  ON public.client_discounts(client_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_discounts_client_id ON public.client_discounts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_discounts_is_active ON public.client_discounts(is_active);

-- Row-level security: admins can manage all, clients can read their own
ALTER TABLE public.client_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all discounts"
  ON public.client_discounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Clients can read their own discounts"
  ON public.client_discounts
  FOR SELECT
  USING (client_id = auth.uid());
