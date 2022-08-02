import {
  constants as ethersConstants,
  BigNumber,
} from 'ethers'

import {
  TransactionManager
} from '../../util/TransactionManager'

import {
  createWithManagerContractAlketh,
  createWithManagerContractPlayGameFactory,
  createWithManagerContractPlayActionLib,
  createWithManagerContractNFT,
  createWithManagerContractPlayBot,
  createWithManagerContractCardList,

  getWithManagerContractPlayGameFactory,
  getWithManagerContractPlayActionLib,
  getWithManagerContractNFT,
  getWithManagerContractPlayBot,
  getWithManagerContractCardList,

} from '../../contract/solidity/compiled/contractAutoFactory'

import {
  getHashContractPlayGameFactory,
  getHashContractPlayActionLib,
  getHashContractPlayBot,
  getHashContractNFT,
  getHashContractAlketh,
  getHashContractCardList,
} from './contractHash'

import { ContractHandlerType } from '../../type/contractType'

export const createContractAlketh = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract Alketh...")
  contractHandler.alketh.setContract(await createWithManagerContractAlketh(
    getHashContractAlketh(),
    contractHandler.transactionManager
  ))
}

const _createContract = async <T extends { address: string }>(
  name: string,
  contractHash: BigNumber,
  createWithManager: (
    contractHash: BigNumber,
    transactionManager: TransactionManager
  ) => Promise<T>,
  getWithManager: (
    contractAddress: string,
    transactionManager: TransactionManager
  ) => T,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  let contract: T | undefined
  if (contractHandler.alketh.versionOk) {
    _setMessage && _setMessage("Loading contract " + name + "...")
    const contractAddress = (await contractHandler.alketh.getContract().getContract(contractHash))[0]
    if (contractAddress !== ethersConstants.AddressZero) {
      contract = getWithManager(
        contractAddress,
        contractHandler.transactionManager,
      )
    }
  }
  if (!contract) {
    _setMessage && _setMessage("Creating contract " + name + "...")
    contract = await createWithManager(
      contractHash,
      contractHandler.transactionManager,
    )
  }
  if (contractHandler.alketh.versionOk) {
    await contractHandler.alketh.getContract().addContract(
      contractHash,
      contract.address
    )
  }
  return contract
}

export const createContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playGameFactory.setContract(await _createContract(
    "PlayGameFactory",
    getHashContractPlayGameFactory(),
    createWithManagerContractPlayGameFactory,
    getWithManagerContractPlayGameFactory,
    contractHandler,
    _setMessage,
  ))
}

export const createContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playActionLib.setContract(await _createContract(
    "PlayActionLib",
    getHashContractPlayActionLib(),
    createWithManagerContractPlayActionLib,
    getWithManagerContractPlayActionLib,
    contractHandler,
    _setMessage,
  ))
}

export const createContractCardList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.cardList.setContract(await _createContract(
    "CarList",
    getHashContractCardList(),
    createWithManagerContractCardList,
    getWithManagerContractCardList,
    contractHandler,
    _setMessage,
  ))
}

export const createContractNFT = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.nft.setContract(await _createContract(
    "NFT",
    getHashContractNFT(),
    (contractHash: BigNumber,
      transactionManager: TransactionManager, ) => {
      return createWithManagerContractNFT(
        contractHandler.gameManager.getContract().address,
        500, //5%
        contractHandler.alketh.getContract().address,
        window.location.hostname === "localhost" ? "http://localhost/nft/" : "https://alketh.com/nft/",
        contractHash,
        transactionManager,
      )
    },
    getWithManagerContractNFT,
    contractHandler,
    _setMessage,
  ))
}

export const createContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playBot.setContract(await _createContract(
    "PlayBot",
    getHashContractPlayBot(),
    createWithManagerContractPlayBot,
    getWithManagerContractPlayBot,
    contractHandler,
    _setMessage,
  ))
}
