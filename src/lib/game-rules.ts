export const WASH_DURATION_SECONDS = 20;
export const WASH_BRUSH_RADIUS = 28;
export const WASH_BRUSH_STRENGTH = 0.18;
export const PUZZLE_COLUMNS = 4;
export const PUZZLE_ROWS = 3;
export const PUZZLE_PIECES = PUZZLE_COLUMNS * PUZZLE_ROWS;

export function canPlacePiece(piece: number, slot: number, placed: number[]) {
  return piece >= 0 && piece < PUZZLE_PIECES && piece === slot && !placed.includes(piece);
}

// Each edge is shared by neighboring pieces, so tabs and sockets fit exactly.
export function puzzlePath(id: number) {
  const col = id % PUZZLE_COLUMNS;
  const row = Math.floor(id / PUZZLE_COLUMNS);
  const x = col * 100, y = row * 100;
  const top = row === 0 ? 0 : ((col + row) % 2 ? 1 : -1);
  const right = col === PUZZLE_COLUMNS - 1 ? 0 : ((col + row) % 2 ? 1 : -1);
  const bottom = row === PUZZLE_ROWS - 1 ? 0 : ((col + row + 1) % 2 ? 1 : -1);
  const left = col === 0 ? 0 : ((col + row - 1) % 2 ? 1 : -1);
  const horizontal = (sx: number, sy: number, direction: number, tab: number) => tab === 0
    ? `L${sx + direction * 100} ${sy}`
    : `L${sx + direction * 35} ${sy} C${sx + direction * 45} ${sy} ${sx + direction * 35} ${sy + tab * 17} ${sx + direction * 50} ${sy + tab * 17} C${sx + direction * 65} ${sy + tab * 17} ${sx + direction * 55} ${sy} ${sx + direction * 65} ${sy} L${sx + direction * 100} ${sy}`;
  const vertical = (sx: number, sy: number, direction: number, tab: number) => tab === 0
    ? `L${sx} ${sy + direction * 100}`
    : `L${sx} ${sy + direction * 35} C${sx} ${sy + direction * 45} ${sx + tab * 17} ${sy + direction * 35} ${sx + tab * 17} ${sy + direction * 50} C${sx + tab * 17} ${sy + direction * 65} ${sx} ${sy + direction * 55} ${sx} ${sy + direction * 65} L${sx} ${sy + direction * 100}`;
  return `M${x} ${y} ${horizontal(x, y, 1, top)} ${vertical(x + 100, y, 1, right)} ${horizontal(x + 100, y + 100, -1, bottom)} ${vertical(x, y + 100, -1, left)} Z`;
}