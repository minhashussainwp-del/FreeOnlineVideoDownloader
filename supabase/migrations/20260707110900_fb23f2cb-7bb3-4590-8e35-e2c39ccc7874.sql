CREATE TABLE public.seo_audit_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL DEFAULT 'completed',
  trigger text NOT NULL DEFAULT 'manual',
  total_posts integer NOT NULL DEFAULT 0,
  avg_score integer,
  prev_avg_score integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audit_runs TO authenticated;
GRANT ALL ON public.seo_audit_runs TO service_role;

ALTER TABLE public.seo_audit_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seo audit runs"
ON public.seo_audit_runs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.seo_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.seo_audit_runs(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  post_title text,
  post_slug text,
  score integer NOT NULL DEFAULT 0,
  previous_score integer,
  grade text,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  checked_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audits TO authenticated;
GRANT ALL ON public.seo_audits TO service_role;

ALTER TABLE public.seo_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seo audits"
ON public.seo_audits
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX seo_audits_run_id_idx ON public.seo_audits(run_id);
CREATE INDEX seo_audits_post_id_idx ON public.seo_audits(post_id);
CREATE INDEX seo_audit_runs_created_at_idx ON public.seo_audit_runs(created_at DESC);