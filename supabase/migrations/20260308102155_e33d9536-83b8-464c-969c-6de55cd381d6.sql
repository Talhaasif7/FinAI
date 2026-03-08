CREATE TABLE public.linked_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  card_type text NOT NULL DEFAULT 'debit',
  card_network text NOT NULL DEFAULT 'visa',
  last_four text NOT NULL,
  cardholder_name text NOT NULL,
  region text NOT NULL DEFAULT 'international',
  color text NOT NULL DEFAULT '#1a1a2e',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linked_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards" ON public.linked_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cards" ON public.linked_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.linked_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.linked_cards FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_linked_cards_updated_at BEFORE UPDATE ON public.linked_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();