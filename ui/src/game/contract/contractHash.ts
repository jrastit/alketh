import {
  utils as ethersUtils,
  BigNumber,
} from 'ethers'

import {
  getHashContractGameManager as _getHashContractGameManager,
  getHashContractPlayGameFactory as _getHashContractPlayGameFactory,
  getHashContractPlayGame as _getHashContractPlayGame,
  getHashContractPlayActionLib as _getHashContractPlayActionLib,
  getHashContractPlayBot as _getHashContractPlayBot,
  getHashContractNFT as _getHashContractNFT,
  getHashContractAlketh as _getHashContractAlketh,
  getHashContractGameList as _getHashContractGameList,
  getHashContractCardList as _getHashContractCardList,

} from '../../contract/solidity/compiled/contractAutoFactory'


const _getHash = (contractHash: BigNumber) => {
  if (window && window.location.hostname === 'localhost') {
    return BigNumber.from(
      ethersUtils.id(
        window.location.hostname
      )
    ).xor(contractHash)
  }
  return contractHash
}

export const getHashContractPlayGameFactory = () => {
  return _getHash(_getHashContractPlayGameFactory().xor(_getHashContractPlayGame()))
}

export const getHashContractGameManager = () => {
  return _getHash(_getHashContractGameManager())
}

export const getHashContractPlayActionLib = () => {
  return _getHash(_getHashContractPlayActionLib())
}

export const getHashContractPlayBot = () => {
  return _getHash(_getHashContractPlayBot())
}

export const getHashContractAlketh = () => {
  return _getHash(_getHashContractAlketh())
}

export const getHashContractGameList = () => {
  return _getHash(_getHashContractGameList())
}

export const getHashContractCardList = () => {
  return _getHash(_getHashContractCardList())
}

export const getHashContractNFT = () => {
  return _getHash(_getHashContractNFT())
}
