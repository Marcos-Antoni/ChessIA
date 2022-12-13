import { Chessboard } from "react-chessboard";

//component
import Config from "../Config";

//Hooks
import UseChess from "./UseChess";

export default function index() {
  //use
  const { fen, move, reset, funCambiarJugador } = UseChess();

  return (
    <div>
      <Chessboard
        boardWidth={window.innerWidth > 580 ? 560 : window.innerWidth - 20}
        position={fen}
        onPieceDrop={move}
      />
      <Config reset={reset} funCambiarJugador={funCambiarJugador} />
    </div>
  );
}
