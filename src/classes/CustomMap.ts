export type CustomMapEntry<K, V> = { key: K; value: V };

export class CustomMap<K, V> {
  private readonly _entries: CustomMapEntry<K, V>[];
  private readonly _keyEquals: (key1: K, key2: K) => boolean;
  private readonly _valueEquals: (value1: V, value2: V) => boolean;

  constructor(
    keyEquals: (key1: K, key2: K) => boolean,
    valueEquals: (value1: V, value2: V) => boolean,
    entries?: CustomMapEntry<K, V>[],
  ) {
    this._keyEquals = keyEquals;
    this._valueEquals = valueEquals;
    this._entries = entries ?? [];
  }

  keys(): K[] {
    return this._entries.map((entry) => entry.key);
  }

  entries(): CustomMapEntry<K, V>[] {
    return this._entries;
  }

  set(key: K, value: V): this {
    const index = this._entries.findIndex((entry) =>
      this._keyEquals(entry.key, key),
    );
    if (index >= 0) {
      this._entries[index].value = value; // Update existing value
    } else {
      this._entries.push({ key, value }); // Add new key-value pair
    }

    return this;
  }

  get(key: K): V | undefined {
    const entry = this._entries.find((entry) =>
      this._keyEquals(entry.key, key),
    );
    return entry ? entry.value : undefined;
  }

  has(key: K): boolean {
    return this._entries.some((entry) => this._keyEquals(entry.key, key));
  }

  delete(key: K): boolean {
    const index = this._entries.findIndex((entry) =>
      this._keyEquals(entry.key, key),
    );
    if (index >= 0) {
      this._entries.splice(index, 1);
      return true;
    }
    return false;
  }

  size(): number {
    return this._entries.length;
  }

  equals(other: CustomMap<K, V>): boolean {
    return (
      this.size() === other.size() &&
      this.keys().every((key) => other.has(key)) &&
      this.entries().every((entry) => {
        const otherValue = other.get(entry.key);
        return (
          otherValue !== undefined && this._valueEquals(entry.value, otherValue)
        );
      })
    );
  }
}
