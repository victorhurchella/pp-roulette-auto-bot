export async function timeout(time: number) {
  await new Promise((r) => setTimeout(r, time));
}
