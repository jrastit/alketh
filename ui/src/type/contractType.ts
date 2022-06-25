import { BigNumber } from 'ethers'

import {
  ContractAlchethmy,
  ContractGameManager,
  ContractNFT,
  ContractPlayBot,
  ContractPlayGameFactory,
  ContractPlayActionLib,
  ContractPlayGame,
  ContractCardList,
  ContractGameList,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  TransactionManager
} from '../util/TransactionManager'

export type ContractType<Contract> = {
  name: string
  contract?: Contract
  contractHash?: BigNumber | undefined
  versionOk?: boolean | undefined
  getContract: () => Contract
}

export type ContractHandlerType = {
  transactionManager: TransactionManager
  alchethmy: ContractType<ContractAlchethmy>
  gameManager: ContractType<ContractGameManager>
  cardList: ContractType<ContractCardList>
  gameList: ContractType<ContractGameList>

  nft: ContractType<ContractNFT>

  playGameFactory: ContractType<ContractPlayGameFactory>
  playGame: ContractType<ContractPlayGame>
  playActionLib: ContractType<ContractPlayActionLib>

  playBot: ContractType<ContractPlayBot>

}

class newContract<Contract>{
  name: string
  contract?: Contract
  contractHash?: BigNumber | undefined
  versionOk?: boolean | undefined
  getContract() {
    if (this.contract && this.versionOk)
      return this.contract
    throw Error("Contract " + this.name + " not set")
  }
  constructor(name: string) {
    this.name = name
  }
}

export const newContractHandler = (
  transactionManager: TransactionManager
): ContractHandlerType => {
  return {
    transactionManager: transactionManager,
    alchethmy: new newContract<ContractAlchethmy>("Alchethmy"),
    gameManager: new newContract<ContractGameManager>("Game Manager"),
    nft: new newContract<ContractNFT>("NFT"),
    playGameFactory: new newContract<ContractPlayGameFactory>("Play Game Factory"),
    playGame: new newContract<ContractPlayGame>("Play Game"),
    playActionLib: new newContract<ContractPlayActionLib>("Play Action Lib"),
    playBot: new newContract<ContractPlayBot>("Play Bot"),
    cardList: new newContract<ContractCardList>("Card List"),
    gameList: new newContract<ContractGameList>("Game List"),
  }
}
