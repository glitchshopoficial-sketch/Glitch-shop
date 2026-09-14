-- Registro de interesados. El envío de campañas requiere un proveedor de correo.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  email text PRIMARY KEY CHECK (length(email) <= 254),
  subscribed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;

-- No permite consultar correos ni saber si otra persona está suscrita.
CREATE OR REPLACE FUNCTION public.subscribe_newsletter(subscriber_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cleaned text := lower(trim(subscriber_email));
BEGIN
  IF cleaned IS NULL OR length(cleaned) > 254 OR cleaned !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Correo inválido';
  END IF;
  INSERT INTO public.newsletter_subscribers(email) VALUES (cleaned)
  ON CONFLICT (email) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.subscribe_newsletter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text) TO anon, authenticated;
