import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import * as tf from "@tensorflow/tfjs";

//types
import type { ChessBoardProps } from "react-chessboard";
import type { MovimientoValido, Jugadores, funCambiarJugador } from "../../type";

//componente
import useIA from "./UseIA";

//export
export default function UseChess() {
  //use
  const { model } = useIA();
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [jugadores, setJugadores] = useState<Jugadores>({ w: "humano", b: "humano" });

  //functions
  const humano: ChessBoardProps["onPieceDrop"] = (_sourceSquare, targetSquare, piece) => {
    if (chess.isGameOver()) return false;
    if (jugadores[chess.turn()] !== "humano") return false;

    const movimientosPosibles = chess.moves() as string[];
    const movimiento =
      piece[1] === "P" || piece[1] === "p" ? targetSquare : piece[1] + targetSquare;
    const movimientoValido = FunMovimientoValido(movimientosPosibles, movimiento);

    if (!movimientoValido) return false;

    chess.move(movimientoValido);
    setFen(chess.fen());

    return true;
  };

  const botRandom = () => {
    if (jugadores[chess.turn()] !== "botRandom") return false;

    const movimientosPosibles = chess.moves();

    const movimientoAleatorio =
      movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];

    chess.move(movimientoAleatorio);

    setFen(chess.fen());
  };

  const botIA = async () => {
    if (jugadores[chess.turn()] !== "botIA" || model === undefined) return false;
    const movimientosPosibles = chess.moves();
    const { entreada, jugadas } = traerDatos();
    const xs = tf.tensor2d([entreada], [1, 80]);

    const ys = model.predict(xs) as tf.Tensor;
    const datos = [...(await ys.data())];
    const res = datos.reduce((a, b) => (b === 0 ? a : a * b), 1);

    const mejorMovimiento = jugadas.map((mov) => mov - res).map((mov) => mov ** 2);

    const index = mejorMovimiento.indexOf(Math.min(...mejorMovimiento));

    const movimientoDeLaIA = movimientosPosibles[index];

    chess.move(movimientoDeLaIA);

    setFen(chess.fen());
  };

  const traerDatos = () => {
    const movimientosPosibles = chess.moves() as string[];
    const fenNumber = fen.split("").map((letra) => letra.charCodeAt(0));
    const turnNumber = chess.turn() === "w" ? 119 : 98;

    const jugadas = movimientosPosibles.map((mov) => {
      const newMov = mov.split("").map((letra) => {
        return letra.charCodeAt(0);
      });
      return newMov.reduce((a, b) => a * b, 1);
    });

    const entreada = [turnNumber, ...fenNumber];

    if (entreada.length < 80) {
      const length = 80 - entreada.length;
      for (let i = 0; i < length; i++) {
        entreada.push(0);
      }
    }

    return { entreada, jugadas };
  };

  const FunMovimientoValido: MovimientoValido = (movimientosPosibles, movimiento) => {
    return movimientosPosibles.find((mov) => {
      let newMov = mov.replace("+", "");

      if (movimiento.length === 2) {
        if (newMov[0] === newMov[0].toUpperCase()) return undefined;

        return newMov.includes(movimiento);
      } else if (movimiento.length === 3) {
        if (newMov[0] !== movimiento[0]) return undefined;

        return newMov.includes(movimiento.slice(1));
      }
    });
  };

  const reset = () => {
    chess.reset();
    setFen(chess.fen());
  };
  const funCambiarJugador: funCambiarJugador = (jugador, color) => {
    setJugadores({ ...jugadores, [color]: jugador });
  };

  //useEffect
  useEffect(() => {
    if (chess.isGameOver()) {
      chess.reset();
      setFen(chess.fen());
    }
  }, [chess.isGameOver()]);

  useEffect(() => {
    const arrayFunJugador = {
      humano: () => {},
      botRandom,
      botIA,
    };

    const turno = jugadores[chess.turn()];

    setTimeout(() => {
      if (arrayFunJugador[turno]) arrayFunJugador[turno]();
    }, 500);
  }, [fen, model, jugadores]);

  //return
  return {
    fen,
    funCambiarJugador,
    move: humano,
    reset,
  };
}
