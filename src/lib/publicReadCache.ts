type Entry = { expires: number; value: unknown };
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const CACHE_KEY = 'portfolio:public-data:v12';

/** Share simultaneous reads, but never let a pre-save request refill an invalidated cache. */
export class PublicReadCache {
  private memory = new Map<string, Entry>();
  private pending = new Map<string, { generation: number; promise: Promise<unknown> }>();
  private generation = 0;
  private storage: () => StorageLike | undefined;

  constructor(storage: () => StorageLike | undefined = () => typeof sessionStorage === 'undefined' ? undefined : sessionStorage) { this.storage = storage; }

  private session(): Record<string, Entry> {
    try {
      const value = JSON.parse(this.storage()?.getItem(CACHE_KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  }

  private write(value: Record<string, Entry>) {
    try { this.storage()?.setItem(CACHE_KEY, JSON.stringify(value)); } catch { /* Optional browser cache. */ }
  }

  read<T>(key: string): T | null {
    const local = this.memory.get(key);
    if (local && local.expires > Date.now()) return local.value as T;
    const entry = this.session()[key];
    if (!entry || typeof entry.expires !== 'number' || entry.expires <= Date.now()) return null;
    this.memory.set(key, entry);
    return entry.value as T;
  }

  get<T>(key: string, loader: () => Promise<T>, ttl = 5 * 60 * 1000): Promise<T> {
    const cached = this.read<T>(key);
    if (cached !== null) return Promise.resolve(cached);
    const current = this.pending.get(key);
    if (current?.generation === this.generation) return current.promise as Promise<T>;
    const generation = this.generation;
    const promise = Promise.resolve().then(loader).then(value => {
      if (generation === this.generation) {
        const entry = { expires: Date.now() + ttl, value };
        this.memory.set(key, entry);
        this.write({ ...this.session(), [key]: entry });
      }
      return value;
    }).finally(() => {
      if (this.pending.get(key)?.promise === promise) this.pending.delete(key);
    });
    this.pending.set(key, { generation, promise });
    return promise;
  }

  invalidate(prefix?: string) {
    this.generation += 1;
    for (const key of this.memory.keys()) if (!prefix || key.startsWith(prefix)) this.memory.delete(key);
    const session = this.session();
    for (const key of Object.keys(session)) if (!prefix || key.startsWith(prefix)) delete session[key];
    this.write(session);
  }
}
