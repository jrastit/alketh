import { ContractHandlerType } from '../type/contractType'

import { GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

import { PlaceRefType } from '../component/placeHelper'

import { getNewGameCardFromId } from '../game/game'

export const playDrawCard = async (
  contractHandler: ContractHandlerType,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  if (turnData.cardList[1 - turnData.myTurn][gameCardId] === undefined) {
    const cardList = turnData.cardList[1 - turnData.myTurn].concat([])
    cardList[gameCardId] = await getNewGameCardFromId(
      contractHandler,
      turnData.userId[1 - turnData.myTurn],
      gameCardId
    )
    setTurnData({
      ...turnData,
      cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId,
        actionTypeId: ActionType.Draw,
      }]),
    })

  } else {
    throw Error('invalid draw gameCardId ' + turnData.cardList[1 - turnData.myTurn][gameCardId])
  }
}

const removeCard = (cardList: (GameCardType | undefined)[], cardId: number) => {
  for (let i = 16; i < cardList.length; i++) {
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
) => {
  let cardList1 = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  let cardList2 = turnData.cardList[turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  if (cardList1[gameCardId1] !== undefined && cardList2[gameCardId2] !== undefined) {
    const gameCard1 = cardList1[gameCardId1] as GameCardType
    const gameCard2 = cardList2[gameCardId2] as GameCardType
    gameCard1.play = 1
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
    const newTurnData = {
      ...turnData,
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId1,
        actionTypeId: ActionType.Attack,
        dest: gameCardId2,
      }]),
      cardList: turnData.myTurn ? [cardList1, cardList2] : [cardList2, cardList1],
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
  annimate?: {
    cardRefIdList: number[][],
    current: (PlaceRefType | null)[],
    annimatePlay: (
      myTurn: number,
      cardRefIdList: number[][],
      current: (PlaceRefType | null)[],
      actionId: number,
      gameCardId1: number,
      gameCardId2: number
    ) => Promise<void>
  }
) => {
  //console.log(turnData.turn, turnData.myTurn, gameAction)
  if (gameAction.result || gameAction.self) {
    if (gameAction.actionTypeId === ActionType.Draw) {
      await playDrawCard(
        contractHandler,
        gameAction.gameCardId,
        turnData,
        setTurnData,
      )
    } else {
      const _gameCard = turnData.cardList[1 - turnData.myTurn][gameAction.gameCardId]
      //console.log(turnData.cardList[1 - turnData.myTurn])
      if (_gameCard) {
        const gameCard = _gameCard as GameCardType
        if (
          gameCard.id >= 0 && gameCard.id < 2 &&
          gameAction.actionTypeId === ActionType.Attack &&
          gameAction.dest !== undefined
        ) {
          const gameCardId2 = gameAction.dest
          annimate && await annimate.annimatePlay(
            turnData.myTurn,
            annimate.cardRefIdList,
            annimate.current,
            gameAction.actionTypeId,
            gameCard.id,
            gameCardId2,
          )
          playAttack(
            gameCard.id,
            gameCardId2,
            turnData,
            setTurnData
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
