import { ContractHandlerType } from '../type/contractType'

import { GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

import { PlaceRefType } from '../component/placeHelper'

import { getNewGameCardFromId } from '../game/game'

export const playDrawCard = async (
  contractHandler: ContractHandlerType,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  pos: number,
) => {
  const cardList = turnData.cardList[pos].concat([])
  if (cardList[gameCardId] !== undefined) {
    removeCard(cardList, gameCardId)
  }
  if (cardList[gameCardId] === undefined) {
    cardList[gameCardId] = await getNewGameCardFromId(
      contractHandler,
      turnData.userId[pos],
      gameCardId
    )
    setTurnData({
      ...turnData,
      cardList: [cardList, turnData.cardList[1 - pos]],
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId,
        actionTypeId: ActionType.Draw,
      }]),
    })
  } else {
    throw Error('invalid draw gameCardId ' + turnData.cardList[pos][gameCardId])
  }
}

const removeCard = (cardList: (GameCardType | undefined)[], cardId: number) => {
  for (let i = 2; i < cardList.length; i++) {
    if (cardList[i] === undefined && cardList[cardId]) {
      const gameCard = cardList[cardId] as GameCardType
      cardList[i] = gameCard
      gameCard.id = i
      cardList[cardId] = undefined
      return cardList
    }
  }
  throw Error("Unable to remove card " + cardId)
}

export const playAttack = (
  gameCardId1: number,
  gameCardId2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  pos: number,
  preview: boolean,
) => {
  let cardList1 = turnData.cardList[pos].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })

  let cardList2 = turnData.cardList[1 - pos].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  if (cardList1[gameCardId1] !== undefined && cardList2[gameCardId2] !== undefined) {
    const gameCard1 = cardList1[gameCardId1] as GameCardType
    const gameCard2 = cardList2[gameCardId2] as GameCardType
    gameCard1.play = 1
    if (!preview) {
      if (gameCard2.life > gameCard1.attack) {
        gameCard1.expWin += gameCard1.attack * 5
        gameCard2.expWin += gameCard1.attack
        gameCard2.life = gameCard2.life - gameCard1.attack
      } else {
        gameCard1.expWin += gameCard2.life * 10
        gameCard2.expWin += gameCard2.life
        gameCard2.life = 0
        //cardList2[gameCardId2] = undefined
        cardList2 = removeCard(cardList2, gameCardId2)
      }
      if (gameCard1.life > gameCard2.attack) {
        gameCard2.expWin += gameCard2.attack * 2
        gameCard1.expWin += gameCard2.attack
        gameCard1.life = gameCard1.life - gameCard2.attack
      } else {
        gameCard2.expWin += gameCard1.life * 4
        gameCard1.expWin += gameCard1.life
        gameCard1.life = 0
        //cardList1[gameCardId1] = undefined
        cardList1 = removeCard(cardList1, gameCardId1)
      }
    }
    const newTurnData = {
      ...turnData,
      cardList: !pos ? [cardList1, cardList2] : [cardList2, cardList1],
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId1,
        actionTypeId: ActionType.Attack + pos,
        dest: gameCardId2,
      }]),
    }
    setTurnData(newTurnData)
  } else {
    throw Error("Unable to play attack " + cardList1[gameCardId1] + ' => ' + cardList2[gameCardId2])
  }
}

export const playAction = async (
  contractHandler: ContractHandlerType,
  gameAction: GameActionType,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  preview: boolean,
  annimate?: {
    cardRefIdList: number[][],
    current: (PlaceRefType | null)[],
    annimatePlay: (
      myTurn: number,
      cardRefIdList: number[][],
      current: (PlaceRefType | null)[],
      actionId: number,
      gameCardId1: number,
      gameCardId2: number,
      preview: boolean,
    ) => Promise<void>
  }
) => {
  console.log(gameAction)
  const pos = (turnData.pos + gameAction.actionTypeId) % 2
  const actionTypeId = gameAction.actionTypeId - (gameAction.actionTypeId % 2)
  if (gameAction.result || gameAction.self) {
    if (actionTypeId === ActionType.Draw) {
      await playDrawCard(
        contractHandler,
        gameAction.gameCardId,
        turnData,
        setTurnData,
        pos,
      )
    } else if (actionTypeId === ActionType.Attack) {
      const _gameCard = turnData.cardList[pos][gameAction.gameCardId]
      //console.log(turnData.cardList[1 - turnData.myTurn])
      if (_gameCard) {
        const gameCard = _gameCard as GameCardType
        if (
          gameCard.id >= 0 && gameCard.id < 2 &&
          actionTypeId === ActionType.Attack &&
          gameAction.dest !== undefined
        ) {
          const gameCardId2 = gameAction.dest
          annimate && await annimate.annimatePlay(
            pos,
            annimate.cardRefIdList,
            annimate.current,
            actionTypeId,
            gameCard.id,
            gameCardId2,
            preview,
          )
          playAttack(
            gameCard.id,
            gameCardId2,
            turnData,
            setTurnData,
            pos,
            preview,
          )
        } else {
          console.error('Invalid card', gameCard)
          throw Error('invalid card' + gameCard.toString())
        }
      } else {
        console.error('Undefined card')
        throw Error('Undefined card')
      }
    }
  } else {
    setTurnData({
      ...turnData,
      playActionList: turnData.playActionList.concat([gameAction]),
    })
  }
}
