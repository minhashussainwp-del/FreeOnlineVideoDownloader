-- site_content: editable content blocks for pages/sections
CREATE TABLE public.site_content (
  key TEXT NOT NULL PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is viewable by everyone"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- tool_settings: enable/disable + text overrides per downloader tool
CREATE TABLE public.tool_settings (
  slug TEXT NOT NULL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  name TEXT,
  tagline TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.tool_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_settings TO authenticated;
GRANT ALL ON public.tool_settings TO service_role;

ALTER TABLE public.tool_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tool settings are viewable by everyone"
  ON public.tool_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert tool settings"
  ON public.tool_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tool settings"
  ON public.tool_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tool settings"
  ON public.tool_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_tool_settings_updated_at
  BEFORE UPDATE ON public.tool_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();