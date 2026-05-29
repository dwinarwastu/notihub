# ADR 003: BullMQ over Kafka

## Status
Accepted

## Context
The service needs a reliable async job queue with retry support.
Two main options considered: BullMQ (Redis-based) and Kafka.

## Decision
Use BullMQ with Redis.

## Reasons
- **Simplicity** — BullMQ has built-in retry, delay, priority, and rate limiting out of the box
- **Operational overhead** — Kafka requires Zookeeper/KRaft, brokers, and topic management. Redis is already needed for caching
- **Use case fit** — Kafka excels at high-throughput event streaming. This service needs job execution with retry, not event log replay
- **Developer experience** — BullMQ integrates natively with NestJS via `@nestjs/bullmq`

## When to reconsider
If the service needs to scale to millions of messages per second or requires event replay across multiple consumer groups, migrate to Kafka.

## Consequences
- Less scalable than Kafka for extreme throughput
- Acceptable trade-off for a notification service at reasonable scale
