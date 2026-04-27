-- Name: warmup_accounts Users can manage own warmup accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage own warmup accounts" ON public.warmup_accounts USING ((auth.uid() = user_id));


--
-- Name: warmup_emails Users can manage own warmup emails; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage own warmup emails" ON public.warmup_emails USING ((EXISTS ( SELECT 1
   FROM public.warmup_accounts wa
  WHERE ((wa.id = warmup_emails.from_account_id) AND (wa.user_id = auth.uid())))));


--
-- Name: warmup_stats Users can manage own warmup stats; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage own warmup stats" ON public.warmup_stats USING ((EXISTS ( SELECT 1
   FROM public.warmup_accounts wa
  WHERE ((wa.id = warmup_stats.account_id) AND (wa.user_id = auth.uid())))));


--
-- Name: drafts Users can manage their own drafts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own drafts" ON public.drafts USING ((auth.uid() = user_id));


--
-- Name: draft_folders Users can manage their own folders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own folders" ON public.draft_folders USING ((auth.uid() = user_id));


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: attachments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_accounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.campaign_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_accounts campaign_accounts_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaign_accounts_user_isolation ON public.campaign_accounts USING ((campaign_id IN ( SELECT campaigns.id
   FROM public.campaigns
  WHERE (campaigns.user_id = (auth.uid())::text))));


--
-- Name: campaign_stats; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.campaign_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_stats campaign_stats_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaign_stats_user_isolation ON public.campaign_stats USING ((campaign_id IN ( SELECT campaigns.id
   FROM public.campaigns
  WHERE (campaigns.user_id = (auth.uid())::text))));


--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campaigns_user_isolation ON public.campaigns USING ((user_id = (auth.uid())::text));


--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: deals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

--
-- Name: draft_folders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.draft_folders ENABLE ROW LEVEL SECURITY;

--
-- Name: drafts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

--
-- Name: email_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: email_logs email_logs_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY email_logs_user_isolation ON public.email_logs USING ((campaign_id IN ( SELECT campaigns.id
   FROM public.campaigns
  WHERE (campaigns.user_id = (auth.uid())::text))));


--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: leads leads_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY leads_user_isolation ON public.leads USING ((campaign_id IN ( SELECT campaigns.id
   FROM public.campaigns
  WHERE (campaigns.user_id = (auth.uid())::text))));


--
-- Name: notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.activity_logs TO project_admin USING (true) WITH CHECK (true);


--
-- Name: attachments project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.attachments TO project_admin USING (true) WITH CHECK (true);


--
-- Name: campaign_accounts project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.campaign_accounts TO project_admin USING (true) WITH CHECK (true);


--
-- Name: campaign_stats project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.campaign_stats TO project_admin USING (true) WITH CHECK (true);


--
-- Name: campaigns project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.campaigns TO project_admin USING (true) WITH CHECK (true);


--
-- Name: companies project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.companies TO project_admin USING (true) WITH CHECK (true);


--
-- Name: contacts project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.contacts TO project_admin USING (true) WITH CHECK (true);


--
-- Name: deals project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.deals TO project_admin USING (true) WITH CHECK (true);


--
-- Name: draft_folders project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.draft_folders TO project_admin USING (true) WITH CHECK (true);


--
-- Name: drafts project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.drafts TO project_admin USING (true) WITH CHECK (true);


--
-- Name: email_logs project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.email_logs TO project_admin USING (true) WITH CHECK (true);


--
-- Name: leads project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.leads TO project_admin USING (true) WITH CHECK (true);


--
-- Name: notes project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.notes TO project_admin USING (true) WITH CHECK (true);


--
-- Name: replies project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.replies TO project_admin USING (true) WITH CHECK (true);


--
-- Name: sender_accounts project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.sender_accounts TO project_admin USING (true) WITH CHECK (true);


--
-- Name: tasks project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.tasks TO project_admin USING (true) WITH CHECK (true);


--
-- Name: user_settings project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.user_settings TO project_admin USING (true) WITH CHECK (true);


--
-- Name: warmup_accounts project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.warmup_accounts TO project_admin USING (true) WITH CHECK (true);


--
-- Name: warmup_emails project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.warmup_emails TO project_admin USING (true) WITH CHECK (true);


--
-- Name: warmup_stats project_admin_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_admin_policy ON public.warmup_stats TO project_admin USING (true) WITH CHECK (true);


--
-- Name: replies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

--
-- Name: replies replies_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY replies_user_isolation ON public.replies USING ((lead_id IN ( SELECT l.id
   FROM (public.leads l
     JOIN public.campaigns c ON ((l.campaign_id = c.id)))
  WHERE (c.user_id = (auth.uid())::text))));


--
-- Name: sender_accounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sender_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: sender_accounts sender_accounts_user_isolation; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sender_accounts_user_isolation ON public.sender_accounts USING ((user_id = (auth.uid())::text));


--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings user_settings_own_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_settings_own_policy ON public.user_settings USING ((user_id = (auth.uid())::text)) WITH CHECK ((user_id = (auth.uid())::text));


--
-- Name: warmup_accounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.warmup_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA auth TO PUBLIC;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO project_admin;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO anon;


--
-- Name: FUNCTION channel_name(); Type: ACL; Schema: realtime; Owner: postgres
--

GRANT ALL ON FUNCTION realtime.channel_name() TO authenticated;
GRANT ALL ON FUNCTION realtime.channel_name() TO anon;


--
-- Name: FUNCTION publish(p_channel_name text, p_event_name text, p_payload jsonb); Type: ACL; Schema: realtime; Owner: postgres
--

REVOKE ALL ON FUNCTION realtime.publish(p_channel_name text, p_event_name text, p_payload jsonb) FROM PUBLIC;


--
-- Name: TABLE configs; Type: ACL; Schema: ai; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.configs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.configs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.configs TO project_admin;


--
-- Name: TABLE usage; Type: ACL; Schema: ai; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.usage TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.usage TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ai.usage TO project_admin;


--
-- Name: TABLE configs; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.configs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.configs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.configs TO project_admin;


--
-- Name: TABLE email_otps; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.email_otps TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.email_otps TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.email_otps TO project_admin;


--
-- Name: TABLE oauth_configs; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.oauth_configs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.oauth_configs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.oauth_configs TO project_admin;


--
-- Name: TABLE user_providers; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.user_providers TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.user_providers TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.user_providers TO project_admin;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.users TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.users TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.users TO project_admin;


--
-- Name: COLUMN users.id; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT(id) ON TABLE auth.users TO PUBLIC;


--
-- Name: COLUMN users.created_at; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT(created_at) ON TABLE auth.users TO PUBLIC;


--
-- Name: COLUMN users.profile; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT(profile),UPDATE(profile) ON TABLE auth.users TO PUBLIC;


--
-- Name: TABLE definitions; Type: ACL; Schema: functions; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE functions.definitions TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE functions.definitions TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE functions.definitions TO project_admin;


--
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_logs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_logs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.activity_logs TO project_admin;


--
-- Name: TABLE attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachments TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachments TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachments TO project_admin;


--
-- Name: TABLE blocked_leads; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.blocked_leads TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.blocked_leads TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.blocked_leads TO project_admin;


--
-- Name: TABLE campaign_accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_accounts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_accounts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_accounts TO project_admin;


--
-- Name: TABLE campaign_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_stats TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_stats TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_stats TO project_admin;


--
-- Name: TABLE campaigns; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaigns TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaigns TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaigns TO project_admin;


--
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.companies TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.companies TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.companies TO project_admin;


--
-- Name: TABLE contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.contacts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.contacts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.contacts TO project_admin;


--
-- Name: TABLE deals; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.deals TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.deals TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.deals TO project_admin;


--
-- Name: TABLE draft_folders; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.draft_folders TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.draft_folders TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.draft_folders TO project_admin;


--
-- Name: TABLE drafts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.drafts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.drafts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.drafts TO project_admin;


--
-- Name: TABLE email_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.email_logs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.email_logs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.email_logs TO project_admin;


--
-- Name: TABLE leads; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leads TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leads TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leads TO project_admin;


--
-- Name: TABLE notes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notes TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notes TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notes TO project_admin;


--
-- Name: TABLE pending_replies; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pending_replies TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pending_replies TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pending_replies TO project_admin;


--
-- Name: TABLE replies; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.replies TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.replies TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.replies TO project_admin;


--
-- Name: TABLE sender_accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sender_accounts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sender_accounts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sender_accounts TO project_admin;


--
-- Name: TABLE tasks; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tasks TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tasks TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tasks TO project_admin;


--
-- Name: TABLE user_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_settings TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_settings TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_settings TO project_admin;


--
-- Name: TABLE warmup_accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_accounts TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_accounts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_accounts TO project_admin;


--
-- Name: TABLE warmup_emails; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_emails TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_emails TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_emails TO project_admin;


--
-- Name: TABLE warmup_jobs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_jobs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_jobs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_jobs TO project_admin;


--
-- Name: TABLE warmup_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_stats TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_stats TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.warmup_stats TO project_admin;


--
-- Name: TABLE channels; Type: ACL; Schema: realtime; Owner: postgres
--

GRANT SELECT ON TABLE realtime.channels TO authenticated;
GRANT SELECT ON TABLE realtime.channels TO anon;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: postgres
--

GRANT INSERT ON TABLE realtime.messages TO authenticated;
GRANT INSERT ON TABLE realtime.messages TO anon;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.buckets TO project_admin;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE storage.objects TO project_admin;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: system; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.audit_logs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.audit_logs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.audit_logs TO project_admin;


--
-- Name: TABLE mcp_usage; Type: ACL; Schema: system; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.mcp_usage TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.mcp_usage TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.mcp_usage TO project_admin;


--
-- Name: TABLE secrets; Type: ACL; Schema: system; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.secrets TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.secrets TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE system.secrets TO project_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO project_admin;


--
-- Name: create_policies_on_rls_enable; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER create_policies_on_rls_enable ON ddl_command_end
         WHEN TAG IN ('ALTER TABLE')
   EXECUTE FUNCTION system.create_policies_after_rls();


ALTER EVENT TRIGGER create_policies_on_rls_enable OWNER TO postgres;

--
-- Name: create_policies_on_table_create; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER create_policies_on_table_create ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE')
   EXECUTE FUNCTION system.create_default_policies();


ALTER EVENT TRIGGER create_policies_on_table_create OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

\unrestrict erJARxBChwd1ygoqIBVABFnZekXcjAkWJf5lAN55syjqWhs7eke3iHjcYo84x0Q

