CREATE TABLE public.platform_content (
  slug text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  author_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.platform_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_content TO authenticated;
GRANT ALL ON public.platform_content TO service_role;

ALTER TABLE public.platform_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published platform content is viewable by everyone"
  ON public.platform_content FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can view all platform content"
  ON public.platform_content FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert platform content"
  ON public.platform_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update platform content"
  ON public.platform_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete platform content"
  ON public.platform_content FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_platform_content_updated_at
  BEFORE UPDATE ON public.platform_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();