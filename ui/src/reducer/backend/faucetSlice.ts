import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import backendConfig from "../../config/backendconfig"

import {
  addCaseWithPending,
  axiosThunk,
  axiosThunkData,
} from '../../util/reducersUtil'

// Define a type for the slice state
interface FaucetState {
  network: Array<{ networkName: string, lastRequest: Date }>
  message: string | undefined
  pending: boolean
}

const API_URL = backendConfig.url;

const initialState: FaucetState = {
  network: [] as Array<{ networkName: string, lastRequest: Date }>,
  message: undefined,
  pending: false
};

export const faucet = axiosThunkData<{ address: string, networkName: string }>(
  'wallet/fund',
  API_URL + "wallet/fund",
)

export const faucetSlice = createSlice({
  name: 'faucet',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    /*
    builder.addCase(faucet.fulfilled, (state, action: PayloadAction<{message : string}>) => {
      state.message = action.payload.message
      state.pending = false
    })
    builder.addCase(faucet.rejected, (state) => {
      state.pending = false
    })
    builder.addCase(faucet.pending, (state) => {
      state.pending = true
    })
    */

    addCaseWithPending(builder, faucet)
  }
})


export const { } = faucetSlice.actions

export default faucetSlice.reducer
