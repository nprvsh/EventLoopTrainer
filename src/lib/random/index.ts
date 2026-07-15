export const rnd = (n: number) => Math.floor(Math.random() * n);

export const pick = <T>(arr: readonly T[]): T => arr[rnd(arr.length)];

export const shuffle = <T>(arr: readonly T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
