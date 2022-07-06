import * as ethers from 'ethers'

import TimerSemaphore from './TimerSemaphore'
import { ReplayScript } from './ReplayScript'

export enum TransactionInfoType {
  CreateContract,
  ModifyContract,
  ReadContract,
}

export interface TransactionInfo {
  transactionType: TransactionInfoType
  contractName?: string
  contractAddress?: string
  functionName?: string
  args: any

}

export interface TransactionItem {
  txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
  tx?: ethers.ethers.providers.TransactionResponse
  result?: ethers.ethers.providers.TransactionReceipt
  log?: string
  transactionInfo?: TransactionInfo
  error?: string
}

export function getErrorMessage(err: any) {
  //console.error(err)
  let message
  try {
    message = JSON.parse(err.error.body).error.message
  } catch {
    if (err.error) {
      message = err.error
    } else {
      message = err
    }

  }
  return message
}

export class TransactionManager {

  replayScript: ReplayScript | undefined

  signer: ethers.Signer

  transactionList: TransactionItem[]

  nextNonce: number

  timerSemaphore: TimerSemaphore | undefined

  constructor(signer: ethers.Signer, timerSemaphore?: TimerSemaphore) {
    this.signer = signer
    this.transactionList = []
    this.nextNonce = -1
    this.timerSemaphore = timerSemaphore
  }

  setReplayScript(replayScript?: ReplayScript) {
    if (!replayScript) {
      replayScript = new ReplayScript()
    }
    this.replayScript = replayScript
  }

  async getBalance() {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(this.signer, this.signer.getBalance) as Promise<ethers.BigNumber>
    } else {
      return this.signer.getBalance()
    }
  }

  async getNonce() {
    if (this.nextNonce === -1) {
      if (this.timerSemaphore) {
        this.nextNonce = await this.timerSemaphore.callClassFunction(
          this.signer,
          this.signer.getTransactionCount
        ) as number
      } else {
        this.nextNonce = await this.signer.getTransactionCount()
      }
    } else {
      this.nextNonce = this.nextNonce + 1
    }
    return this.nextNonce
  }

  async populateTransaction(contractClass: any, functionName: string, ...args: any[]) {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(this, this._populateTransaction, contractClass, functionName, ...args) as Promise<ethers.ethers.PopulatedTransaction>
    }
    return this._populateTransaction(contractClass, functionName, ...args)

  }

  async _populateTransaction(contractClass: any, functionName: string, ...args: any[]) {
    return contractClass.contract.populateTransaction[functionName](...args)
  }

  async sendTx(
    txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
    log: string,
    transactionInfo: TransactionInfo
  ) {
    if (!txu) {
      console.error(txu)
    }
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(
        this,
        this._sendTx,
        txu,
        log,
        transactionInfo
      ) as Promise<TransactionItem>
    } else {
      return this._sendTx(txu, log, transactionInfo)
    }
  }

  async _sendTx(
    txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
    log: string,
    transactionInfo: TransactionInfo
  ) {
    const transactionItem = {
      txu,
      log,
      transactionInfo
    } as TransactionItem
    this.transactionList.push(transactionItem)
    try {
      transactionItem.txu.gasPrice = await this.signer.getGasPrice()
      transactionItem.txu.nonce = await this.getNonce()
      transactionItem.txu.gasLimit = (await this.signer.estimateGas(txu)).mul(150).div(100)
      console.log(transactionItem.txu)
      transactionItem.tx = await this.signer.sendTransaction(txu)
      transactionItem.result = await transactionItem.tx.wait()
      /*
      console.log("Success => " +
        log +
        ":" +
        transactionItem.txu.nonce +
        ' ' +
        transactionItem.result.gasUsed.toNumber() +
        ' ' +
        (Math.round(transactionItem.result.gasUsed.mul(10000).div(transactionItem.txu.gasLimit).toNumber()) / 100) +
        '% ' +
        ethers.utils.formatEther(transactionItem.txu.gasPrice.mul(transactionItem.result.gasUsed)))
      */
      console.log(TransactionInfoType[transactionInfo.transactionType], transactionInfo.contractName, transactionInfo.functionName, transactionInfo.args)
      if (this.replayScript) this.replayScript.addItem(transactionItem)
      return transactionItem
    } catch (e: any) {
      console.error(TransactionInfoType[transactionInfo.transactionType], transactionInfo.contractName, transactionInfo.functionName, transactionInfo.args, getErrorMessage(e))
      this.nextNonce = -1
      transactionItem.error = getErrorMessage(e)
      if (this.replayScript) this.replayScript.addItemError(transactionItem)
      throw new Error(log + ' : ' + transactionItem.error)
    }

  }

  async callView(fnToCall: any, ...args: any[]) {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callFunction(fnToCall, ...args) as Promise<any>
    } else {
      return fnToCall(...args)
    }
  }

  async sendContractTx(
    txu: ethers.providers.TransactionRequest,
    getContract: (
      contractAddress: string,
      signer: ethers.Signer,
    ) => ethers.Contract,
    log: string,
    contractName: string,
    args: any[],
  ) {
    const result = await this.sendTx(txu, log, {
      transactionType: TransactionInfoType.CreateContract,
      contractName: contractName,
      args
    })
    if (result.result) {
      const contract = getContract(result.result.contractAddress, this.signer)
      return contract
    }
    throw Error("contract error")
  }

  gasInfo(
    transactionItem: TransactionItem
  ) {
    return {
      transactionHash: transactionItem.result ?.transactionHash,
      log: transactionItem.log,
      gasUsed: transactionItem.result ?.gasUsed.toNumber(),
      gasLimit: transactionItem.tx ?.gasLimit.toNumber(),
      gasPrice: transactionItem.tx ?.gasPrice && transactionItem.tx ?.gasPrice.toNumber(),
    }
  }

  log(
    transactionItem: TransactionItem
  ) {
    return transactionItem.log
  }

  async getAddress() {
    return await this.signer.getAddress()
  }
}
