//types
import type { Props, tipoDeJugadores } from "../../type";

export default function index({ reset, funCambiarJugador }: Props) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={reset}
        className="mt-5 mb-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Reiniciar
      </button>
      <div className="w-full grid md:grid-cols-2 sm:grid-cols-1">
        <label className="p-5 flex items-center justify-evenly text-xl bg-emerald-500">
          Jugador 1:{"   "}
          <select
            onChange={(e) => {
              funCambiarJugador(e.target.value as tipoDeJugadores, "w");
            }}
            className="flex items-center bg-emerald-500">
            <option value="humano">Humano</option>
            <option value="botRandom">BotRandom</option>
            <option value="botIA">BotIA</option>
          </select>
        </label>

        <label className="p-5 flex items-center justify-evenly text-xl bg-rose-500	">
          Jugador 2:{"   "}
          <select
            onChange={(e) => {
              funCambiarJugador(e.target.value as tipoDeJugadores, "b");
            }}
            className="flex items-center bg-rose-500">
            <option value="humano">Humano</option>
            <option value="botRandom">BotRandom</option>
            <option value="botIA">BotIA</option>
          </select>
        </label>
      </div>
    </div>
  );
}
