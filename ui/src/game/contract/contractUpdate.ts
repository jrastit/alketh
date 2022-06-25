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
  getHashContractAlchethmy,
  getHashContractGameList,
  getHashContractCardList,
} from './contractHash'

import {
  createContractAlchethmy,
  createContractPlayGameFactory,
  createContractPlayActionLib,
  createContractCardList,
  createContractPlayBot,
  createContractNFT,
} from './contractCreate'

import { ContractHandlerType } from '../../type/contractType'

const updateContractAlchethmy = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await createContractAlchethmy(contractHandler, _setMessage)
  contractHandler.alchethmy.contractHash = getHashContractAlchethmy()
  contractHandler.alchethmy.versionOk = true
  console.log("Alchethmy created at " + contractHandler.alchethmy.getContract().address)
}

const _updateContract = async <T extends { address: string }>(
  name: string,
  contract: ContractType<T>,
  contractHash: BigNumber,
  updateFunction: (address: string) => Promise<void>,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (updateFunction && contract.contract) {
    _setMessage && _setMessage("Update " + name + "...")
    await updateFunction(
      contract.contract.address
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
  if (updateFunction && contract.contract) {
    _setMessage && _setMessage("Update " + name + "...")
    await updateFunction(
      contractHash,
      contract.contract.address
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
  if (contractHandler.cardList.contract) {
    _setMessage && _setMessage("Creating contract game manager...")
    contractHandler.gameManager.contract = await createWithManagerContractGameManager(
      contractHandler.alchethmy.getContract(),
      contractHandler.cardList.contract,
      contractHandler.transactionManager,
    )
  }
  if (contractHandler.gameManager.contract) {
    contractHandler.alchethmy.getContract().addContract(
      getHashContractGameManager(),
      contractHandler.gameManager.contract.address,
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
  if (contractHandler.playGameFactory.contract && contractHandler.playActionLib.contract) {
    _setMessage && _setMessage("Creating contract game list...")
    contractHandler.gameList.contract = await createWithManagerContractGameList(
      contractHandler.gameManager.getContract(),
      contractHandler.playGameFactory.contract,
      contractHandler.playActionLib.contract,
      getHashContractGameList(),
      contractHandler.transactionManager
    )
  }

  if (contractHandler.gameList.contract) {
    contractHandler.gameManager.getContract().updateGameList(
      contractHandler.gameList.contract.address,
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
  if (!contractHandler.alchethmy.versionOk) {
    await updateContractAlchethmy(contractHandler, _setMessage)
  }
  if (contractHandler.alchethmy.versionOk) {
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

export const updateAlchethmyContractHash = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("get contract Alchethmy...")
  if (contractHandler.alchethmy.contract && contractHandler.alchethmy.contractHash) {
    const newContractHash = getHashContractAlchethmy()
    if (!newContractHash.eq(contractHandler.alchethmy.contractHash)) {
      await contractHandler.alchethmy.contract.setContractHash(newContractHash)
      contractHandler.alchethmy.contractHash = newContractHash
      contractHandler.alchethmy.versionOk = true
    }
    contractHandler.alchethmy.versionOk = contractHandler.alchethmy.contractHash ?
      newContractHash.eq(contractHandler.alchethmy.contractHash) :
      false
  }
}
