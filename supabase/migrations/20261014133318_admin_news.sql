-- Additive admin/news storage. Membership is provisioned by an operator, never a profile field.
create table public.profplus_admins(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table public.profplus_news(id uuid primary key,title text not null check(length(title) between 1 and 200),summary text not null default '' check(length(summary)<=600),body text not null default '' check(length(body)<=20000),category text not null default '' check(length(category)<=80),image_url text not null default '' check(image_url='' or image_url ~ '^https://'),source_url text not null default '' check(source_url='' or source_url ~ '^https://'),slot integer not null check(slot between 0 and 3),status text not null check(status in ('draft','published','archived')),published_at timestamptz,revision integer not null default 0 check(revision>=0),updated_at timestamptz not null default now(),check(status<>'published' or published_at is not null));
create unique index profplus_news_published_slot on public.profplus_news(slot) where status='published';
create table public.profplus_news_settings(id integer primary key check(id=1),title text not null check(length(title) between 1 and 100),intro text not null check(length(intro)<=600));
insert into public.profplus_news_settings values(1,'Știri pentru profesori','Legislație, examene, resurse și evenimente din educație.');
create table public.profplus_admin_audit(id bigint generated always as identity primary key,actor uuid references auth.users(id) on delete set null,action text not null,object_id uuid,created_at timestamptz not null default now());
create index profplus_admin_audit_created on public.profplus_admin_audit(created_at);
alter table public.profplus_admins enable row level security;
alter table public.profplus_news enable row level security;
alter table public.profplus_news_settings enable row level security;
alter table public.profplus_admin_audit enable row level security;
revoke all on public.profplus_admins,public.profplus_news,public.profplus_news_settings,public.profplus_admin_audit from public,anon,authenticated;
grant all on public.profplus_admins,public.profplus_news,public.profplus_news_settings,public.profplus_admin_audit to service_role;
grant usage,select on sequence public.profplus_admin_audit_id_seq to service_role;
create function public.profplus_save_news(actor uuid,article jsonb default null,settings jsonb default null) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare target uuid; expected integer; saved public.profplus_news;begin
 if not exists(select 1 from public.profplus_admins where user_id=actor) then raise insufficient_privilege; end if;
 if (article is null)=(settings is null) then raise exception 'INVALID_REQUEST'; end if;
 if settings is not null then
  update public.profplus_news_settings set title=settings->>'title',intro=settings->>'intro' where id=1;
  insert into public.profplus_admin_audit(actor,action) values(actor,'news.settings');
 else
  target=(article->>'id')::uuid;expected=(article->>'revision')::integer;
  if expected=0 then
   insert into public.profplus_news(id,title,summary,body,category,image_url,source_url,slot,status,published_at,revision) values(target,article->>'title',article->>'summary',article->>'body',article->>'category',article->>'image_url',article->>'source_url',(article->>'slot')::integer,article->>'status',(article->>'published_at')::timestamptz,1) returning * into saved;
  else
   update public.profplus_news set title=article->>'title',summary=article->>'summary',body=article->>'body',category=article->>'category',image_url=article->>'image_url',source_url=article->>'source_url',slot=(article->>'slot')::integer,status=article->>'status',published_at=(article->>'published_at')::timestamptz,revision=revision+1,updated_at=now() where id=target and revision=expected returning * into saved;
   if not found then raise unique_violation using message='NEWS_REVISION_CONFLICT'; end if;
  end if;
  insert into public.profplus_admin_audit(actor,action,object_id) values(actor,'news.'||saved.status,target);
 end if;
 delete from public.profplus_admin_audit where created_at<now()-interval '90 days';
 return jsonb_build_object('id',target,'revision',saved.revision);
end $$;
revoke all on function public.profplus_save_news(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.profplus_save_news(uuid,jsonb,jsonb) to service_role;
create function public.profplus_admin_stats() returns jsonb language sql security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('activeAccounts',(select count(*) from (select user_id from public.conversations union select user_id from public.documents union select user_id from public.projects) a),'conversations',(select count(*) from public.conversations where deleted=0),'projects',(select count(*) from public.projects),'documents',(select count(*) from public.documents),'readyDocuments',(select count(*) from public.documents where status='ready'),'failedDocuments',(select count(*) from public.documents where status='failed'),'libraryMaterials',(select count(*) from public.library_materials),'libraryIndexed',(select count(*) from public.library_import_documents where state->>'status'='completed'),'newsPublished',(select count(*) from public.profplus_news where status='published'),'newsDrafts',(select count(*) from public.profplus_news where status='draft'),'recentEdits',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select action,object_id,created_at from public.profplus_admin_audit where created_at>=now()-interval '90 days' order by created_at desc limit 20)t));
$$;
revoke all on function public.profplus_admin_stats() from public,anon,authenticated;
grant execute on function public.profplus_admin_stats() to service_role;
notify pgrst,'reload schema';
