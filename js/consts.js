// Board Config
export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 20;
export const NUM_MINES = 50;
export const CELL_SIZE = 25;

// Colors
// Background Color
export const CANVAS_BACKGROUND_OPEN_COLOR = '#bdbdbd';
// Effect Colors
export const CANVAS_BACKGROUND_OPEN_WAVE_COLOR = '#08b6ebff';
export const CANVAS_BACKGROUND_DEFEAT_OPEN_WAVE_COLOR = '#ffa600ff';
export const CANVAS_BACKGROUND_DETONATED_COLOR = '#ff0000ff';
export const CANVAS_BACKGROUND_WIN_COLOR = '#00ff00ff';

// Grid Color
export const GRID_LINE_COLOR = '#444';
// Closed Cell Colors
export const CLOSED_CELL_FILL_COLOR = '#c2c2c2ff';
export const CLOSED_CELL_BORDER_COLOR_1 = '#ffffff';
export const CLOSED_CELL_BORDER_COLOR_2 = '#7e7e7e';
// Pressed Cell Colors
export const PRESSED_CELL_FILL_COLOR = '#b3b3b3';
export const PRESSED_CELL_BORDER_COLOR_1 = '#7e7e7e';
export const PRESSED_CELL_BORDER_COLOR_2 = '#ffffff';

export const GRID_LINE_WIDTH = 0.05;

// Numbers Colors
export const NUMBERS_COLORS = {
  1: '#0000ff',
  2: '#008200',
  3: '#fe0000',
  4: '#000084',
  5: '#840000',
  6: '#008284',
  7: '#840084',
  8: '#757575'
};

export const CELL_STADE = {
  closed: 0,
  open: 1,
  flag: 2,
  unknown: 3,
  openWave: 4,
  defeatOpenWave: 5,
  detonatedMine: -1,
  error: -2
};

export const CELL_VALUE = {
  void: 0,
  mine: '*',
  flag: '`',
  unknown: '?'
};
