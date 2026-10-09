-- The automatic RLS event trigger is internal infrastructure, never an API operation.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
NOTIFY pgrst, 'reload schema';
