import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import * as tf from "@tensorflow/tfjs";

//data
import json from "./partidas.json";

//types
import type { Partida, Jugada } from "../../type";

export default function useIA() {
  // use
  const [model, setModel] = useState<tf.LayersModel | undefined>();
  const [chess] = useState(new Chess());
  const [partidas] = useState(json as Partida[]);
  const [modelLoaded, setModelLoaded] = useState(false);

  // functions

  /* Generador de datos de entrenamiento */
  const generadorDeJugadas = () => {
    let partidas: Partida[] | [] = [];

    //esta desactivado porque es muy pesado para la maquina
    for (let i = 0; i < 1; i++) {
      let jugadas = partida();

      const jugadaFiltrada = jugadas.filter(
        (jugada) => jugada.turno === chess.turn().charCodeAt(0)
      );

      partidas[i] = {
        jugadas: jugadaFiltrada,
        ganador: jugadaFiltrada[0].turno,
      };
      chess.reset();
    }

    const num = Math.floor(Math.random() * 1000);
    // localStorage.setItem(`partidas${num}`, JSON.stringify(partidas));

    console.log("se termino de jenerar las jugadas");
    console.log(partidas);
  };

  const partida = (): Jugada[] => {
    let movimientos = 0;
    let jugadas: Jugada[] | [] = [];

    while (!chess.isGameOver()) {
      const movimientosPosibles = chess.moves();
      const movimientoAleatorio = movimientosPosibles[
        Math.floor(Math.random() * movimientosPosibles.length)
      ] as string;

      jugadas[movimientos] = guardarJugada(
        chess.fen(),
        movimientoAleatorio,
        chess.turn()
      );

      chess.move(movimientoAleatorio);
      movimientos++;
    }

    return jugadas;
  };

  const guardarJugada = (fen: string, movimiento: string, turno: string): Jugada => {
    const fenNumber = fen.split("").map((letra) => letra.charCodeAt(0));

    const movimientoNumber = movimiento.split("").map((letra) => letra.charCodeAt(0));

    const jugada: Jugada = {
      fen: fenNumber,
      turno: turno === "w" ? 119 : 98,
      movimiento: movimientoNumber,
    };

    return jugada;
  };

  /*Crear modelo de IA*/
  const descargarIA = async () => {
    if (!localStorage.getItem("tensorflowjs_models/model/info")) {
      const model = await tf.loadLayersModel("/model.json");
      setModel(model);
    } else {
      const model = await tf.loadLayersModel("localstorage://model");
      setModel(model);
    }
  };

  const entrenamiento = async (entrada: number[][], salida: number[][]) => {
    const xs = tf.tensor2d(entrada);
    const ys = tf.tensor2d(salida);

    model?.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ["accuracy"],
    });

    await model?.fit(xs, ys, {
      epochs: 250,
      callbacks: {
        onEpochEnd: async (epoch: number, loss) => {
          console.log("Epoch: " + epoch);
          console.log("loss: " + loss?.loss);
          console.log("acc: " + loss?.acc);
        },
      },
      shuffle: true,
      verbose: 0,
    });

    const salidaPrueva = model?.predict(tf.tensor2d(entrada[0], [1, 80]));
    console.log("salidaPrueva: " + salidaPrueva);
    console.log("salida: " + salida[0]);

    await model?.save("localstorage://model");
  };

  const DatosDeEntrenamiento = () => {
    const entrada = partidas.flatMap((partida) => {
      return partida.jugadas.map((jugada) => {
        const salida = [jugada.turno, ...jugada.fen];
        if (salida.length < 80) {
          const diferencia = 80 - salida.length;
          for (let i = 0; i < diferencia; i++) {
            salida.push(0);
          }
        }
        return salida;
      });
    });

    const salida = partidas.flatMap((partida) => {
      return partida.jugadas.map((jugada) => {
        const salida = [...jugada.movimiento];
        if (salida.length < 6) {
          const diferencia = 6 - salida.length;
          for (let i = 0; i < diferencia; i++) {
            salida.push(0);
          }
        }
        return salida;
      });
    });

    entrenamiento(entrada, salida);
  };

  //useEffect
  useEffect(() => {
    if (!modelLoaded) return setModelLoaded(true);

    descargarIA();
  }, [modelLoaded]);

  //return
  return {
    model,
  };
}
