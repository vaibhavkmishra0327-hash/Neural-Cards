-- Enable pg_cron and pg_net extensions for scheduled HTTP calls
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Schedule the send-email-reminders function to run daily at 19:00 UTC (12:30 AM IST)
select cron.schedule(
  'send-email-reminders-daily',
  '0 19 * * *',
  $$
  select net.http_post(
    url := 'https://umifkcactdapufybaecy.supabase.co/functions/v1/send-email-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer BDO7vuM65msLzyUqlQphP1Tj3oxtH84E'
    ),
    body := '{}'::jsonb
  );
  $$
);
