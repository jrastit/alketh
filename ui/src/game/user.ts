import { utils as ethersUtils } from 'ethers'
import { ContractHandlerType } from '../type/contractType'

import {
  UserType,
  UserDeckType,
  UserCardType,
} from '../type/userType'

import {
  CardType,
} from '../type/cardType'

export const registerUser = async (
  contractHandler: ContractHandlerType,
  name: string,
) => {
  const tx = await contractHandler.gameManager.getContract().registerUserSelf(
    name
  )
  return tx
}

export const getUserId = async (
  contractHandler: ContractHandlerType,
  address?: string,
) => {
  if (!address) {
    address = await contractHandler.transactionManager.signer.getAddress()
  }
  const idBG = await contractHandler.gameManager.getContract().userAddressList(address)
  return idBG[0].toNumber()
}

export const getUser = async (
  contractHandler: ContractHandlerType,
  userId: number,
) => {
  const userChain = await contractHandler.gameManager.getContract().userIdList(userId)
  return {
    id: userChain.id.toNumber(),
    name: userChain.name,
    totem: userChain.totem,
    rank: userChain.rank.toNumber(),
  } as UserType
}

export const getUserCardList = async (
  contractHandler: ContractHandlerType,
  userId: number,
) => {
  const cardListChain = await contractHandler.gameManager.getContract().getUserCardList(userId)
  return cardListChain.userCard.map((userCardChain: any, id: number) => {
    return {
      id: id + 1,
      cardId: userCardChain.cardId,
      exp: userCardChain.exp.toNumber(),
      expWin: userCardChain.expWin.toNumber(),
      price: parseFloat(ethersUtils.formatEther(userCardChain.price)),
      sold: userCardChain.sold,
      nftId: userCardChain.nftId,
    } as UserCardType
  }) as UserCardType[]
}

export const getUserDeckList = async (
  contractHandler: ContractHandlerType,
  userId: number,
) => {
  const deckLength = (await contractHandler.gameManager.getContract().getUserDeckLength(userId))[0]
  const userDeckList = [] as UserDeckType[]
  for (let i = 1; i <= deckLength; i++) {
    const gameDeckCardChain = (await contractHandler.gameManager.getContract().getUserDeckCard(userId, i))[0]
    userDeckList.push({
      id: i,
      userCardIdList: gameDeckCardChain,
    })
  }
  return userDeckList
}

export const addUserDefaultDeck = async (
  contractHandler: ContractHandlerType,
  userCardList: UserCardType[],
  cardList: CardType[],
) => {
  const deckCardList = []
  for (let mana = 1; mana <= 5; mana++) {
    const userCard = userCardList.filter(userCard => (cardList.filter(card => card.id === userCard.cardId)[0]).mana === mana)[0]
    if (!userCard) {
      throw Error('Card not found for mana ' + mana)
    }
    deckCardList.push(userCard)
  }
  return await addUserDeck(contractHandler, deckCardList)
}

export const addUserDeck = async (
  contractHandler: ContractHandlerType,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 5) {
    throw new Error("Should have 5 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  const tx = await contractHandler.gameManager.getContract().addGameDeckSelf(
    deckCardIdList,
  )
  let deckId = 0
  await Promise.all(tx.result.logs.map(async (log: any) => {
    const log2 = contractHandler.gameManager.getContract().interface.parseLog(log)
    if (log2.name === 'DeckUpdated') {
      deckId = log2.args.deckId
    }
  }))
  return {
    id: deckId,
    userCardIdList: deckCardIdList,
  } as UserDeckType
}

export const updateUserDeck = async (
  contractHandler: ContractHandlerType,
  deckId: number,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 5) {
    throw new Error("Should have 5 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  await contractHandler.gameManager.getContract().updateGameDeckSelf(
    deckId,
    deckCardIdList,
  )
  return {
    id: deckId,
    userCardIdList: deckCardIdList,
  } as UserDeckType
}

export const addUserStarterCard = async (
  contractHandler: ContractHandlerType,
  userId: number,
) => {
  return await contractHandler.gameManager.getContract().addUserStarterCard(
    userId
  )
}
