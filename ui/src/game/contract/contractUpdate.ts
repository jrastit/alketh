import {
  BigNumber,
} from 'ethers'


import {
  ContractType
} from '../../type/contractType'

import {
  createWithManagerContractGameManager,
  createWithManagerContractGameList,
} from '../../contract/solidity/compiled/contractAutoFactory'

import {
  getHashContractGameManager,
  getHashContractPlayGameFactory,
  getHashContractPlayActionLib,
  getHashContractPlayBot,
  getHashContractNFT,
  getHashContractAlketh,
  getHashContractGameList,
  getHashContractCardList,
} from './contractHash'

import {
  createContractAlketh,
  createContractPlayGameFactory,
  createContractPlayActionLib,
  createContractCardList,
  createContractPlayBot,
  createContractNFT,
} from './contractCreate'

import { ContractHandlerType } from '../../type/contractType'

const updateContractAlketh = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractAlketh(contractHandler, _setMessage)
  contractHandler.alketh.contractHash = getHashContractAlketh()
  contractHandler.alketh.versionOk = true
  console.log("Alketh created at " + contractHandler.alketh.getContract().address)
}

const _updateContract = async <T extends { address: string }>(
  name: string,
  contract: ContractType<T>,
  contractHash: BigNumber,
  updateFunction: (address: string) => Promise<void>,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (updateFunction && contract.isContract()) {
    _setMessage && _setMessage("Update " + name + "...")
    await updateFunction(
      contract.getContractNotOk().address
    )
    contract.contractHash = contractHash
    contract.versionOk = true
  } else {
    contract.contractHash = undefined
    contract.versionOk = false
  }
}

const _updateContractWithHash = async <T extends { address: string }>(
  name: string,
  contract: ContractType<T>,
  contractHash: BigNumber,
  updateFunction: (contractHash: BigNumber, address: string) => Promise<void>,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (updateFunction && contract.isContract()) {
    _setMessage && _setMessage("Update " + name + "...")
    await updateFunction(
      contractHash,
      contract.getContractNotOk().address
    )
    contract.contractHash = contractHash
    contract.versionOk = true
  } else {
    contract.contractHash = undefined
    contract.versionOk = false
  }
}

const updateContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractPlayGameFactory(contractHandler, _setMessage)
  await _updateContract(
    'PlayGameFactory',
    contractHandler.playGameFactory,
    getHashContractPlayGameFactory(),
    contractHandler.gameList.getContract().updatePlayGameFactory,
    _setMessage,
  )
}

const updateContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractPlayActionLib(contractHandler, _setMessage)

  await _updateContract(
    'PlayActionLib',
    contractHandler.playActionLib,
    getHashContractPlayActionLib(),
    contractHandler.gameList.getContract().updatePlayActionLib,
    _setMessage,
  )

}

const updateContractCardList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractCardList(contractHandler, _setMessage)
  await _updateContract(
    'CardList',
    contractHandler.cardList,
    getHashContractCardList(),
    contractHandler.gameManager.getContract().updateCardList,
    _setMessage,
  )
}

const updateContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractPlayBot(contractHandler, _setMessage)
  await _updateContractWithHash(
    'PlayBot',
    contractHandler.playBot,
    getHashContractPlayBot(),
    contractHandler.gameList.getContract().addBot,
    _setMessage,
  )
}

const updateContractNFT = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractNFT(
    contractHandler,
    _setMessage,
  )
  await _updateContract(
    'NFT',
    contractHandler.nft,
    getHashContractNFT(),
    contractHandler.gameManager.getContract().updateNFT,
    _setMessage,
  )
}

const updateContractGameManager = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractCardList(
    contractHandler,
    _setMessage
  )
  if (contractHandler.cardList.isContract()) {
    _setMessage && _setMessage("Creating contract game manager...")
    contractHandler.gameManager.setContract(await createWithManagerContractGameManager(
      contractHandler.alketh.getContract(),
      contractHandler.cardList.getContractNotOk(),
      contractHandler.transactionManager,
    ))
  }
  if (contractHandler.gameManager.isContract()) {
    contractHandler.alketh.getContract().addContract(
      getHashContractGameManager(),
      contractHandler.gameManager.getContractNotOk().address,
    )
    contractHandler.gameManager.contractHash = getHashContractGameManager()
    contractHandler.gameManager.versionOk = true
    contractHandler.cardList.contractHash = getHashContractCardList()
    contractHandler.cardList.versionOk = true
    return
  }
}

const updateContractGameList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractPlayGameFactory(
    contractHandler,
    _setMessage
  )
  await createContractPlayActionLib(
    contractHandler,
    _setMessage
  )
  if (contractHandler.playGameFactory.isContract() && contractHandler.playActionLib.isContract()) {
    _setMessage && _setMessage("Creating contract game list...")
    contractHandler.gameList.setContract(await createWithManagerContractGameList(
      contractHandler.gameManager.getContract(),
      contractHandler.playGameFactory.getContractNotOk(),
      contractHandler.playActionLib.getContractNotOk(),
      getHashContractGameList(),
      contractHandler.transactionManager
    ))
  }

  if (contractHandler.gameList.isContract()) {
    contractHandler.gameManager.getContract().updateGameList(
      contractHandler.gameList.getContractNotOk().address,
    )
    contractHandler.gameList.contractHash = getHashContractGameList()
    contractHandler.gameList.versionOk = true
    contractHandler.playGameFactory.contractHash = getHashContractPlayGameFactory()
    contractHandler.playGameFactory.versionOk = true
    contractHandler.playActionLib.contractHash = getHashContractPlayActionLib()
    contractHandler.playActionLib.versionOk = true
  }
}

export const updateAllContract = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (!contractHandler.alketh.versionOk) {
    await updateContractAlketh(contractHandler, _setMessage)
  }
  if (contractHandler.alketh.versionOk) {
    if (!contractHandler.gameManager.versionOk) {
      await updateContractGameManager(contractHandler, _setMessage)
    }
    if (contractHandler.gameManager.versionOk) {
      if (!contractHandler.cardList.versionOk) {
        await updateContractCardList(contractHandler, _setMessage)
      }
      if (!contractHandler.nft.versionOk) {
        await updateContractNFT(contractHandler, _setMessage)
      }

      if (!contractHandler.gameList.versionOk) {
        await updateContractGameList(contractHandler, _setMessage)
      }
      if (contractHandler.gameList.versionOk) {
        if (!contractHandler.playActionLib.versionOk) {
          await updateContractPlayActionLib(contractHandler, _setMessage)
        }
        if (!contractHandler.playGameFactory.versionOk) {
          await updateContractPlayGameFactory(contractHandler, _setMessage)
        }
        if (!contractHandler.playBot.versionOk) {
          await updateContractPlayBot(contractHandler, _setMessage)
        }
      }
    }

  }
}

export const updateAlkethContractHash = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("get contract Alketh...")
  if (contractHandler.alketh.isContract() && contractHandler.alketh.contractHash) {
    const newContractHash = getHashContractAlketh()
    if (!newContractHash.eq(contractHandler.alketh.contractHash)) {
      await contractHandler.alketh.getContract().setContractHash(newContractHash)
      contractHandler.alketh.contractHash = newContractHash
      contractHandler.alketh.versionOk = true
    }
    contractHandler.alketh.versionOk = contractHandler.alketh.contractHash ?
      newContractHash.eq(contractHandler.alketh.contractHash) :
      false
  }
}
