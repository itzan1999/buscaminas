import { Canvas } from './canvas.js';
import { BOARD_HEIGHT, BOARD_WIDTH, CELL_SIZE, CELL_STADE, CELL_VALUE, NUM_MINES } from './consts.js';

const canvas = document.getElementById('main-board');
const cotador = document.getElementById('contador');
const endMsg = document.getElementById('end-msg');

const BOARD = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(CELL_VALUE.void));
const SHOW_BOARD = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(CELL_STADE.closed));

const MAIN_CANVAS = new Canvas(canvas, BOARD_WIDTH, BOARD_HEIGHT);

const dirs = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

let pressedCell = null; // {x, y} o null
let mouseDown = false;
let start = false;
let lose = false;
let minasRestantes = NUM_MINES;
contador.textContent = minasRestantes;

document.fonts.load('10px buscaminas').then(() => {
  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
});

function generarTablero(cellX, cellY) {
  start = true;
  colocarMinas(BOARD, NUM_MINES, generarZonaSegura(cellX, cellY));
  colocarNumeros(BOARD);
}

function generarZonaSegura(cellX, cellY) {
  const zonaSegura = [[cellY, cellX]];

  for (const [drow, dcol] of dirs) {
    const nRow = cellY + drow;
    const nCol = cellX + dcol;

    const xInBoard = nCol >= 0 && nCol < BOARD[0].length;
    const yInBoard = nRow >= 0 && nRow < BOARD.length;

    if (xInBoard && yInBoard) {
      zonaSegura.push([nRow, nCol]);
    }
  }

  return zonaSegura;
}

function colocarMinas(board, minas, zonaSegura) {
  const rows = board.length;
  const cols = board[0].length;

  const posiciones = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const posicion = [row, col];
      if (!zonaSegura.some((sRow) => sRow.every((value, i) => value === posicion[i]))) {
        posiciones.push({ row, col });
      }
    }
  }

  // Desordenar posiciones
  for (let i = posiciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posiciones[i], posiciones[j]] = [posiciones[j], posiciones[i]];
  }

  // Colocar minas en el tablero
  for (let i = 0; i < minas; i++) {
    const { row, col } = posiciones[i];
    board[row][col] = CELL_VALUE.mine;
  }
}

function colocarNumeros(board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] === CELL_VALUE.mine) {
        dirs.forEach(([drow, dcol]) => {
          const nRow = row + drow;
          const nCol = col + dcol;

          if (nRow >= 0 && nRow < board.length && nCol >= 0 && nCol < board[0].length) {
            if (board[nRow][nCol] !== CELL_VALUE.mine) board[nRow][nCol]++;
          }
        });
      }
    }
  }
}

// async function revelarVacias(cellX, cellY) {
//   for (const [drow, dcol] of dirs) {
//     const nRow = cellY + drow;
//     const nCol = cellX + dcol;

//     if (nRow >= 0 && nRow < BOARD.length && nCol >= 0 && nCol < BOARD[0].length) {
//       if (BOARD[nRow][nCol] === 0 && SHOW_BOARD[nRow][nCol] !== CELL_STADE.open) {
//         SHOW_BOARD[nRow][nCol] = CELL_STADE.open;

//         await sleep(1);
//         MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

//         await revelarVacias(nCol, nRow);
//       } else {
//         SHOW_BOARD[nRow][nCol] = CELL_STADE.open;
//         MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
//       }
//     }
//   }
// }

// async function revelarVaciasOptimizado(startX, startY) {
//   const pila = [[startX, startY]];

//   while (pila.length > 0) {
//     const [cellX, cellY] = pila.shift();

//     if (SHOW_BOARD[cellY][cellX] === CELL_STADE.open) continue;

//     SHOW_BOARD[cellY][cellX] = CELL_STADE.open;
//     MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

//     await sleep(10);

//     // Si la celda no tiene bombas alrededor, añadimos sus vecinos
//     if (BOARD[cellY][cellX] === CELL_VALUE.void) {
//       for (const [drow, dcol] of dirs) {
//         const nRow = cellY + drow;
//         const nCol = cellX + dcol;

//         if (nRow >= 0 && nRow < BOARD.length && nCol >= 0 && nCol < BOARD[0].length && SHOW_BOARD[nRow][nCol] !== CELL_STADE.open) {
//           pila.push([nCol, nRow]);
//         }
//       }
//     }
//   }
// }

async function revelarVaciasOla(startX, startY) {
  const pila = [[startX, startY]];
  const visited = Array.from({ length: BOARD.length }, () => Array(BOARD[0].length).fill(false));

  visited[startY][startX] = true;

  while (pila.length > 0) {
    const nextPila = [];

    for (const [cellX, cellY] of pila) {
      SHOW_BOARD[cellY][cellX] = CELL_STADE.openWave;
    }

    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
    await sleep(30);

    for (const [cellX, cellY] of pila) {
      if (BOARD[cellY][cellX] === CELL_VALUE.void) {
        for (const [drow, dcol] of dirs) {
          const nRow = cellY + drow;
          const nCol = cellX + dcol;

          const xInBoard = nCol >= 0 && nCol < BOARD[0].length;
          const yInBoard = nRow >= 0 && nRow < BOARD.length;

          if (xInBoard && yInBoard && !visited[nRow][nCol] && SHOW_BOARD[nRow][nCol] === CELL_STADE.closed) {
            visited[nRow][nCol] = true;
            nextPila.push([nCol, nRow]);
          }
        }
      }
    }

    for (const [cellX, cellY] of pila) {
      SHOW_BOARD[cellY][cellX] = CELL_STADE.open;
    }

    // MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

    pila.length = 0;
    pila.push(...nextPila);
  }

  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkWin() {
  if (SHOW_BOARD.every((row) => row.every((val) => val === CELL_STADE.open || val === CELL_STADE.flag))) {
    const minesPos = [];
    let win = true;

    BOARD.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === CELL_VALUE.mine) {
          minesPos.push([x, y]);
        }
      });
    });

    for (const [x, y] of minesPos) {
      if (SHOW_BOARD[y][x] !== CELL_STADE.flag) {
        win = false;
        break;
      }
    }

    if (win) endMsg.textContent = 'HAS GANADO';
  }
}

async function gameOver(cellX, cellY) {
  lose = true;
  endMsg.textContent = 'HAS PERDIDO';
  await showBoard(cellX, cellY);
}

async function showBoard(startX, startY) {
  const pila = [[startX, startY]];
  const visited = Array.from({ length: BOARD.length }, () => Array(BOARD[0].length).fill(false));
  const saveFlagsPos = [];

  visited[startY][startX] = true;

  while (pila.length > 0) {
    const nextPila = [];

    for (const [cellX, cellY] of pila) {
      if (SHOW_BOARD[cellY][cellX] === CELL_STADE.flag) {
        saveFlagsPos.push([cellX, cellY]);
      }
      if (cellX === startX && cellY === startY) {
        SHOW_BOARD[startY][startX] = CELL_STADE.detonatedMine;
      } else {
        SHOW_BOARD[cellY][cellX] = CELL_STADE.defeatOpenWave;
      }
    }

    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
    await sleep(30);

    for (const [cellX, cellY] of pila) {
      for (const [drow, dcol] of dirs) {
        const nRow = cellY + drow;
        const nCol = cellX + dcol;

        const xInBoard = nCol >= 0 && nCol < BOARD[0].length;
        const yInBoard = nRow >= 0 && nRow < BOARD.length;

        if (xInBoard && yInBoard && !visited[nRow][nCol]) {
          visited[nRow][nCol] = true;
          nextPila.push([nCol, nRow]);
        }
      }
    }

    for (const [cellX, cellY] of pila) {
      if (cellX === startX && cellY === startY) {
        SHOW_BOARD[startY][startX] = CELL_STADE.detonatedMine;
      } else {
        SHOW_BOARD[cellY][cellX] = CELL_STADE.open;
      }
    }

    for (const [cellX, cellY] of saveFlagsPos) {
      if (BOARD[cellY][cellX] === CELL_VALUE.mine) {
        SHOW_BOARD[cellY][cellX] = CELL_STADE.flag;
      } else {
        SHOW_BOARD[cellY][cellX] = CELL_STADE.error;
      }
    }

    // MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

    pila.length = 0;
    pila.push(...nextPila);
  }

  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
}

async function openNextCells(cellX, cellY) {
  if (!countNextFlags(cellX, cellY)) return;

  for (const [drow, dcol] of dirs) {
    const nRow = cellY + drow;
    const nCol = cellX + dcol;

    const xInBoard = nCol >= 0 && nCol < BOARD[0].length;
    const yInBoard = nRow >= 0 && nRow < BOARD.length;

    if (xInBoard && yInBoard && SHOW_BOARD[nRow][nCol] !== CELL_STADE.flag) {
      showCell(nCol, nRow);
    }

    // if (SHOW_BOARD[nRow][nCol] !== CELL_STADE.flag) {
    //   if (BOARD[nRow][nCol] === CELL_VALUE.mine) {
    //     SHOW_BOARD[nRow][nCol] = CELL_STADE.open;
    //     await gameOver(nCol, nRow);
    //     return;
    //   }
    //   if (BOARD[nRow][nCol] === CELL_VALUE.void && SHOW_BOARD[nRow][nCol] === CELL_STADE.closed) {
    //     revelarVaciasOla(nCol, nRow);
    //   }
    //   SHOW_BOARD[nRow][nCol] = CELL_STADE.open;
    // }
  }

  // MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
  // checkWin();
}

function countNextFlags(cellX, cellY) {
  let numFlags = 0;
  dirs.forEach(([drow, dcol]) => {
    const nRow = cellY + drow;
    const nCol = cellX + dcol;

    const xInBoard = nCol >= 0 && nCol < BOARD[0].length;
    const yInBoard = nRow >= 0 && nRow < BOARD.length;
    if (xInBoard && yInBoard && SHOW_BOARD[nRow][nCol] === CELL_STADE.flag) numFlags++;
  });

  return numFlags === BOARD[cellY][cellX];
}

canvas.addEventListener('pointerdown', (event) => {
  if (lose) return;
  event.preventDefault();

  const { cellX, cellY } = getCell(event);

  mouseDown = true;
  pressedCell = { x: cellX, y: cellY };

  const estado = SHOW_BOARD[cellY][cellX];

  if (estado === CELL_STADE.flag || estado === CELL_STADE.unknown || estado === CELL_STADE.open) return;

  MAIN_CANVAS.drawCellValue(cellX, cellY, BOARD[cellY][cellX], SHOW_BOARD[cellY][cellX], true);
});

canvas.addEventListener('pointermove', (e) => {
  if (lose) return;
  if (!mouseDown) return;

  const rect = canvas.getBoundingClientRect();
  const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (!inside) {
    pressedCell = null;
    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
  }
});

window.addEventListener('pointerup', (e) => {
  if (lose) return;
  if (!mouseDown) return;
  mouseDown = false;

  if (!pressedCell) {
    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

  const { x, y } = pressedCell;
  pressedCell = null;

  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

  if (!inside) return;

  if (e.button === 0) {
    if (!start) generarTablero(x, y);
    if (SHOW_BOARD[y][x] === CELL_STADE.open) {
      openNextCells(x, y);
    } else {
      if (SHOW_BOARD[y][x] !== CELL_STADE.flag) showCell(x, y);
    }
  } else if (e.button === 2) {
    markCell(x, y);
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

function showCell(cellX, cellY) {
  if (BOARD[cellY][cellX] === CELL_VALUE.void && SHOW_BOARD[cellY][cellX] === CELL_STADE.closed) {
    revelarVaciasOla(cellX, cellY);
  } else {
    if (BOARD[cellY][cellX] === CELL_VALUE.mine) {
      gameOver(cellX, cellY);
    }
    SHOW_BOARD[cellY][cellX] = CELL_STADE.open;
  }

  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

  if (BOARD[cellY][cellX] !== CELL_VALUE.mine) {
    checkWin();
  }

  // if (SHOW_BOARD[cellY][cellX] !== CELL_STADE.flag) {
  //   if (SHOW_BOARD[cellY][cellX] === CELL_STADE.closed || SHOW_BOARD[cellY][cellX] === CELL_STADE.unknown) {
  //   }

  // }
}

// Marca con la celda con bandera o interrogación
function markCell(cellX, cellY) {
  if (SHOW_BOARD[cellY][cellX] !== CELL_STADE.open) {
    if (SHOW_BOARD[cellY][cellX] === CELL_STADE.flag) {
      minasRestantes++;
      contador.textContent = minasRestantes;

      SHOW_BOARD[cellY][cellX] = CELL_STADE.unknown;
    } else if (SHOW_BOARD[cellY][cellX] === CELL_STADE.unknown) {
      SHOW_BOARD[cellY][cellX] = CELL_STADE.closed;
    } else {
      SHOW_BOARD[cellY][cellX] = CELL_STADE.flag;
      minasRestantes--;
      contador.textContent = minasRestantes;

      checkWin();
    }
    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
  }
}

// Obtiene la celda del canvas pulsada
function getCell(event) {
  const rect = canvas.getBoundingClientRect();

  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;

  const realX = cssX;
  const realY = cssY;

  const cellX = Math.floor(realX / CELL_SIZE);
  const cellY = Math.floor(realY / CELL_SIZE);

  return { cellX, cellY };
}
