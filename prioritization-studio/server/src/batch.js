// Runs `worker` over `items` with at most `concurrency` in flight at once.
// Each item's outcome is captured independently (Promise.allSettled style)
// so one failure (e.g. a rate limit) doesn't abort the rest of the batch.
export async function runBatch(items, worker, concurrency = 4) {
  const results = new Array(items.length);
  let cursor = 0;

  async function lane() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await worker(items[index], index) };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  }

  const lanes = Array.from({ length: Math.min(concurrency, items.length) }, lane);
  await Promise.all(lanes);
  return results;
}
