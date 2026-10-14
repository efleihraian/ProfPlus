-- Real database contract checks: all fixtures and audit effects are rolled back.
begin;
set local role service_role;
do $$
declare admin_id uuid;id1 uuid=gen_random_uuid();id2 uuid=gen_random_uuid();item jsonb;result jsonb;begin
 select user_id into strict admin_id from public.profplus_admins limit 1;
 item=jsonb_build_object('id',id1,'title','Synthetic QA article','summary','Fixture','body','Plain text <script>not executable</script>','category','QA','image_url','','source_url','','slot',3,'status','draft','published_at',null,'revision',0);
 result=public.profplus_save_news(admin_id,item,null);
 if result->>'revision'<>'1' then raise exception 'INSERT_CONTRACT';end if;
 item=item||jsonb_build_object('revision',1,'status','published','published_at',now());
 result=public.profplus_save_news(admin_id,item,null);
 if result->>'revision'<>'2' then raise exception 'UPDATE_CONTRACT';end if;
 begin perform public.profplus_save_news(admin_id,item,null);raise exception 'STALE_WRITE_ALLOWED';exception when unique_violation then null;end;
 begin perform public.profplus_save_news(gen_random_uuid(),item,null);raise exception 'UNKNOWN_ADMIN_ALLOWED';exception when insufficient_privilege then null;end;
 perform public.profplus_save_news(admin_id,item||jsonb_build_object('id',id2,'revision',0),null);
 if not exists(select 1 from public.profplus_news where id=id1 and slot=4 and status='published' and revision=3) then raise exception 'DISPLACED_NEWS_LOST';end if;
 if not exists(select 1 from public.profplus_news where id=id2 and slot=3 and revision=1) then raise exception 'NEW_HOME_NEWS_MISSING';end if;
 -- A stale update must not displace the newly published article or change its revision.
 begin perform public.profplus_save_news(admin_id,item,null);raise exception 'STALE_REPLACEMENT_ALLOWED';exception when unique_violation then null;end;
 if not exists(select 1 from public.profplus_news where id=id2 and slot=3 and revision=1) then raise exception 'PARTIAL_HOME_DISPLACEMENT';end if;
 perform public.profplus_admin_stats();
end $$;
set local role anon;
do $$ begin
 begin perform title from public.profplus_news;raise exception 'ANON_READ_ALLOWED';exception when insufficient_privilege then null;end;
 begin perform public.profplus_admin_stats();raise exception 'ANON_STATS_ALLOWED';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
do $$ begin
 begin insert into public.profplus_admins values(gen_random_uuid(),now());raise exception 'SELF_PROMOTION_ALLOWED';exception when insufficient_privilege then null;end;
 begin perform public.profplus_save_news(gen_random_uuid(),null,null);raise exception 'USER_WRITE_ALLOWED';exception when insufficient_privilege then null;end;
end $$;
rollback;
select 'admin/news isolation and atomic writes passed; fixtures rolled back' as verification;
