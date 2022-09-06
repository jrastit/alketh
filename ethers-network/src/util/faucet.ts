import * as ethers from 'ethers'

import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'

export const getProvider = (networkName: string) => {
  if (networkName.match(/^[0-9a-z]+$/)) {
    const network: NetworkType = networkList.filter((network) => network.name === networkName)[0]
    if (network && network.url) {
      return new ethers.providers.StaticJsonRpcProvider(network.url, network.chainId)
    }
  }
  throw new Error('Provider not found for network' + networkName)
}

export const getWallet = (networkName: string, privateKeys: any) => {
  const provider = getProvider(networkName)
  if (provider) {
    console.log(__dirname)

    const walletList = privateKeys.map((pk: string): ethers.Signer => {
      return new ethers.Wallet(pk, provider)
    })
    return walletList[0]
  }
  throw new Error('Wallet not found for network' + networkName)
}

export const faucet = async (address: string, networkName: string, privateKeys: any) => {

  const wallet = getWallet(networkName, privateKeys)
  const ret = await wallet.sendTransaction({
    to: address,
    value: ethers.utils.parseEther('1')
  })
  //console.log(ret)
  await ret.wait()
}
