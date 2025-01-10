import {
  useRemeshDomain,
  useRemeshEvent,
  useRemeshQuery,
  useRemeshSend,
} from "remesh-react";
import swal from "sweetalert";
import "./App.css";
import { TicTacToeDomain } from "./domain";

function App() {
  const send = useRemeshSend();
  const domain = useRemeshDomain(TicTacToeDomain());
  const nextPlayer = useRemeshQuery(domain.query.NextPlayerQuery());
  const gameReady = useRemeshQuery(domain.query.GameReadyQuery());
  const gameBoard = useRemeshQuery(domain.query.GameBoardQuery());
  useRemeshEvent(domain.event.GameOverEvent, async (winner) => {
    if (winner === null) {
      await swal("Game over!");
    } else {
      await swal(`Player ${winner} wins!`);
    }
    send(domain.command.ResetGameCommand());
  });
  const gameBoardVisible = !gameReady;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {gameReady && (
        <button
          onClick={() => {
            send(domain.command.StartGameCommand());
          }}
        >
          开始游戏
        </button>
      )}
      {gameBoardVisible && nextPlayer && (
        <div style={{ width: 110, textAlign: "left" }}>
          下一个玩家: {nextPlayer}
        </div>
      )}
      {/* 绘制tic tac toe */}
      {gameBoardVisible && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 60px)",
            gridTemplateRows: "repeat(3, 60px)",
            gap: "5px",
          }}
        >
          {gameBoard.map((item, index) => (
            <div
              style={{
                cursor: "pointer",
                border: "1px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
              key={index}
              onClick={() => {
                send(domain.command.MakeMoveCommand(index));
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
