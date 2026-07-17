-- Relax partner insert RLS: any authenticated user may insert own referrals
-- (login already requires active partner for portal access)

drop policy if exists referrals_insert_partner on public.referrals;
create policy referrals_insert_partner on public.referrals
  for insert to authenticated
  with check (
    referrer_user_id = auth.uid()
    and status = 'pending'
    and customer_consent = true
  );

-- Ensure sequence usable by trigger for all roles that insert
grant usage, select on sequence public.referral_code_seq to authenticated, service_role;
