import { BigNumber } from 'ethers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { CardType } from '../type/cardType'
import type { NftType } from '../type/nftType'

// Define a type for the slice state
interface CardListState {
  cardList: Array<CardType>
  nftList: NftType[] | undefined
}

// Define the initial state using that type
const initialState: CardListState = {
  cardList: [],
  nftList: undefined,
}

export const cardListSlice = createSlice({
  name: 'cardList',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addNFT: (state, action: PayloadAction<NftType>) => {
      if (!state.nftList) {
        throw Error("Nft List not set")
      }
      const newCard = action.payload
      state.nftList = state.nftList.concat([newCard])
    },
    removeNFT: (state, action: PayloadAction<BigNumber>) => {
      if (!state.nftList) {
        throw Error("Nft List not set")
      }
      if (state.nftList) {
        state.nftList = state.nftList.filter(nft => !nft.id.eq(action.payload))
      }
    },
    setNFTList: (state, action: PayloadAction<NftType[]>) => {
      state.nftList = action.payload
    },
    setCardList: (state, action: PayloadAction<CardType[]>) => {
      state.cardList = action.payload
    },
    setCardLevel: (state, action: PayloadAction<{
      cardId: number,
      level: number,
      attack: number,
      life: number,
      description: string
    }>) => {
      const card = state.cardList.filter((card => card.id === action.payload.cardId))[0]
      const cardLevel = card.level[action.payload.level]
      cardLevel.attack = action.payload.attack
      cardLevel.life = action.payload.life
      cardLevel.description = action.payload.description
    },
    setCard: (state, action: PayloadAction<{
      cardId: number,
      mana: number,
      family: number,
      starter: number,
      name: string
    }>) => {
      const card = state.cardList.filter((card => card.id === action.payload.cardId))[0]
      card.mana = action.payload.mana
      card.family = action.payload.family
      card.starter = action.payload.starter
      card.name = action.payload.name
    },
    addCard: (state, action: PayloadAction<CardType>) => {
      if (state.cardList.filter(card => card.id === action.payload.id).length === 0) {
        state.cardList.push(action.payload)
      }
    },
    clearCardList: (state) => {
      state.cardList = []
    }
  },
})

export const {
  addNFT,
  setNFTList,
  addCard,
  setCardList,
  clearCardList,
  setCardLevel,
  setCard,
  removeNFT,
} = cardListSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCardList = (state: RootState) => state.cardListSlice.cardList

export default cardListSlice.reducer
