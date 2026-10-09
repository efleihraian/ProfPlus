import json
from pathlib import Path
root=Path(__file__).resolve().parents[2];path=next((root/'supabase/migrations').glob('*_profplus_cloud_library.sql'))
s='''-- Additive cloud migration. Private payloads and privileged operations are server-only.
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
'''
for name in ('documents','document_labels','projects','conversations','account_deletions','guest_chat_budget','library_materials','library_import_documents','library_import_urls'):
 s+=f'ALTER TABLE public.{name} ENABLE ROW LEVEL SECURITY;\nREVOKE ALL ON public.{name} FROM anon,authenticated;\nGRANT ALL ON public.{name} TO service_role;\n'
for name in ('documents','document_labels','projects','conversations','account_deletions'):
 s+=f'''CREATE POLICY {name}_owner_select ON public.{name} FOR SELECT TO authenticated USING (user_id = 'supabase:' || (SELECT auth.uid())::text);
'''
s+='''-- This function accepts IDs of fixed, reviewed operations, never client-supplied SQL.
CREATE OR REPLACE FUNCTION public.profplus_app_ops(operations jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $function$
DECLARE item jsonb; args jsonb; v_sql text; rows jsonb; output jsonb := '[]'::jsonb;
BEGIN
 IF jsonb_typeof(operations) <> 'array' OR jsonb_array_length(operations)>20 OR octet_length(operations::text)>4194304 THEN RAISE EXCEPTION 'INVALID_OPERATION_BATCH'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(operations) LOOP
  args := item->'args';
  CASE item->>'op'
'''
for r in json.loads((root/'scripts/cloud/app-operations.json').read_text()):
 s+=f"  WHEN '{r['op']}' THEN\n   IF jsonb_typeof(args)<>'array' OR jsonb_array_length(args)<>{r['count']} THEN RAISE EXCEPTION 'INVALID_BINDINGS'; END IF;\n"
 if r['postgres'] is None:s+="   v_sql := NULL;\n";continue
 if r['ownerLock'] is not None:s+=f"   PERFORM pg_advisory_xact_lock(hashtextextended(args->>{r['ownerLock']},0));\n"
 query=r['postgres'].replace('SET used=used+1 WHERE used <','SET used=guest_chat_budget.used+1 WHERE guest_chat_budget.used <')
 if query.startswith('SELECT'):query="SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM ("+query+") t"
 else:query="WITH changed AS ("+query+") SELECT coalesce(jsonb_agg(to_jsonb(changed)),'[]'::jsonb) FROM changed"
 s+="   v_sql := '"+query.replace("'","''")+"';\n"
s+='''  ELSE RAISE EXCEPTION 'UNKNOWN_OPERATION';
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
'''
path.write_text(s);print('Migration generated:',path.name)
