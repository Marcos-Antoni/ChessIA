import type { Dispatch, SetStateAction } from "react";
import type { Chess } from "chess.js";

export type MovimientoValido = (
  movimientosPosibles: string[],
  movimiento: string
) => string | undefined;

export type tipoDeJugadores = "humano" | "botRandom" | "botIA";
type piesas = "w" | "b";

export interface Jugadores {
  w: tipoDeJugadores;
  b: tipoDeJugadores;
}

// 119 = w | 98 = b
type Turno = 119 | 98;

export interface Jugada {
  fen: number[];
  turno: Turno;
  movimiento: number[];
}

export interface Partida {
  jugadas: Jugada[];
  ganador: Turno;
}

export type funCambiarJugador = (type: tipoDeJugadores, piesas: piesas) => void;

export interface Props {
  reset: () => void;
  funCambiarJugador: funCambiarJugador;
}
