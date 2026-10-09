-- Additive cloud migration. Private payloads and privileged operations are server-only.
CREATE TABLE IF NOT EXISTS public.documents(id text PRIMARY KEY,user_id text NOT NULL,chat_id text NOT NULL,name text NOT NULL,mime text NOT NULL,size bigint NOT NULL CHECK(size>0),store_id text,file_id text,status text NOT NULL,created_at bigint NOT NULL);
CREATE INDEX IF NOT EXISTS documents_user_chat ON public.documents(user_id,chat_id);
CREATE TABLE IF NOT EXISTS public.document_labels(document_id text PRIMARY KEY,user_id text NOT NULL,metadata text NOT NULL);
CREATE TABLE IF NOT EXISTS public.projects(id text PRIMARY KEY,user_id text NOT NULL,name text NOT NULL,created_at bigint NOT NULL);
CREATE TABLE IF NOT EXISTS public.conversations(id text PRIMARY KEY,user_id text NOT NULL,title text NOT NULL,project_id text,deleted integer NOT NULL DEFAULT 0,messages text NOT NULL,selection text NOT NULL,revision integer NOT NULL,created_at bigint NOT NULL,updated_at bigint NOT NULL);
CREATE INDEX IF NOT EXISTS conversations_user_updated ON public.conversations(user_id,updated_at);
CREATE TABLE IF NOT EXISTS public.account_deletions(user_id text PRIMARY KEY,started_at bigint NOT NULL);
CREATE TABLE IF NOT EXISTS public.guest_chat_budget(bucket text PRIMARY KEY,used integer NOT NULL,expires bigint NOT NULL);
CREATE TABLE IF NOT EXISTS public.library_materials(family text NOT NULL,uid text NOT NULL,kind text NOT NULL,bucket text NOT NULL,object_key text NOT NULL,sha256 text NOT NULL CHECK(length(sha256)=64),size bigint NOT NULL,filename text NOT NULL,metadata jsonb NOT NULL DEFAULT '{}',updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(family,uid,kind));
CREATE TABLE IF NOT EXISTS public.library_import_documents(family text NOT NULL,uid text NOT NULL,state jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(family,uid));
CREATE TABLE IF NOT EXISTS public.library_import_urls(family text NOT NULL,url text NOT NULL,state jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(family,url));
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.documents FROM anon,authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.document_labels ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.document_labels FROM anon,authenticated;
GRANT ALL ON public.document_labels TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.projects FROM anon,authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.conversations FROM anon,authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_deletions FROM anon,authenticated;
GRANT ALL ON public.account_deletions TO service_role;
ALTER TABLE public.guest_chat_budget ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.guest_chat_budget FROM anon,authenticated;
GRANT ALL ON public.guest_chat_budget TO service_role;
ALTER TABLE public.library_materials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.library_materials FROM anon,authenticated;
GRANT ALL ON public.library_materials TO service_role;
ALTER TABLE public.library_import_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.library_import_documents FROM anon,authenticated;
GRANT ALL ON public.library_import_documents TO service_role;
ALTER TABLE public.library_import_urls ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.library_import_urls FROM anon,authenticated;
GRANT ALL ON public.library_import_urls TO service_role;
CREATE POLICY documents_owner_select ON public.documents FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
CREATE POLICY document_labels_owner_select ON public.document_labels FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
CREATE POLICY projects_owner_select ON public.projects FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
CREATE POLICY conversations_owner_select ON public.conversations FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
CREATE POLICY account_deletions_owner_select ON public.account_deletions FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
-- This function accepts IDs of fixed, reviewed operations, never client-supplied SQL.
CREATE OR REPLACE FUNCTION public.profplus_app_ops(operations jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $function$
DECLARE item jsonb; args jsonb; v_sql text; rows jsonb; output jsonb := '[]'::jsonb;
BEGIN
 IF jsonb_typeof(operations) <> 'array' OR jsonb_array_length(operations)>20 OR octet_length(operations::text)>4194304 THEN RAISE EXCEPTION 'INVALID_OPERATION_BATCH'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(operations) LOOP
  args := item->'args';
  CASE item->>'op'
  WHEN '97eec64a68494a9c28785c64' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>0 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := NULL;
  WHEN 'c8f7267a5d68e8bbce531881' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>0 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := NULL;
  WHEN '0c5bc303798ee465c467477c' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>0 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := NULL;
  WHEN '61ed8e2010ca75c5765ddf7b' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM account_deletions WHERE user_id=($1->>0) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '8573a0ce16a33eb12f353fe4' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM conversations WHERE user_id=($1->>0) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'ed262c8a1b2e7a9d527faf07' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM document_labels WHERE document_id=($1->>0) AND user_id=($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '2077be6bdf62c2c9c363d232' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM document_labels WHERE user_id=($1->>0) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'e100bb9e1b546d96e422f8ae' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM documents WHERE id = ($1->>0) AND user_id = ($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'e923feddfe21f9a7a9141f33' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM documents WHERE id=($1->>0) AND user_id=($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '3cb3d2bbf62591d265dbd578' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM guest_chat_budget WHERE expires < ($1->>0)::bigint RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'f5d9e44c071b375999fafcc0' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM projects WHERE id=($1->>0) AND user_id=($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'aa230202447410ce6840e018' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (DELETE FROM projects WHERE user_id=($1->>0) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '0e8edd44c8fb335b9e3166cd' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>6 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (INSERT INTO conversations(id,user_id,title,project_id,messages,selection,revision,created_at,updated_at) SELECT ($1->>0),($1->>1),''Conversație nouă'',($1->>2),''[]'',''null'',0,($1->>3)::bigint,($1->>4)::bigint WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=($1->>5)) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '3c78a77e412de33b55567a98' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>4 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (INSERT INTO document_labels(document_id,user_id,metadata) SELECT id,user_id,($1->>0) FROM documents WHERE id=($1->>1) AND user_id=($1->>2) AND status!=''deleting'' AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=($1->>3)) ON CONFLICT(document_id) DO UPDATE SET metadata=excluded.metadata WHERE document_labels.user_id=excluded.user_id RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'a592f498351c4564b23752ca' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>11 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   PERFORM pg_advisory_xact_lock(hashtextextended(args->>7,0));
   v_sql := 'WITH changed AS (INSERT INTO documents (id,user_id,chat_id,name,mime,size,status,created_at) SELECT ($1->>0),($1->>1),($1->>2),($1->>3),($1->>4),($1->>5)::bigint,''uploading'',($1->>6)::bigint WHERE (SELECT COUNT(*) FROM documents WHERE user_id = ($1->>7) AND chat_id = ($1->>8)) < 10 AND (SELECT COUNT(*) FROM documents WHERE user_id = ($1->>9)) < 50 AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id = ($1->>10)) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '3e2a041e3bf776cabd2512a6' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>3 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (INSERT INTO guest_chat_budget(bucket,used,expires) VALUES (($1->>0),1,($1->>1)::bigint) ON CONFLICT(bucket) DO UPDATE SET used=guest_chat_budget.used+1 WHERE guest_chat_budget.used < ($1->>2)::bigint RETURNING used) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'db57adc1b978b9660739b9ee' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>5 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (INSERT INTO projects(id,user_id,name,created_at) SELECT ($1->>0),($1->>1),($1->>2),($1->>3)::bigint WHERE NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=($1->>4)) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'eae7771cb331921f65df57c2' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>4 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   PERFORM pg_advisory_xact_lock(hashtextextended(args->>0,0));
   v_sql := 'WITH changed AS (INSERT INTO account_deletions (user_id,started_at) SELECT ($1->>0),($1->>1)::bigint WHERE NOT EXISTS (SELECT 1 FROM documents WHERE user_id=($1->>2) AND status=''uploading'' AND created_at>($1->>3)::bigint) ON CONFLICT DO NOTHING RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'b0cf883c092cf8c2576e3f58' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (INSERT INTO conversations (id,user_id,title,messages,selection,revision,created_at,updated_at) SELECT chat_id,user_id,''Documente anterioare'',''[]'',''null'',0,MIN(created_at),MAX(created_at) FROM documents WHERE user_id=($1->>0) AND NOT EXISTS (SELECT 1 FROM account_deletions WHERE user_id=($1->>1)) GROUP BY chat_id,user_id ON CONFLICT DO NOTHING RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '9f4b940c82b2826289813a0b' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT * FROM documents WHERE id = ($1->>0) AND user_id = ($1->>1)) t';
  WHEN 'a0bae600239867854083503a' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT * FROM documents WHERE user_id = ($1->>0) AND chat_id = ($1->>1) ORDER BY created_at) t';
  WHEN '1d0dc1e05dbfaeed7bc7ec69' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT * FROM documents WHERE user_id=($1->>0)) t';
  WHEN 'd87398cfb49806f35a2c90f1' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT d.*,l.metadata AS education FROM documents d LEFT JOIN document_labels l ON d.id=l.document_id AND d.user_id=l.user_id WHERE d.user_id = ($1->>0) ORDER BY d.created_at DESC) t';
  WHEN '63ad161aeb858317d3090585' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id FROM conversations WHERE id=($1->>0) AND user_id=($1->>1) AND deleted=0) t';
  WHEN '821c896501ce51d3682a2429' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id FROM documents WHERE user_id=($1->>0) AND status=''uploading'' AND created_at>($1->>1)::bigint) t';
  WHEN 'ec488261c419dc49e7b11767' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id FROM projects WHERE id=($1->>0) AND user_id=($1->>1)) t';
  WHEN '75d4abdabfb76ab32b7e11ee' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id,name FROM projects WHERE user_id=($1->>0) ORDER BY created_at DESC) t';
  WHEN 'bac49989262ac4d5aed4a6ff' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id,title,project_id,messages,selection,revision,created_at,updated_at FROM conversations WHERE id=($1->>0) AND user_id=($1->>1) AND deleted=0) t';
  WHEN 'a07d01d55782892d6d9dcd5f' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT id,title,project_id,revision,updated_at FROM conversations WHERE user_id=($1->>0) AND deleted=0 ORDER BY updated_at DESC) t';
  WHEN 'ba59cee7f5817974c0e1c53e' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT messages,revision FROM conversations WHERE id=($1->>0) AND user_id=($1->>1) AND deleted=0) t';
  WHEN 'ef42f1c1881db7c27937cf59' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>1 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'SELECT coalesce(jsonb_agg(to_jsonb(t)),''[]''::jsonb) FROM (SELECT user_id FROM account_deletions WHERE user_id=($1->>0)) t';
  WHEN '99f06cba587cd6285544e3a3' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>3 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE conversations SET deleted=1,messages=''[]'',selection=''null'',title=''Conversație ștearsă'',revision=revision+1,updated_at=($1->>0)::bigint WHERE id=($1->>1) AND user_id=($1->>2) AND deleted=0 RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'c512efeff724626d06b3b4c7' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>5 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE conversations SET messages=($1->>0),revision=revision+1,updated_at=($1->>1)::bigint WHERE id=($1->>2) AND user_id=($1->>3) AND revision=($1->>4)::bigint AND deleted=0 RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '2edbd051e48cc3a284ef954a' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE conversations SET project_id=NULL,revision=revision+1 WHERE project_id=($1->>0) AND user_id=($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '191a4aeb8839090049483797' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>8 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE conversations SET title=($1->>0),project_id=($1->>1),messages=($1->>2),selection=($1->>3),revision=revision+1,updated_at=($1->>4)::bigint WHERE id=($1->>5) AND user_id=($1->>6) AND revision=($1->>7)::bigint AND deleted=0 RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '2de7222b77b3c367d9ae8283' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>3 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET file_id = ($1->>0) WHERE id = ($1->>1) AND user_id = ($1->>2) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '8dcde126d56d9c52e2f706a2' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status = ''deleting'' WHERE id = ($1->>0) AND user_id = ($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'e74f955aef7045c95179e066' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status = ''failed'' WHERE id = ($1->>0) AND user_id = ($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '2fdd5ef663d1c9a72683e5c7' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status = ''failed'' WHERE id = ($1->>0) AND user_id = ($1->>1) AND status = ''uploading'' RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '73e78587628719053ff54333' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status = ''indexing'' WHERE id = ($1->>0) AND user_id = ($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '6e0b280f3a320bcf7ec80f1e' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>3 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status = ($1->>0) WHERE id = ($1->>1) AND user_id = ($1->>2) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN '649efc94d7f09615344d4553' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>2 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET status=''deleting'' WHERE id=($1->>0) AND user_id=($1->>1) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  WHEN 'f384eeb3add187a4b273ba42' THEN
   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>3 THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;
   v_sql := 'WITH changed AS (UPDATE documents SET store_id = ($1->>0) WHERE id = ($1->>1) AND user_id = ($1->>2) RETURNING 1 AS changed) SELECT coalesce(jsonb_agg(to_jsonb(changed)),''[]''::jsonb) FROM changed';
  ELSE RAISE EXCEPTION 'UNKNOWN_OPERATION';
  END CASE;
  IF v_sql IS NULL THEN rows := '[]'::jsonb; ELSE EXECUTE v_sql INTO rows USING args; END IF;
  output := output || jsonb_build_array(jsonb_build_object('success',true,'results',rows,'meta',jsonb_build_object('changes',jsonb_array_length(rows))));
 END LOOP;
 RETURN output;
END;
$function$;
REVOKE ALL ON FUNCTION public.profplus_app_ops(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.profplus_app_ops(jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
