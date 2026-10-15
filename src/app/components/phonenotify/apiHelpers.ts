export function unwrapList<T = any>(res: any): { items: T[]; meta: any } {
  const body = res?.data ?? res;
  const items = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.data)
        ? body.data.data
        : [];
  const meta = body?.meta || body?.data?.meta || {};
  return { items, meta };
}

export function unwrapOne<T = any>(res: any): T {
  const body = res?.data ?? res;
  if (body?.data !== undefined && !Array.isArray(body.data)) return body.data as T;
  return body as T;
}

export function formatBytes(n?: number | null) {
  if (n == null || isNaN(Number(n))) return "—";
  const v = Number(n);
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fa-IR", { hour12: false });
  } catch {
    return iso;
  }
}

export function isOnline(lastSeen?: string | null, flag?: boolean) {
  if (typeof flag === "boolean") return flag;
  if (!lastSeen) return false;
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff >= 0 && diff <= 5 * 60 * 1000;
}
