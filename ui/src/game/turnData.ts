import {
  GameCardType,
  GameType,
  TurnDataType,
} from '../type/gameType'

const checkCard = (
  card1: GameCardType | undefined,
  card2: GameCardType | undefined,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  check(card1 === undefined ? 1 : 0, card2 === undefined ? 1 : 0, 'check card undefined')
  if (card1 && card2) {
    check(card1.id, card2.id, 'check id')
    check(card1.cardId, card2.cardId, 'check cardId')
    check(card1.mana, card2.mana, 'check mana')
    check(card1.attack, card2.attack, 'check attack')
    check(card1.life, card2.life, 'check life')
    check(card1.speed, card2.speed, 'check life')
    check(card1.exp, card2.exp, 'check exp')
    check(card1.expWin, card2.expWin, 'check exp win')
  }
}

export const checkTurnData = (
  game: GameType,
  turnData: TurnDataType,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  const cardList1 = game.cardList1
  const cardList2 = game.cardList2
  /*
  console.log(
    turnData.cardList[0].map(_card => _card ?.userCardId),
    cardList1.map(_card => _card ?.userCardId),
    turnData.cardList[1].map(_card => _card ?.userCardId),
    cardList2.map(_card => _card ?.userCardId),
  )
  */
  check(turnData.cardList[0].length, cardList1.length, "Check player 0 nb card")
  for (let i = 0; i < turnData.cardList[0].length; i++) {
    checkCard(turnData.cardList[0][i], cardList1[i], check)
  }
  check(turnData.cardList[1].length, cardList2.length, "Check player 1 nb card")
  for (let i = 0; i < turnData.cardList[1].length; i++) {
    checkCard(turnData.cardList[1][i], cardList2[i], check)
  }
  check(turnData.turn, game.turn, 'Check turn')
}

export const getTurnData = (game: GameType, userId: number) => {
  console.log(game)
  const turnData = {
    turn: game.turn,
    userId: [game.userId1, game.userId2],
    pos: game.userId1 === userId ? 0 : 1,
    playActionList: [],
    drawCardList: [],
    cardList: [game.cardList1, game.cardList2],
    actionId: 0,
  } as TurnDataType
  console.log(turnData)
  return turnData
}

export const endTurnData = (
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  setTurnData({
    ...turnData,
    turn: turnData.turn + 1,
    playActionList: [],
  })
}
