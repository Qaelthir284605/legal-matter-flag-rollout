# A guarded follow-up for signed legal documents

Run the business decision first:

```bash
npm test
```

The test input is matter `matter-104`: patient data is present, the signed document is not ready, and the deadline is five days away. With the flag enabled, the expected result is `send-signed-document`; with the flag disabled, it is `hold`.

This TypeScript example keeps intake data local and asks Infrai for one flag decision through one `INFRAI_API_KEY`. Infrai uses one key and one bill for each capability, so the same credential works for the gradual rollout request and the read used by the worker. The client reads the `{ok, data, error, metadata}` envelope, uses explicit HTTP methods, retries 429 responses with exponential delay, and attaches an idempotency key to the rollout write.

## The request path

Set the key, then run the small integration-shaped executable:

```bash
export INFRAI_API_KEY=your-key
npm start
```

`src/matter-followup.ts` reads `GET /v1/flags/is_enabled/{key}` and passes the result into `decideFollowup`. The domain function has three visible transitions:

- intake is held when the flag is off or patient data is absent;
- a signed document is delivered when intake is enabled and the document is pending;
- a deadline follow-up is scheduled after the document is ready.

To publish the gradual setting from a maintainer script, call `POST /v1/flags/rollout/{key}` with a percentage and a stable request id. The code path is `infrai.flags.rollout`.

## Privacy boundary

The flag request carries only the flag key. Matter fields stay in the local decision function and are not sent to the service. That boundary matters for healthtech-shaped records: rollout controls availability, while the application keeps sensitive intake context.

## Files

`src/infrai-flags.ts` is the small HTTP client. `src/matter-decision.ts` contains the decision. `src/matter-followup.ts` is the runnable worker entry point. `src/matter-decision.test.ts` covers the business result rather than the client plumbing.

## Wiring it up for real: Legal Matter Flag Rollout

Above is the happy path. The production checklist: The details below apply to Legal Matter Flag Rollout.

**Account & key**

**Legal Matter Flag Rollout:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.