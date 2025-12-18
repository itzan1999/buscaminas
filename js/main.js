import { Canvas } from './canvas.js';
import { CELL_SIZE, CELL_STADE, CELL_VALUE, getBoardProperties } from './consts.js';

const canvas = document.getElementById('main-board');
const contador = document.getElementById('contador');
const endMsg = document.getElementById('end-msg');
const btnPlay = document.getElementById('btn-play');
const rbtnLevels = document.getElementsByName('level');
const divGame = document.getElementById('game');

// Inicializar tableros
// const BOARD = Array.from({ length: BOARD_PROPERTIES.BOARD_HEIGHT }, () => Array(BOARD_PROPERTIES.BOARD_WIDTH).fill(CELL_VALUE.void));
// const SHOW_BOARD = Array.from({ length: BOARD_PROPERTIES.BOARD_HEIGHT }, () => Array(BOARD_PROPERTIES.BOARD_WIDTH).fill(CELL_STADE.closed));
// const MAIN_CANVAS = new Canvas(canvas, BOARD_PROPERTIES.BOARD_WIDTH, BOARD_PROPERTIES.BOARD_HEIGHT);

let BOARD = Array();
let SHOW_BOARD = Array();
let MAIN_CANVAS;
let BOARD_PROPERTIES;

// Coordenadas relativas a las 8 celdas que rodean a cualquiera
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
let minasRestantes = 0;

// Inicializar contador al numero de minas
contador.textContent = minasRestantes;

// Establece el tamaño del tablero
function formarTablero() {
  start = false;
  BOARD = Array.from({ length: BOARD_PROPERTIES.BOARD_HEIGHT }, () => Array(BOARD_PROPERTIES.BOARD_WIDTH).fill(CELL_VALUE.void));
  SHOW_BOARD = Array.from({ length: BOARD_PROPERTIES.BOARD_HEIGHT }, () => Array(BOARD_PROPERTIES.BOARD_WIDTH).fill(CELL_STADE.closed));

  MAIN_CANVAS = new Canvas(canvas, BOARD_PROPERTIES.BOARD_WIDTH, BOARD_PROPERTIES.BOARD_HEIGHT);

  minasRestantes = BOARD_PROPERTIES.NUM_MINES;

  // Dibujar el tablero cuando se carge la fuente buscaminas
  document.fonts.load('10px buscaminas').then(() => {
    MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
  });
}

// Generar los valores del tablero
function generarTablero(cellX, cellY) {
  start = true;
  colocarMinas(BOARD, BOARD_PROPERTIES.NUM_MINES, generarZonaSegura(cellX, cellY));
  colocarNumeros(BOARD);
}

// Genera la zona segura alrededor del primer click
// Return: bidimensional con las 9 posiciones de las celdas seguras
// [[x, y], [x, y], [x, y]...]
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

// Coloca minas aleatoriamente en el tablero ignorando la zona segura
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

// Recorre el tablero, y por cada mina, suma 1 al valor de todas las celdas contiguas que no sean minas
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

// Revela las celdas vacias contiguas con un efecto de ola
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

// Pausa la ejecucion en el tiempo especificado (en milisiegundos)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Comprueba que todo el tablero este abierto o con bandera, y comprueba que en cada mina haya una bandera
// Genera la victoria en caso afirmativo
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

// Muestra el mensaje de derrota y llama a la funcion de revelar el tablero
async function gameOver(cellX, cellY) {
  lose = true;
  endMsg.textContent = 'HAS PERDIDO';
  await showBoard(cellX, cellY);
}

// Revela todo el tablero al pulsar en una mina, con un efecto de ola, y mostrando los errores.
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

// Al pulsar en un numero abierto, si tiene el numero de banderas correctas alrededor,
// abre todas las celdas contiguas que no tengan bandera
// puede abrir minas en caso de haber algun error
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

// Cuenta las banderas alrededor de una celda y devuelve true o false segun si el numero de banderas corresponde al numero de minas
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

// Evento al pulsar una celda
canvas.addEventListener('pointerdown', (event) => {
  if (lose) return;
  event.preventDefault();

  const { cellX, cellY } = getCell(event);

  mouseDown = true;
  pressedCell = { x: cellX, y: cellY };

  const estado = SHOW_BOARD[cellY][cellX];

  // Si la celda esta abierta, es una bandera, o una interrogacion no hace nada
  if (estado === CELL_STADE.flag || estado === CELL_STADE.unknown || estado === CELL_STADE.open) return;

  //
  MAIN_CANVAS.drawCellValue({ x: cellX, y: cellY, value: BOARD[cellY][cellX], state: SHOW_BOARD[cellY][cellX], pressed: true });
});

// Evendo al mover el raton mientras mantienes el click
// Evita que se abra una celda distinta al mover el raton despues de pulsar el click
// Y anula la pulsacion si se saca el raton del tablero despues de mantener el click
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

// Evento al soltar el click
// Abre o marca la celda correspondiente segun el boton pulsado
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

  // Si se ha sacado el raton del tablero antes de soltar el click no hace nada
  if (!inside) return;

  // Si se ha pulsado el boton izquierdo,
  // abre la celda pulsada,
  // además, si es la primera pulsacion, genera el tablero
  if (e.button === 0) {
    if (!start) generarTablero(x, y);
    if (SHOW_BOARD[y][x] === CELL_STADE.open) {
      openNextCells(x, y);
    } else {
      if (SHOW_BOARD[y][x] !== CELL_STADE.flag) showCell(x, y);
    }
    // Si se ha pulsado el boton derecho, marca la celda con el simbolo que correponda
  } else if (e.button === 2) {
    markCell(x, y);
  }
});

// Evento que evita que se muestre el menu contextual del click derecho en el tablero
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

btnPlay.addEventListener('click', (e) => {
  let difficult = '';
  for (const rbtnLevel of rbtnLevels) {
    if (rbtnLevel.checked) {
      difficult = rbtnLevel.value;
      break;
    }
  }

  BOARD_PROPERTIES = getBoardProperties(difficult);
  formarTablero();
  divGame.style.display = 'block';
});

// Muestra la celda especificada
function showCell(cellX, cellY) {
  // Si la celda esta vacia, genera el efecto de ola
  if (BOARD[cellY][cellX] === CELL_VALUE.void && SHOW_BOARD[cellY][cellX] === CELL_STADE.closed) {
    revelarVaciasOla(cellX, cellY);
  } else {
    // Si la celda tiene una mina, llama a la funcion de derrota
    if (BOARD[cellY][cellX] === CELL_VALUE.mine) {
      gameOver(cellX, cellY);
    }
    SHOW_BOARD[cellY][cellX] = CELL_STADE.open;
  }

  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);

  // Si la celda no es una mina, comprueba la victoria
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
  // Si la celda ya esta abierta, no hace nada
  if (SHOW_BOARD[cellY][cellX] === CELL_STADE.open) return;

  // Si la celda tiene una bandera, pone una interrogación y suma uno a las minas restantes
  if (SHOW_BOARD[cellY][cellX] === CELL_STADE.flag) {
    minasRestantes++;
    contador.textContent = minasRestantes;

    SHOW_BOARD[cellY][cellX] = CELL_STADE.unknown;
    // Si la celda tiene una interrogacion, quita la interrogación
  } else if (SHOW_BOARD[cellY][cellX] === CELL_STADE.unknown) {
    SHOW_BOARD[cellY][cellX] = CELL_STADE.closed;
    // Si la celda no tiene nada, pone una bandera y resta 1 a las minas restantes y comprueba la victoria si las minas restantes son 0
  } else {
    SHOW_BOARD[cellY][cellX] = CELL_STADE.flag;
    minasRestantes--;
    contador.textContent = minasRestantes;

    if (!minasRestantes) checkWin();
  }
  MAIN_CANVAS.draw(BOARD, SHOW_BOARD);
}

// Obtiene las coordenadas de la celda del canvas pulsada
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
