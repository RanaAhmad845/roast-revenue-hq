# Roast & Revenue — Coffee Shop Website Business HQ

A responsive business dashboard for managing a 90-day coffee-shop website sales campaign.

## Included features

- Overview dashboard with revenue progress, daily activity, pending tasks, recent leads and upcoming events.
- Lead CRM with business/contact details, status pipeline, template selection, notes and follow-up dates.
- Daily activity tracker for prospects, emails, DMs, follow-ups, previews, replies, interested leads, sales and received revenue.
- Tasks with due dates, priorities, categories and one-click completion.
- Monthly calendar for outreach blocks, follow-ups, meetings and delivery dates.
- Milestones for the 90-day plan.
- Outreach message examples for email, Instagram, Loom and onboarding.
- Manual message/reply log.
- Editable business profile and revenue/customer targets.
- JSON backup/restore and CSV export of leads.
- Responsive layout for desktop and mobile.
- Inline task completion and pipeline status editing.

## Run locally

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To create a production build:

```bash
npm run build
npm run preview
```

## Upload to GitHub

1. Create a new GitHub repository.
2. Upload all files and folders from this project (keep the folder structure).
3. In the repository, open **Settings → Pages** only if you configure a Pages deployment workflow. For the simplest deployment, import the repository into Vercel.
4. In Vercel, choose **Add New → Project**, import the repository, keep the Vite defaults, and deploy.

## Important data and integration limitations

This is a working frontend MVP. It stores records in the browser's `localStorage`, so:
- Data stays in the browser and device where it was entered.
- It does not automatically sync between devices or team members.
- Clearing browser storage can remove records. Export a JSON backup regularly.
- Email outreach is drafted/copied manually; this app does not send emails.
- Incoming emails and Instagram messages are logged manually; it does not connect to inboxes.
- Loom and Tally are opened as external tools; their recordings/submissions are not fetched automatically.
- Calendar entries are stored inside this app; they are not synced to Google Calendar.

For a real multi-device production backend, add Supabase (authentication + database) and server-side integrations. Keep Gmail, Instagram, and other API credentials in secure server-side environment variables or a backend function. Never put secret keys in frontend code or a public GitHub repository.

## Suggested next production upgrades

1. Supabase authentication and database tables for leads, tasks, activity logs, events, messages and milestones.
2. Gmail OAuth integration for sending email and syncing replies.
3. n8n webhooks for Tally submissions and follow-up notifications.
4. Google Calendar API integration.
5. Activity audit log and team roles.
