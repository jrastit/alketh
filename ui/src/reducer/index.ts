import { combineReducers } from "redux"
import cardListSlice from './cardListSlice'
import userSlice from './userSlice'
import gameSlice from './gameSlice'
import contractSlice from './contractSlice'
import walletSlice from './walletSlice'
import configSlice from './configSlice'

export default combineReducers({
  cardListSlice,
  userSlice,
  gameSlice,
  contractSlice,
  walletSlice,
  configSlice,
})
