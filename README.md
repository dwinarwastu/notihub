# Notihub

![CI](https://github.com/dwinarwastu/notihub/actions/workflows/ci.yml/badge.svg)

> Production-grade multi-channel notification service — built to show real-world backend architecture.

Built with **NestJS**, **BullMQ**, **Redis**, and **PostgreSQL**. Supports email, WhatsApp, and push notifications with async queue processing, retry logic, and per-channel Handlebars templates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Queue | BullMQ + Redis |
| Database | PostgreSQL + TypeORM |
| Template Engine | Handlebars |
| Email | Nodemailer (SMTP) |
| Containerization | Docker + Docker Compose |

---

## How It Works

Every notification — regardless of channel — goes through the same lifecycle:

1. **Receive** — API validates the request and saves a log entry to PostgreSQL (`status: pending`)
2. **Enqueue** — Job is pushed to the appropriate BullMQ queue (`email-queue`, `whatsapp-queue`, `push-queue`)
3. **Process** — Worker picks up the job, renders the Handlebars template, and sends via the channel adapter
4. **Log** — Worker updates the log entry to `sent` or `failed`
5. **Retry** — On failure, BullMQ retries up to 3× with exponential backoff before marking as `failed`

Each channel has its own isolated queue — a WhatsApp API outage won't affect email delivery.

---

## Project Structure

```
src/
├── notification/         # HTTP entry point
├── queue/                # BullMQ queue declarations
├── workers/              # Job processors per channel
├── template/             # Handlebars template engine
│   └── templates/
│       ├── email/
│       ├── whatsapp/
│       └── push/
├── channels/             # External provider adapters
└── common/
    ├── entities/
    └── interfaces/
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose

### Run with Docker

```bash
cp .env.example .env
# fill in your credentials
docker compose up -d
```

### Run locally

```bash
npm install
npm run start:dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_USER` | PostgreSQL user |
| `DB_PASS` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or App Password |
| `SMTP_FROM` | Sender email address |

---

## API Reference

### Send a notification

```
POST /notification
```

```json
{
  "channel": "email",
  "recipient": "user@example.com",
  "templateId": "welcome",
  "templateData": { "name": "Budi" },
  "metadata": { "subject": "Selamat Datang" }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `channel` | `email \| whatsapp \| push` | Yes | Delivery channel |
| `recipient` | `string` | Yes | Email address, phone number, or device token |
| `templateId` | `string` | Yes | Template filename without `.hbs` extension |
| `templateData` | `object` | Yes | Dynamic variables for the template |
| `metadata` | `object` | No | Extra data (e.g. email subject) |

**Response**

```json
{
  "id": "c04d12b2-6e64-42f0-af77-f4103316ad83",
  "channel": "email",
  "status": "pending",
  "recipient": "user@example.com",
  "attemptCount": 0,
  "sentAt": null,
  "errorMessage": null,
  "createdAt": "2026-05-12T02:31:58.841Z"
}
```

---

### Check notification status

```
GET /notification/:id
```

**Response**

```json
{
  "id": "c04d12b2-6e64-42f0-af77-f4103316ad83",
  "channel": "email",
  "status": "sent",
  "recipient": "user@example.com",
  "attemptCount": 1,
  "sentAt": "2026-05-12T02:32:01.123Z",
  "errorMessage": null,
  "createdAt": "2026-05-12T02:31:58.841Z"
}
```

---

## Notification Status

| Status | Description |
|---|---|
| `pending` | Saved, waiting in queue |
| `processing` | Worker picked up the job |
| `sent` | Successfully delivered |
| `failed` | All retry attempts exhausted |

---

## Retry Strategy

Failed jobs are retried automatically with exponential backoff.

| Attempt | Delay |
|---|---|
| 1st retry | 5s |
| 2nd retry | 10s |
| 3rd retry | 20s |

After 3 failed attempts, the job is marked `failed` and preserved in Redis for debugging. The error message is also stored in PostgreSQL.

---

## Adding a Template

1. Create a `.hbs` file under `src/template/templates/{channel}/`
2. Use Handlebars syntax for dynamic content

```handlebars
<h1>Halo, {{name}}!</h1>
<p>Total tagihan kamu: {{amount}}</p>
```

3. Reference it in your request with `"templateId": "your-filename"`

---

## WhatsApp & Push

Both channels are stubbed — the architecture is in place, but the external API calls are not wired up yet.

| Channel | Integration |
|---|---|
| WhatsApp | [Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) |
| Push | [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) |

---

## Architecture Decisions

See [docs/adr](./docs/adr) for architecture decision records explaining the key design choices behind this service.
