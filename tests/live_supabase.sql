-- Synthetic fixtures only. Everything is rolled back, including role changes.
BEGIN;
DO $test$
DECLARE answer jsonb; user_a text := 'supabase:11111111-1111-4111-8111-111111111111'; user_b text := 'supabase:22222222-2222-4222-8222-222222222222';
BEGIN
 INSERT INTO public.documents(id,user_id,chat_id,name,mime,size,status,created_at)
 VALUES ('p057-live-fixture-a',user_a,'p057-fixture','Synthetic A','text/plain',1,'ready',1),('p057-live-fixture-b',user_b,'p057-fixture','Synthetic B','text/plain',1,'ready',1);
 answer := public.profplus_app_ops(jsonb_build_array(jsonb_build_object('op','9f4b940c82b2826289813a0b','args',jsonb_build_array('p057-live-fixture-a',user_a))));
 IF jsonb_array_length(answer->0->'results') <> 1 THEN RAISE EXCEPTION 'OWNER_READ_FAILED'; END IF;
 answer := public.profplus_app_ops(jsonb_build_array(jsonb_build_object('op','9f4b940c82b2826289813a0b','args',jsonb_build_array('p057-live-fixture-a',user_b))));
 IF jsonb_array_length(answer->0->'results') <> 0 THEN RAISE EXCEPTION 'OWNER_ISOLATION_FAILED'; END IF;
 answer := public.profplus_app_ops(jsonb_build_array(jsonb_build_object('op','9f4b940c82b2826289813a0b','args',jsonb_build_array('x''; DELETE FROM documents; --',user_a))));
 IF jsonb_array_length(answer->0->'results') <> 0 THEN RAISE EXCEPTION 'SQL_BINDING_FAILED'; END IF;
 BEGIN
  PERFORM public.profplus_app_ops(jsonb_build_array(jsonb_build_object('op','db57adc1b978b9660739b9ee','args',jsonb_build_array('p057-rollback-fixture',user_a,'Fixture',1,user_a)),jsonb_build_object('op','unknown','args','[]'::jsonb)));
  RAISE EXCEPTION 'UNKNOWN_OPERATION_ACCEPTED';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM <> 'UNKNOWN_OPERATION' THEN RAISE; END IF;
 END;
 IF EXISTS(SELECT FROM public.projects WHERE id='p057-rollback-fixture') THEN RAISE EXCEPTION 'ATOMIC_ROLLBACK_FAILED'; END IF;
 IF EXISTS(SELECT FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND (NOT c.relrowsecurity OR has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') OR has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))) THEN RAISE EXCEPTION 'TABLE_ACCESS_EXPOSED'; END IF;
 IF has_function_privilege('anon','public.profplus_app_ops(jsonb)','EXECUTE') OR has_function_privilege('authenticated','public.profplus_app_ops(jsonb)','EXECUTE') THEN RAISE EXCEPTION 'RPC_EXPOSED'; END IF;
END;
$test$;
SET LOCAL ROLE authenticated;
DO $test$
BEGIN
 BEGIN
  PERFORM id FROM public.documents;
  RAISE EXCEPTION 'DIRECT_READ_ACCEPTED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  PERFORM public.profplus_app_ops('[]');
  RAISE EXCEPTION 'DIRECT_RPC_ACCEPTED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END;
$test$;
RESET ROLE;
ROLLBACK;
SELECT true AS verified_owner_bindings_atomic_rollback_and_direct_access_denial;
