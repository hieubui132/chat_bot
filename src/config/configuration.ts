export default () => ({
  tele_token: process.env.TELEGRAM_BOT_TOKEN,
  tele_group_id: process.env.TELEGRAM_GROUP_ID,
  tele_webhook_domain: process.env.TELEGRAM_WEBHOOK_DOMAIN,
  tele_webhook_path: '/tele',
  page_id: process.env.PAGE_ID,
  page_access_token: process.env.PAGE_ACCESS_TOKEN,
  verify_token: process.env.VERIFY_TOKEN,
});
