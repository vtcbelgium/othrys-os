/**
 * In-memory storage bridge for testing and zero-dependency runtime.
 */
export function createMemoryStorageBridge() {
  const records = [];

  async function persistVisit(record) {
    records.push({ ...record });
  }

  return {
    persistVisit,
    records,
  };
}
