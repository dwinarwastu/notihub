# ADR 002: Channel Adapter Pattern

## Status
Accepted

## Context
Workers need to send notifications via external providers (SMTP, WhatsApp Business API, FCM).
The question is whether to put provider SDK calls directly in the processor or abstract them.

## Decision
Introduce a channel adapter layer (`EmailChannel`, `WhatsappChannel`, `PushChannel`) that sits between the processor and the external provider.

## Reasons
- **Testability** — processors can be unit tested by mocking the adapter
- **Provider swap** — switching from SendGrid to SES only requires changing the adapter, not the processor
- **Single responsibility** — processor handles job lifecycle, adapter handles delivery
- **Interface contract** — all adapters implement `IChannel`, enforcing consistent API

## Consequences
- One extra layer of abstraction
- Worth it for maintainability and testability
