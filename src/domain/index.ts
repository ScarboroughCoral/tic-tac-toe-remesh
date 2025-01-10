import { Remesh } from "remesh";
export enum GamePlayState {
  Ready,
  Playing,
  Over,
}
export enum Player {
  X = "X",
  O = "O",
}
enum BoardItemState {
  X = Player.X,
  O = Player.O,
  Empty = " ",
}
namespace BoardItemState {
  export function fromPlayer(player: Player) {
    return player === Player.X ? BoardItemState.X : BoardItemState.O;
  }
}
const checkWhoWin = (board: BoardItemState[]): Player | null => {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] === board[b] && board[a] === board[c]) {
      if (board[a] !== BoardItemState.Empty) {
        return board[a] === BoardItemState.X ? Player.X : Player.O;
      }
    }
  }
  return null;
};

export const TicTacToeDomain = Remesh.domain({
  name: "TicTacToeDomain",
  impl: (domain) => {
    const GameState = domain.state({
      name: "GameState",
      default: GamePlayState.Ready,
    });
    const GameWinnerState = domain.state<Player | null>({
      name: "GameWinnerState",
      default: null,
    });
    const NextPlayerState = domain.state({
      name: "NextPlayerState",
      default: Player.X,
    });
    const GameBoardState = domain.state({
      name: "GameBoardState",
      default: Array<BoardItemState>(9).fill(BoardItemState.Empty),
    });
    const StartGameCommand = domain.command({
      name: "StartGameCommand",
      impl: () => {
        return [GameState().new(GamePlayState.Playing)];
      },
    });
    const GameOverEvent = domain.event({
      name: "GameOverEvent",
      impl: ({ get }) => {
        const winner = get(GameWinnerState());
        return winner;
      },
    });
    const MakeMoveCommand = domain.command({
      name: "MakeMoveCommand",
      impl: ({ get }, index: number) => {
        const nextPlayer = get(NextPlayerState());
        const gameBoardState = get(GameBoardState());
        const gameState = get(GameState());
        if (
          gameBoardState[index] !== BoardItemState.Empty ||
          gameState !== GamePlayState.Playing
        ) {
          return null;
        }
        const newGameBoard = [
          ...gameBoardState.slice(0, index),
          BoardItemState.fromPlayer(nextPlayer),
          ...gameBoardState.slice(index + 1),
        ];
        const newGameBoardState = GameBoardState().new(newGameBoard);
        const winner = checkWhoWin(newGameBoard);
        if (winner) {
          return [
            newGameBoardState,
            GameState().new(GamePlayState.Over),
            GameWinnerState().new(winner),
            GameOverEvent(),
          ];
        }
        if (newGameBoard.every((item) => item !== BoardItemState.Empty)) {
          return [
            newGameBoardState,
            GameState().new(GamePlayState.Over),
            GameOverEvent(),
          ];
        }
        return [
          newGameBoardState,
          NextPlayerState().new(nextPlayer === Player.X ? Player.O : Player.X),
        ];
      },
    });
    const ResetGameCommand = domain.command({
      name: "ResetGameCommand",
      impl: () => {
        return [
          GameState().new(GamePlayState.Ready),
          GameWinnerState().new(null),
          NextPlayerState().new(Player.X),
          GameBoardState().new(
            Array<BoardItemState>(9).fill(BoardItemState.Empty)
          ),
        ];
      },
    });
    const NextPlayerQuery = domain.query({
      name: "NextPlayerQuery",
      impl: ({ get }) => {
        return get(NextPlayerState());
      },
    });
    const GameBoardQuery = domain.query({
      name: "GameBoardQuery",
      impl: ({ get }) => {
        return get(GameBoardState());
      },
    });
    const GamePlayStateQuery = domain.query({
      name: "GamePlayStateQuery",
      impl: ({ get }) => {
        return get(GameState());
      },
    });
    const GameReadyQuery = domain.query({
      name: "GameReadyQuery",
      impl: ({ get }) => {
        return get(GamePlayStateQuery()) === GamePlayState.Ready;
      },
    });
    return {
      command: {
        StartGameCommand,
        MakeMoveCommand,
        ResetGameCommand,
      },
      query: {
        NextPlayerQuery,
        GameBoardQuery,
        GamePlayStateQuery,
        GameReadyQuery,
      },
      event: {
        GameOverEvent,
      },
    };
  },
});
