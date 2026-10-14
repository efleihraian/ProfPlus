-- Published news remain readable when displaced from the four homepage positions.
alter table public.profplus_news drop constraint profplus_news_slot_check;
alter table public.profplus_news add constraint profplus_news_slot_check check(slot between 0 and 4);
drop index public.profplus_news_published_slot;
create unique index profplus_news_published_slot on public.profplus_news(slot) where status='published' and slot<4;
create or replace function public.profplus_save_news(actor uuid,article jsonb default null,settings jsonb default null) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare target uuid; expected integer; saved public.profplus_news; replaced uuid;begin
 if not exists(select 1 from public.profplus_admins where user_id=actor) then raise insufficient_privilege; end if;
 if (article is null)=(settings is null) then raise exception 'INVALID_REQUEST'; end if;
 if settings is not null then
  update public.profplus_news_settings set title=settings->>'title',intro=settings->>'intro' where id=1;
  insert into public.profplus_admin_audit(actor,action) values(actor,'news.settings');
 else
  target=(article->>'id')::uuid;expected=(article->>'revision')::integer;
  -- Serialize homepage placement. Stale writes roll back displacement and audit.
  perform pg_advisory_xact_lock(7920261014);
  if article->>'status'='published' and (article->>'slot')::integer<4 then
   for replaced in select id from public.profplus_news where status='published' and slot=(article->>'slot')::integer and id<>target for update loop
    update public.profplus_news set slot=4,revision=revision+1,updated_at=now() where id=replaced;
    insert into public.profplus_admin_audit(actor,action,object_id) values(actor,'news.home_replaced',replaced);
   end loop;
  end if;
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
notify pgrst,'reload schema';
