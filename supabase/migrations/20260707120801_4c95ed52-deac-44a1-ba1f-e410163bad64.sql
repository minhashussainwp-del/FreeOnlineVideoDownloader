-- Add SEO audit tracking columns to posts and a trigger that flags posts
-- for (re)audit whenever a published post is created or its SEO-relevant
-- content changes. The bulk audit clears these flags after scoring.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_audit_pending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_audited_at timestamp with time zone;

CREATE OR REPLACE FUNCTION public.mark_post_needs_seo_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.status = 'published' THEN
      NEW.seo_audit_pending := true;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: flag only when the post is (or becomes) published AND a
  -- SEO-relevant field changed. Clearing the audit flags (which only touch
  -- seo_audit_pending / seo_audited_at) does not re-trigger a flag.
  IF NEW.status = 'published' AND (
        OLD.status IS DISTINCT FROM NEW.status OR
        NEW.title IS DISTINCT FROM OLD.title OR
        NEW.slug IS DISTINCT FROM OLD.slug OR
        NEW.excerpt IS DISTINCT FROM OLD.excerpt OR
        NEW.content IS DISTINCT FROM OLD.content OR
        NEW.featured_image IS DISTINCT FROM OLD.featured_image OR
        NEW.category IS DISTINCT FROM OLD.category OR
        NEW.tags IS DISTINCT FROM OLD.tags OR
        NEW.meta_title IS DISTINCT FROM OLD.meta_title OR
        NEW.meta_description IS DISTINCT FROM OLD.meta_description
     ) THEN
    NEW.seo_audit_pending := true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_post_needs_seo_audit ON public.posts;
CREATE TRIGGER trg_mark_post_needs_seo_audit
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_post_needs_seo_audit();

-- Backfill: mark all currently published posts as pending an audit.
UPDATE public.posts SET seo_audit_pending = true WHERE status = 'published';