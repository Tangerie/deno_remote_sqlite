if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}


export function add(a: number, b: number): number {
  return a + b;
}
