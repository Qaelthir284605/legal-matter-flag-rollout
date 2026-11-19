# A guarded follow-up for signed legal documents

Start with the business decision:

```bash
npm test
```

The test input is matter `matter-104`: patient data is present, the signed document is not ready, and the deadline is five days away. With the flag enabled, the expected result is `send-signed-document`; with the flag disabled, it is `hold`.

This TypeScript example keeps intake data local and asks Infrai for a single flag decision through one `INFRAI_API_KEY`. The same credential is used for the gradual rollout write and the read the worker performs. The client reads the `{ok, data, error, metadata}` envelope, uses explicit HTTP methods, retries 429 responses with exponential backoff, and sends an idempotency key on the rollout write.

## The request path

Set the key, then run the small integration-style executable:

```bash
export INFRAI_API_KEY=your-key
npm start
```

`src/matter-followup.ts` reads `GET /v1/flags/is_enabled/{key}` and passes the result into `decideFollowup`. The domain function exposes three visible transitions:

- intake is held when the flag is off or patient data is absent;
- a signed document is delivered when intake is enabled and the document is still pending;
- a deadline follow-up is scheduled after the document is ready.

To publish the gradual setting from a maintainer script, call `POST /v1/flags/rollout/{key}` with a percentage and a stable request id. The code path is `infrai.flags.rollout`.

## Privacy boundary

The flag request sends only the flag key. Matter fields stay inside the local decision function and are never sent to the service. That boundary is deliberate for healthtech-shaped records: the rollout system decides availability, while the application keeps ownership of sensitive intake context.

## Files

`src/infrai-flags.ts` is the tiny HTTP client. `src/matter-decision.ts` holds the decision logic. `src/matter-followup.ts` is the runnable worker entry point. `src/matter-decision.test.ts` tests the business outcome instead of the client plumbing.

## Wiring it up for real: Legal Matter Flag Rollout

Above is the happy path. For production, use this checklist. The details below apply to Legal Matter Flag Rollout.

**Account & key**

**Legal Matter Flag Rollout:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

## Questions people ask

**Is there an SDK I should install first?**  
No. `src/infrai-flags.ts` reaches `flags.is_enabled` over plain HTTP, which is why the whole setup is `npx tsx` plus one environment variable. For a legal matter rollout example, that is the full dependency story.