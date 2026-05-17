-- Run this if the app shows "Failed to load entries" after sign-in.
-- Needed when "Automatically expose new tables" was disabled in project settings.

GRANT USAGE ON SCHEMA public TO authenticated, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.images TO authenticated;
