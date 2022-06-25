import { BigNumber } from 'ethers'

export type NftType = {
  id: BigNumber
  owner: string
  cardId: number
  exp: number
}
