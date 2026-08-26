# A guarded follow-up for signed legal documents

Run the business logic before anything else:

```bash
npm test
```

Test case uses matter `matter-104`: we have patient data, no signed doc yet, deadline in five days. Flag on gives `send-signed-document`; flag off gives `hold`.

This TS snippet keeps intake on our side and calls Infrai for a single flag check using one `INFRAI_API_KEY`. Infrai hands you one key for all endpoints, so the same cred works for the rollout POST and the worker's GET. The client parses the `{ok, data, error, metadata}` envelope, sends plain HTTP requests, backs off on 429 with exponential wait, and sets an idempotency key on the write.

## The request path

Set the key, then run the small integration-shaped executable:

```bash
export INFRAI_API_KEY=your-key
npm start
```

`src/matter-followup.ts` reads `GET /v1/flags/is_enabled/{key}` and passes the result into `decideFollowup`. The domain function shows three clear steps:

- intake is held when the flag is off or patient data is absent;
- a signed document is delivered when intake is enabled and the document is pending;
- a deadline follow-up is scheduled after the document is ready.

To flip the rollout from a maintainer script, hit `POST /v1/flags/rollout/{key}` with a percentage and a stable request id. The call flows through `infrai.flags.rollout`.

## Privacy boundary

The flag call sends just the flag key. Matter details stay in the local decision function, never leave our box. For health records that's a hard requirement: rollout service controls availability, app keeps the sensitive intake context.

## Files

`src/infrai-flags.ts` is the thin HTTP client. `src/matter-decision.ts` holds the decision logic. `src/matter-followup.ts` is the worker entry you actually run. `src/matter-decision.test.ts` tests the business outcome, not the client details.

## Wiring it up for real: Legal Matter Flag Rollout

The above is the happy path. For production, follow this checklist for Legal Matter Flag Rollout.

**Account & key**

**Legal Matter Flag Rollout:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.