import * as CONSTS from './consts.js';

// Clase que controla el canvas
export class Canvas {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const dpr = (window.devicePixelRatio || 1) * 2.5;

    this.canvas.style.width = width * CONSTS.CELL_SIZE + 'px';
    this.canvas.style.height = height * CONSTS.CELL_SIZE + 'px';

    this.canvas.width = width * CONSTS.CELL_SIZE * dpr;
    this.canvas.height = height * CONSTS.CELL_SIZE * dpr;

    this.ctx.scale(CONSTS.CELL_SIZE * dpr, CONSTS.CELL_SIZE * dpr);

    this.widthGrid = width;
    this.heightGrid = height;

    this.configureText();
  }

  // Establece el tamaño, fuente y posicion del texto para el canvas
  configureText() {
    this.ctx.font = `0.65px buscaminas`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  // Metodo draw principal
  // Llama al resto de metodos que se encargan de dibujar el canvas
  draw(board, showBoard) {
    this.drawBackgroundLayer(showBoard);
    this.drawValuesLayer(board, showBoard);
    this.drawGrid();
  }

  // Metodo que dibuja el fondo en todoas las celdas
  drawBackgroundLayer(showBoard) {
    for (let y = 0; y < this.heightGrid; y++) {
      for (let x = 0; x < this.widthGrid; x++) {
        this.drawCellBackground(x, y, showBoard[y][x]);
      }
    }
  }

  // Metodo que dibuja el fondo de una celda segun su estado
  drawCellBackground(x, y, state) {
    const c = CONSTS;

    // Switch que establece el color con que se pintara el fondo
    switch (state) {
      // Color para la mina detonada
      case c.CELL_STADE.detonatedMine:
        this.ctx.fillStyle = c.CANVAS_BACKGROUND_DETONATED_COLOR;
        break;

      // Color para el efecto de ola al perder la partida
      case c.CELL_STADE.defeatOpenWave:
        this.ctx.fillStyle = c.CANVAS_BACKGROUND_DEFEAT_OPEN_WAVE_COLOR;
        break;

      // Color para el efecto de ola al abrirse celdas vacias
      case c.CELL_STADE.openWave:
        this.ctx.fillStyle = c.CANVAS_BACKGROUND_OPEN_WAVE_COLOR;
        break;

      // Color para celdas abiertas
      case c.CELL_STADE.open:
        this.ctx.fillStyle = c.CANVAS_BACKGROUND_OPEN_COLOR;
        break;

      // Color para errores
      case c.CELL_STADE.error:
        this.ctx.fillStyle = c.CANVAS_BACKGROUND_OPEN_COLOR;
        break;

      // Si es otro estado, la funcion no pinta (la celda esta cerrada)
      default:
        return; // closed, flag, unknown → handled in drawClosedCell
    }

    // Pinta el fondo de la celda
    this.ctx.fillRect(x, y, 1, 1);
  }

  // Dibuja el valor de las celdas del tablero
  drawValuesLayer(board, showBoard) {
    for (let y = 0; y < this.heightGrid; y++) {
      for (let x = 0; x < this.widthGrid; x++) {
        this.drawCellValue({ x, y, value: board[y][x], state: showBoard[y][x] });
      }
    }
  }

  // Dibuja el valor de una celda especifica
  drawCellValue({ x, y, value, state, pressed = false }) {
    const c = CONSTS;

    // Llama a la funcion correspondiente para las celdas cerradas
    if (state === c.CELL_STADE.closed) {
      this.drawClosedCell(x, y, pressed);
      return;
    }
    if (state === c.CELL_STADE.unknown) {
      this.drawClosedCell(x, y, pressed);
      this.drawUnknown(x, y);
      return;
    }
    if (state === c.CELL_STADE.flag) {
      this.drawClosedCell(x, y, pressed);
      this.drawFlag(x, y);
      return;
    }

    // Llama a los metodos para dibujar una mina o un error si es necesario
    if (state === c.CELL_STADE.open || state === c.CELL_STADE.detonatedMine || state === c.CELL_STADE.error) {
      if (value === c.CELL_VALUE.mine || state === c.CELL_STADE.error) {
        this.drawMine(x, y);

        if (state === c.CELL_STADE.error) {
          this.drawError(x, y);
        }
        return;
      }

      // Si contiene un numero, lo dibuja con el color correspondiente
      if (value !== c.CELL_VALUE.void) {
        this.ctx.fillStyle = c.NUMBERS_COLORS[value];
        this.ctx.fillText(value, x + 0.5, y + 0.5);
      }
    }
  }

  // Metodo que dibuja la bandera
  drawFlag(x, y) {
    this.ctx.fillStyle = 'red';
    this.ctx.fillText(CONSTS.CELL_VALUE.flag, x + 0.5, y + 0.5);
  }

  // Metodo que dibuja el interrogante
  drawUnknown(x, y) {
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(CONSTS.CELL_VALUE.unknown, x + 0.5, y + 0.5);
  }

  // Metodo que dibuja la mina
  drawMine(x, y) {
    const p = 0.3;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(x + p, y + p, 1 - 2 * p, 1 - 2 * p);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(CONSTS.CELL_VALUE.mine, x + 0.5, y + 0.5);
  }

  // Metodo que dibuja la cruz del error
  drawError(x, y) {
    this.ctx.save();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 0.1;

    const pad = 0.1;
    const x1 = x + pad;
    const y1 = y + pad;
    const x2 = x + 1 - pad;
    const y2 = y + 1 - pad;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.moveTo(x1, y2);
    this.ctx.lineTo(x2, y1);
    this.ctx.stroke();

    this.ctx.restore();
  }

  // Metodo que dibuja la celda cerrada
  drawClosedCell(cellX, cellY, pressed = false) {
    const c = CONSTS;

    const fillColor = pressed ? c.PRESSED_CELL_FILL_COLOR : c.CLOSED_CELL_FILL_COLOR;
    const topColor = pressed ? c.PRESSED_CELL_BORDER_COLOR_1 : c.CLOSED_CELL_BORDER_COLOR_1;
    const bottomColor = pressed ? c.PRESSED_CELL_BORDER_COLOR_2 : c.CLOSED_CELL_BORDER_COLOR_2;

    // Fill
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(cellX, cellY, 1, 1);

    // Simple optimized borders
    this.drawClosedBorders(cellX, cellY, topColor, bottomColor);
  }

  // Metodo que dibuja los bordes de las celdas cerradas
  drawClosedBorders(x, y, topColor, bottomColor) {
    const b = 0.15;

    // Top
    this.ctx.fillStyle = topColor;
    this.ctx.fillRect(x, y, 1, b);

    // Left
    this.ctx.fillRect(x, y, b, 1);

    // Bottom
    this.ctx.fillStyle = bottomColor;
    this.ctx.fillRect(x, y + 1 - b, 1, b);

    // Right
    this.ctx.fillRect(x + 1 - b, y, b, 1);
  }

  // Metodo que dibuja la regilla del tablero
  drawGrid() {
    const c = CONSTS;

    this.ctx.strokeStyle = c.GRID_LINE_COLOR;
    this.ctx.lineWidth = c.GRID_LINE_WIDTH;

    for (let i = 0; i <= this.canvas.width; i++) {
      // Horizontal
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();

      // Vertical
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.width);
      this.ctx.stroke();
    }
  }

  // draw(board, showBoard) {
  //   this.drawBackground(board, showBoard);
  //   this.drawValues(board, showBoard);
  //   this.drawGrid();
  // }

  // drawBackground(board, showBoard) {
  //   board.forEach((row, y) => {
  //     row.forEach((value, x) => {
  //       // Pintar el fondo de la celda
  //       if (showBoard[y][x] === CONSTS.CELL_STADE.detonatedMine) {
  //         this.ctx.fillStyle = CONSTS.CANVAS_BACKGROUND_DETONATED_COLOR;
  //         //} else if (showBoard[y][x] === CONSTS.CELL_STADE.closed) {
  //         // this.ctx.fillStyle = CONSTS.CANVAS_BACKGROUND_CLOSED_COLOR;
  //       } else if (showBoard[y][x] === CONSTS.CELL_STADE.defeatOpenWave) {
  //         this.ctx.fillStyle = CONSTS.CANVAS_BACKGROUND_DEFEAT_OPEN_WAVE_COLOR;
  //       } else if (showBoard[y][x] === CONSTS.CELL_STADE.openWave) {
  //         this.ctx.fillStyle = CONSTS.CANVAS_BACKGROUND_OPEN_WAVE_COLOR;
  //       } else if (showBoard[y][x] === CONSTS.CELL_STADE.open) {
  //         this.ctx.fillStyle = CONSTS.CANVAS_BACKGROUND_OPEN_COLOR;
  //       }
  //       this.ctx.fillRect(x, y, 1, 1);
  //     });
  //   });
  // }

  // drawValues(board, showBoard) {
  //   this.ctx.save();
  //   const fontSize = 0.65;

  //   // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  //   this.ctx.font = `${fontSize}px buscaminas`;
  //   this.ctx.textAlign = 'center';
  //   this.ctx.textBaseline = 'middle';

  //   board.forEach((row, y) => {
  //     row.forEach((value, x) => {
  //       const state = showBoard[y][x];
  //       if (state === CONSTS.CELL_STADE.open || state === CONSTS.CELL_STADE.detonatedMine || state === CONSTS.CELL_STADE.error) {
  //         if (value === CONSTS.CELL_VALUE.mine || state === CONSTS.CELL_STADE.error) {
  //           this.ctx.fillStyle = 'black';
  //           this.ctx.fillText(CONSTS.CELL_VALUE.mine, x + 0.5, y + 0.5);

  //           if (state === CONSTS.CELL_STADE.error) {
  //             this.drawError(x, y);
  //           }
  //         } else if (value !== CONSTS.CELL_VALUE.void) {
  //           this.ctx.fillStyle = CONSTS.NUMBERS_COLORS[value];
  //           this.ctx.fillText(value, x + 0.5, y + 0.5);
  //         }
  //       } else if (state === CONSTS.CELL_STADE.closed || state === CONSTS.CELL_STADE.flag || state === CONSTS.CELL_STADE.unknown) {
  //         this.drawClosedCell(x, y);
  //         if (state === CONSTS.CELL_STADE.flag) {
  //           this.ctx.fillStyle = 'red';
  //           this.ctx.fillText(CONSTS.CELL_VALUE.flag, x + 0.5, y + 0.5);
  //         } else if (state === CONSTS.CELL_STADE.unknown) {
  //           this.ctx.fillStyle = 'black';
  //           this.ctx.fillText(CONSTS.CELL_VALUE.unknown, x + 0.5, y + 0.5);
  //         }
  //       }
  //     });
  //   });

  //   this.ctx.restore();
  // }

  // drawGrid() {
  //   this.ctx.strokeStyle = CONSTS.GRID_LINE_COLOR;
  //   this.ctx.lineWidth = CONSTS.GRID_LINE_WIDTH;

  //   for (let i = 0; i <= this.canvas.width; i++) {
  //     this.ctx.beginPath();
  //     this.ctx.moveTo(0, i);
  //     this.ctx.lineTo(this.canvas.width, i);
  //     this.ctx.stroke();

  //     this.ctx.beginPath();
  //     this.ctx.moveTo(i, 0);
  //     this.ctx.lineTo(i, this.canvas.width);
  //     this.ctx.stroke();
  //   }
  // }

  // drawError(cellX, cellY) {
  //   this.ctx.save();
  //   this.ctx.strokeStyle = 'red';
  //   this.ctx.lineWidth = 0.1;

  //   const padding = 0.1;

  //   const x1 = cellX + padding;
  //   const y1 = cellY + padding;
  //   const x2 = cellX + 1 - padding;
  //   const y2 = cellY + 1 - padding;

  //   this.ctx.beginPath();
  //   this.ctx.moveTo(x1, y1);
  //   this.ctx.lineTo(x2, y2);
  //   this.ctx.stroke();

  //   this.ctx.beginPath();
  //   this.ctx.moveTo(x1, y2);
  //   this.ctx.lineTo(x2, y1);
  //   this.ctx.stroke();

  //   this.ctx.restore();
  // }

  // drawClosedCell(cellX, cellY, pressed = false) {
  //   this.ctx.save();

  //   const border = 0.15;
  //   const size = 1;
  //   const cx = cellX + size / 2;
  //   const cy = cellY + size / 2;

  //   const fillColor = pressed ? CONSTS.PRESSED_CELL_FILL_COLOR : CONSTS.CLOSED_CELL_FILL_COLOR;
  //   const topLeftColor = pressed ? CONSTS.PRESSED_CELL_BORDER_COLOR_1 : CONSTS.CLOSED_CELL_BORDER_COLOR_1;
  //   const bottomRightColor = pressed ? CONSTS.PRESSED_CELL_BORDER_COLOR_2 : CONSTS.CLOSED_CELL_BORDER_COLOR_2;

  //   // Relleno
  //   this.ctx.fillStyle = fillColor;
  //   this.ctx.fillRect(cellX, cellY, size, size);

  //   // Borde superior
  //   {
  //     const grad = this.ctx.createLinearGradient(cellX, cellY, cellX, cy);
  //     grad.addColorStop(0, topLeftColor);
  //     grad.addColorStop(1, fillColor);

  //     this.ctx.fillStyle = grad;
  //     this.ctx.fillRect(cellX, cellY, size, border);
  //   }

  //   // Borde izquierdo
  //   {
  //     const grad = this.ctx.createLinearGradient(cellX, cellY, cx, cellY);
  //     grad.addColorStop(0, topLeftColor);
  //     grad.addColorStop(1, fillColor);

  //     this.ctx.fillStyle = grad;
  //     this.ctx.fillRect(cellX, cellY, border, size);
  //   }

  //   // Borde derecho
  //   {
  //     const grad = this.ctx.createLinearGradient(cellX + size, cellY, cx, cellY);
  //     grad.addColorStop(0, bottomRightColor);
  //     grad.addColorStop(1, fillColor);

  //     this.ctx.fillStyle = grad;
  //     this.ctx.fillRect(cellX + size - border, cellY, border, size);
  //   }

  //   // Borde inferior
  //   {
  //     const grad = this.ctx.createLinearGradient(cellX, cellY + size, cellX, cy);
  //     grad.addColorStop(0, bottomRightColor);
  //     grad.addColorStop(1, fillColor);

  //     this.ctx.fillStyle = grad;
  //     this.ctx.fillRect(cellX, cellY + size - border, size, border);
  //   }

  //   this.ctx.restore();
  // }
}
