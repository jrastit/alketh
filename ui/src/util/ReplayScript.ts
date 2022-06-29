import { BigNumber } from 'ethers'
import { TransactionItem, TransactionInfoType, TransactionInfo } from './TransactionManager'

function addslashes(str: string | undefined) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

export class ReplayScript {
  contractMap = new Map<string, string>()
  transactionList = [] as (TransactionInfo | { contractVar: string })[]
  script = [] as string[]
  contractId = 0
  gameId = 0
  nextPlayGameVar = undefined as string | undefined

  argToString(arg: any): any {
    if (Array.isArray(arg)) {
      const argArray = arg as any[]
      return "[" + argArray.map(_arg => { return this.argToString(_arg) }) + "]"
    }
    if ((arg instanceof BigNumber)) {
      return "\"" + arg + "\""
    }
    if ((typeof arg === 'string')) {
      if (this.contractMap.has(arg)) {
        return this.contractMap.get(arg) + '.address'
      }
      return "\"" + addslashes(arg) + "\""
    }
    return arg
  }

  addItemError(transactionItem: TransactionItem) {
    this.addItem(transactionItem)
    const result = "const { ethers } = require(\"hardhat\")\n\n" +
      "describe(\"test\", function () {\n" +
      "\tit(\"test\", async function () {\n" +
      this.script.map(str => { return "\t\t" + str + "\n" }).join("") +
      "\t})\n" +
      "})"
    console.log(result)
  }

  addItem(transactionItem: TransactionItem) {
    if (transactionItem.transactionInfo) {
      if (transactionItem.transactionInfo.transactionType === TransactionInfoType.CreateContract) {
        const contractVar = "contract" + (++this.contractId)
        const newTransaction = {
          ...transactionItem.transactionInfo,
          contractVar,
        }
        this.transactionList.push(newTransaction)
        if (transactionItem.result) {
          const address = transactionItem.result.contractAddress
          this.contractMap.set(address, contractVar)
        }
        this.script.push("const _" + contractVar + "Factory = await ethers.getContractFactory(\"" + newTransaction.contractName + "\")")
        this.script.push("const " + contractVar + " = await _" + contractVar + "Factory.deploy(")
        transactionItem.transactionInfo.args.forEach((arg: any) => {
          this.script.push("\t" + this.argToString(arg) + ",")
        });
        this.script.push(")")
        this.script.push("await " + contractVar + ".deployed()")
      } else if (transactionItem.transactionInfo.transactionType === TransactionInfoType.ModifyContract) {
        if (transactionItem.transactionInfo.contractAddress) {
          let contractVar
          if (transactionItem.transactionInfo.contractName === "PlayGame") {
            contractVar = this.nextPlayGameVar
          } else {
            contractVar = this.contractMap.get(transactionItem.transactionInfo.contractAddress)
          }
          const newTransaction = {
            ...transactionItem.transactionInfo,
            contractVar,
          }
          this.transactionList.push(newTransaction)
          if (newTransaction.functionName === "createGameBotSelf" && transactionItem.result) {
            const gameVar = "game" + (this.gameId++)
            this.script.push("const " + gameVar + " = await " + contractVar + "." + transactionItem.transactionInfo.functionName + '(')
            transactionItem.transactionInfo.args.forEach((arg: any) => {
              this.script.push("\t" + this.argToString(arg) + ",")
            });
            this.script.push(")")
            this.script.push("let " + gameVar + "Id = 0")
            this.script.push(gameVar + ".logs.forEach((_log) => {")
            this.script.push("\tconst log = " + contractVar + ".interface.parseLog(_log)")
            this.script.push("\tif (log.name === 'GameCreateBot') {")
            this.script.push("\t\t" + gameVar + "Id = log.args.id.toNumber()")
            this.script.push("\t}")
            this.script.push("})")
            this.script.push("const " + gameVar + "Address = (await " + contractVar + ".gameList(" + gameVar + "Id)).playGame")
            const contractVar2 = "contract" + (++this.contractId)
            this.script.push("const " + contractVar2 + " = await ethers.getContractAt(\"PlayGame\", " + gameVar + "Address)")
            this.nextPlayGameVar = contractVar2
          } else {
            this.script.push("await " + contractVar + "." + transactionItem.transactionInfo.functionName + '(')
            transactionItem.transactionInfo.args.forEach((arg: any) => {
              this.script.push("\t" + this.argToString(arg) + ",")
            });
            this.script.push(")")
          }
        }
        this.script.push(
          "console.log(\"" +
          addslashes(transactionItem.transactionInfo.contractName) +
          "\", \"" +
          addslashes(transactionItem.transactionInfo.functionName) +
          "\")")
      }
    }
  }
}
