import { GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

export const playRandomly = (
  turnData: TurnDataType,
  test?: boolean,
) => {
  for (let i = 0; i < 2; i++) {
    if (turnData.cardList[1 - turnData.myTurn][i]) {
      const gameCard = turnData.cardList[1 - turnData.myTurn][i] as GameCardType
      if (gameCard.play === 0) {
        for (let j = 0; j < 2; j++) {
          if (turnData.cardList[turnData.myTurn][j]) {
            const gameCard2 = turnData.cardList[turnData.myTurn][j] as GameCardType
            if (!test) {
              return ({
                gameCardId: gameCard.id,
                actionTypeId: ActionType.Attack,
                dest: gameCard2.id,
                result: gameCard.attack,
              } as GameActionType)
            }
            return 1
          }
        }
      }
    }
  }
  return 0
}
