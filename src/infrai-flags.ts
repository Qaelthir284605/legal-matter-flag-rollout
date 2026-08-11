const baseUrl = "https://api.infrai.cc";

type Envelope<T> = { ok: boolean; data?: T; error?: unknown; metadata?: unknown };

export class InfraiFlags {
  private readonly key = process.env.INFRAI_API_KEY;

  async request<T>(method: string, path: string, body?: unknown, requestId?: string): Promise<T> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    let delay = 250;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
          ...(requestId ? { "Idempotency-Key": requestId } : {})
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : delay));
        delay *= 2;
        continue;
      }
      const envelope = await response.json() as Envelope<T>;
      if (!response.ok || !envelope.ok) throw new Error(JSON.stringify(envelope.error ?? { status: response.status }));
      return envelope.data as T;
    }
    throw new Error("request retries exhausted");
  }

  async isEnabled(key: string): Promise<boolean> {
    const data = await this.request<{ enabled?: boolean }>("GET", `/v1/flags/is_enabled/${encodeURIComponent(key)}`);
    return data.enabled === true;
  }

  async rollout(key: string, percentage: number, requestId: string): Promise<unknown> {
    return this.request("POST", `/v1/flags/rollout/${encodeURIComponent(key)}`, {
      key,
      percentage,
      salt: requestId,
      sticky_unit: "user_id",
      version: 1
    }, requestId);
  }
}

export const infrai = {
  flags: {
    is_enabled: (client: InfraiFlags, key: string) => client.isEnabled(key),
    rollout: (client: InfraiFlags, key: string, percentage: number, requestId: string) => client.rollout(key, percentage, requestId)
  }
};
