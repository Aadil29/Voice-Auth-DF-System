// computes element‑wise average of N equal‑length vectors
export function averageVectors(vs: number[][]): number[] {
  const dim = vs[0].length;
  const sum = new Array<number>(dim).fill(0);
  vs.forEach((vec) => {
    vec.forEach((v, i) => {
      sum[i] += v;
    });
  });
  return sum.map((x) => x / vs.length);
}
