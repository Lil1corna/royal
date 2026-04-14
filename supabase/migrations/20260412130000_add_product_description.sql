-- Add description column to products if it doesn't exist.
-- Allows rich product descriptions in all languages.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.products ADD COLUMN description text DEFAULT '';
    COMMENT ON COLUMN public.products.description IS 'Product description (multilingual, stored as single text field)';
  END IF;
END
$$;
