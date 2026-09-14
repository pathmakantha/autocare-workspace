// Deterministic module pattern for the fuel pass QR. Not a real encoder — a stable,
// scannable-looking 25x25 grid derived from the vehicle's plate so each pass differs.
const N = 25;

export function buildQrCells(seedText: string, onColor: string, offColor = '#ffffff'): string[] {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = (i: number) => {
    let x = (h ^ Math.imul(i + 1, 2654435761)) >>> 0;
    x ^= x << 13;
    x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5;
    x >>>= 0;
    return (x >>> 8) / 16777216;
  };
  const inFinder = (r: number, c: number) => {
    const zones = [
      [0, 0],
      [0, N - 7],
      [N - 7, 0],
    ];
    for (const [zr, zc] of zones) {
      if (r >= zr && r < zr + 7 && c >= zc && c < zc + 7) {
        const dr = r - zr;
        const dc = c - zc;
        const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        return { hit: true, on: ring || core };
      }
    }
    return { hit: false, on: false };
  };

  const cells: string[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const f = inFinder(r, c);
      let on: boolean;
      if (f.hit) on = f.on;
      else if (r === 6 || c === 6) on = (r + c) % 2 === 0;
      else on = rnd(r * N + c) > 0.5;
      cells.push(on ? onColor : offColor);
    }
  }
  return cells;
}

export const QR_GRID_SIZE = N;
