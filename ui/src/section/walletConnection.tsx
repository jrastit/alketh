import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import SpaceWidget from '../component/spaceWidget'
import NetworkInfoWidget from '../component/wallet/networkInfoWidget'
import WalletInfoWidget from '../component/wallet/walletInfoWidget'
import NetworkSelectWidget from '../component/wallet/networkSelectWidget'
import NetworkSwitchWidget from '../component/wallet/networkSwitchWidget'
import WalletSelectWidget from '../component/wallet/walletSelectWidget'
import WalletDelete from '../component/wallet/walletDelete'
import WalletAddWidget from '../component/wallet/walletAddWidget'
import CardWidget from '../game/component/cardWidget'
import { TransactionManager } from '../util/TransactionManager'
import DivNice from '../component/divNice'

import WalletPassword from '../component/wallet/walletPassword'
import StepMessageNiceWidget from '../component/stepMessageNiceWidget'
import {
  walletStorageSetType,
  walletStorageClearPassword,
  walletStorageSetNetworkId,
} from '../util/walletStorage'

import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from "@web3-react/injected-connector";

import {
  Step,
  StepId,
  isStep,
  updateStep,
  getStep,
  clearError,
} from '../reducer/contractSlice'

import {
  clearPassword
} from '../reducer/walletSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const Injected = new InjectedConnector({
 //supportedChainIds: [1, 3, 4, 5, 42]
});

const WalletConnection = (props: {
  transactionManager: TransactionManager | undefined
  setSection: (section: string) => void
  setDisplayConfig: (arg : boolean) => void
}) => {

  const { activate } = useWeb3React();

  const dispatch = useAppDispatch()

  const step = useAppSelector((state) => state.contractSlice.step)

  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const network = useAppSelector((state) => state.walletSlice.network)
  const displayAdmin = useAppSelector((state) => state.configSlice.displayAdmin)

  const [ displayOption, setDisplayOption ] = useState<boolean>(false)

  const setWalletType = (type?: string) => {
    walletStorageSetType(type)
    dispatch(updateStep({ id: StepId.Wallet, step: Step.Init }))
  }

  const renderOption = () => {
    return (
      <SpaceWidget>
        <Button variant="primary" onClick={() => {
          setDisplayOption(!displayOption)
        }}>{displayOption ? "Back" : "Option"}</Button>
      </SpaceWidget>
    )
  }

  const renderDisconnect = () => {
    return (
      <SpaceWidget>
        <Button variant="warning" onClick={() => {
          walletStorageClearPassword()
          dispatch(clearPassword())
          dispatch(updateStep({ id: StepId.Wallet, step: Step.Init }))
        }}>Disconnect</Button>
      </SpaceWidget>
    )
  }

  const renderHome = () => {
    return (
      <SpaceWidget>
        <Button variant="primary" onClick={() => setWalletType()}>Home</Button>
      </SpaceWidget>
    )
  }

  const render = () => {

    if (isStep(StepId.Wallet, Step.Loading, step)) {
      return (
        <>
          <SpaceWidget>
          </SpaceWidget>
          <DivNice>
            <p>Loading wallet ...</p>
            <Button variant="danger" onClick={() => {
              walletStorageSetNetworkId(undefined)
              window.location.reload()
            }}>Cancel</Button>
          </DivNice>
        </>
      )
    }
    if (isStep(StepId.Wallet, Step.NotSet, step)) {
      return (
        <>
          <SpaceWidget>
          </SpaceWidget>
          <div style={{ fontSize: '14px' }}>
            <CardWidget
              family={1}
              name={'Hacker'}
              mana={1}
              level={0}
              attack={10}
              life={10}
              speed={1}
              description={'Connecting...'}
              exp={0}
            />
          </div>
          <DivNice title='Alketh'>
            <p>A blockchain card game!</p>
            <p>Chose your wallet to connect and start playing.</p>
          </DivNice>

          <DivNice title='Broswer Wallet'>
            <p>Use your internet broswer cache to keep your wallet</p>
            <Button onClick={() => setWalletType('Broswer')}>
              Enter with broswer wallet
            </Button>
          </DivNice>

          <DivNice title='Metamask Wallet'>
            <p>Use wallet and network configured within Metamask</p>
            <p><a href='https://metamask.io/' target='_blank' rel="noreferrer">get Metamask here</a></p>
            <SpaceWidget>
              <Button onClick={() => {
                 activate(Injected).then(() => {setWalletType('Metamask')})
              }}>
                Enter with Metamask
              </Button>
            </SpaceWidget>
          </DivNice>

          <DivNice title='Options'>
            <Button onClick={() => props.setDisplayConfig(true)}>
              Advanced option
            </Button>
          </DivNice>
        </>
      )
    }
    switch (wallet.type) {
      case 'Broswer':
        if (isStep(StepId.Wallet, Step.Init, step)) {
          return (
            <DivNice title='Broswer wallet'>
                <p>Loading...</p>
            </DivNice>
          )
        }
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <DivNice title='Broswer wallet create'>
                <WalletAddWidget/>
              {renderDisconnect()}
              {renderHome()}
            </DivNice>
          )
        }
        if (isStep(StepId.Wallet, Step.NoPassword, step)) {
          return (
            <DivNice title='Broswer wallet setup'>
                <p>Use your internet broswer cache to keep your wallet</p>
                <SpaceWidget>
                  <WalletPassword />
                </SpaceWidget>
                {renderHome()}
            </DivNice>
          )
        }
        if (isStep(StepId.Wallet, Step.Ok, step) || isStep(StepId.Wallet, Step.NoNetwork, step) || isStep(StepId.Wallet, Step.NoBalance, step)) {
          if (displayOption){
            return (
              <>
              <DivNice title='Add wallet'>
              <WalletAddWidget/>
              </DivNice>
              <DivNice title='Delete wallet'>
              <WalletDelete/>
              </DivNice>
              <DivNice>
              {renderOption()}
              </DivNice>
              </>
            )
          }
          return (
            <>
            <DivNice title='Select network'>
                <NetworkSelectWidget />
                {!!network && displayAdmin &&
                  <NetworkInfoWidget
                    network={network}
                  />
                }
            </DivNice>
            <DivNice title='Select wallet'>
            <WalletSelectWidget/>
            </DivNice>

            <DivNice title='Wallet info'>

            <WalletInfoWidget
              wallet={wallet}
              network={network}
            />
            </DivNice>
            { (!wallet.balance || (network && network.faucet)) &&
              <DivNice>
              { !wallet.balance &&
                <p>Wallet balance is empty, add some tokens!</p>
              }
              { network && network.faucet &&
                <>
                <p>Get more Test token with {network.name} faucet at:</p>
                <p><a href={network.faucet} target="_blank" rel="noreferrer">{network.faucet}</a></p>
                </>
              }
              </DivNice>
            }
            {isStep(StepId.Wallet, Step.Ok, step) &&
              <DivNice>
              <Button onClick={() => props.setSection('game')}>Start game</Button>
              </DivNice>
            }
            <DivNice>
            {renderOption()}
            {renderDisconnect()}
            {renderHome()}
            </DivNice>
            </>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <>
            <DivNice title='Select network'>
                <NetworkSelectWidget />
                {!!network && displayAdmin &&
                  <NetworkInfoWidget
                    network={network}
                  />
                }
            </DivNice>
            <DivNice title='Network Error'>
                <p>Is the network connected?</p>
                <p>Cannot reach {network?.url}</p>
                <p>Click ok to re-test</p>
                <StepMessageNiceWidget
                  title='Wallet'
                  step={getStep(StepId.Wallet, step)}
                  resetStep={() => { dispatch(clearError(StepId.Wallet)) }}
                /
                >
            </DivNice>
            <DivNice>
            {renderOption()}
            {renderHome()}
            </DivNice>
            </>
          )
        }
        return (
          <DivNice title='Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
          </DivNice>
        )
      case 'Metamask':
      case 'WalletConnect':
      if (isStep(StepId.Wallet, Step.Init, step)) {
        return (
          <DivNice title='Metamask'>
              <p>Loading...</p>
          </DivNice>
        )
      }
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <DivNice title='Metamask'>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect wallet</Button>
                {renderHome()}
            </DivNice>
          )
        }
        if (isStep(StepId.Wallet, Step.Ok, step)) {
          return (
            <>
            <DivNice title='Network'>
              <NetworkSwitchWidget/>
              { network &&
                <NetworkInfoWidget
                  network={network}
                />
              }
            </DivNice>
            <DivNice title='Metamask Wallet'>
              { wallet &&
                <WalletInfoWidget
                  wallet={wallet}
                  network={network}
                />
              }
              </DivNice>
              { !wallet.balance &&
                <DivNice>
                <p>Wallet balance is empty, add some tokens!</p>
                </DivNice>
              }
              {isStep(StepId.Wallet, Step.Ok, step) &&
                <DivNice>
                <Button onClick={() => props.setSection('game')}>Start game</Button>
                </DivNice>
              }
              <DivNice>
                {renderHome()}
              </DivNice>
              </>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <>
              <DivNice title='Metamask Error'>
                <p>Is your metamask connected?</p>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect metamask</Button>
                <p>When connected, click ok to re-test</p>
                <StepMessageNiceWidget
                  title='Wallet'
                  step={getStep(StepId.Wallet, step)}
                  resetStep={() => { dispatch(clearError(StepId.Wallet)) }}
                /
                >

              </DivNice>
              <DivNice>
              {renderHome()}
              </DivNice>
            </>
          )
        }
        return (
          <DivNice title='Metamask Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
            {renderHome()}
          </DivNice>
        )
      default:
        return (
            <DivNice title='Error wallet type'>
              <p>Unkonw type : {wallet.type}</p>
              {renderHome()}
            </DivNice>
        )
    }
  }
  return render()
}

export default WalletConnection
