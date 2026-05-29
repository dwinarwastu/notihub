# ADR 001: Separate Queue Per Channel

## Status
Accepted

## Context
Notification service needs to handle multiple channels: email, WhatsApp, and push.
The question is whether to use a single shared queue or separate queues per channel.

## Decision
Use separate queues per channel (`email-queue`, `whatsapp-queue`, `push-queue`).

## Reasons
- **Fault isolation** — if WhatsApp API is down, email and push queues are unaffected
- **Independent scaling** — each channel can have different concurrency settings
- **Independent retry strategy** — email might retry 3x, push might retry 5x
- **Observability** — easier to monitor queue depth and failure rate per channel

## Consequences
- More queues to manage
- Slightly more boilerplate in queue setup
- Worth the trade-off for production resilience
