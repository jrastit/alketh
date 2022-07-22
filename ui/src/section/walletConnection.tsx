import Button from 'react-bootstrap/Button'
import BoxWidget from '../component/boxWidget'
import SpaceWidget from '../component/spaceWidget'
import NetworkInfoWidget from '../component/wallet/networkInfoWidget'
import WalletInfoWidget from '../component/wallet/walletInfoWidget'
import NetworkSelectWidget from '../component/wallet/networkSelectWidget'
import NetworkSwitchWidget from '../component/wallet/networkSwitchWidget'
import WalletSelectWidget from '../component/wallet/walletSelectWidget'
import CardWidget from '../game/component/cardWidget'
import { TransactionManager } from '../util/TransactionManager'
import DivNice from '../component/divNice'

import WalletPassword from '../component/wallet/walletPassword'
import StepMessageNiceWidget from '../component/stepMessageNiceWidget'
import {
  walletStorageSetType,
  walletStorageClearPassword,
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

  const setWalletType = (type?: string) => {
    walletStorageSetType(type)
    dispatch(updateStep({ id: StepId.Wallet, step: Step.Init }))
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
        <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
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
          <DivNice title='Alchethmy'>
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
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <DivNice title='Broswer wallet setup'>
                <WalletSelectWidget
                  setSection={props.setSection}
                  isOk={false}
                />
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
            <WalletSelectWidget
              setSection={props.setSection}
              isOk={isStep(StepId.Wallet, Step.Ok, step)}
            />
            </DivNice>
            <DivNice title='Wallet info'>

            <WalletInfoWidget
              wallet={wallet}
              network={network}
            />
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
            {renderDisconnect()}
            {renderHome()}
            </DivNice>
            </>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <>
            <SpaceWidget>
              <BoxWidget title="Select network">
                <NetworkSelectWidget />
              </BoxWidget>
            </SpaceWidget>
            <SpaceWidget>
              <BoxWidget title='Broswer wallet Error'>
                <p>Is the network connected?</p>
                <p>Cannot reach {network?.url}</p>
                <p>Click ok to re-test</p>
                <StepMessageNiceWidget
                  title='Wallet'
                  step={getStep(StepId.Wallet, step)}
                  resetStep={() => { dispatch(clearError(StepId.Wallet)) }}
                /
                >
              </BoxWidget>
            </SpaceWidget>
            <SpaceWidget>
            <BoxWidget>
              {renderHome()}
            </BoxWidget>
            </SpaceWidget>
            </>
          )
        }
        return (
          <BoxWidget title='Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
          </BoxWidget>
        )
      case 'Metamask':
      case 'WalletConnect':
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask'>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect wallet</Button>
                {renderHome()}
              </BoxWidget>
            </SpaceWidget>
          )
        }
        if (isStep(StepId.Wallet, Step.Ok, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask'>
              <NetworkSwitchWidget/>
              { network &&
                <NetworkInfoWidget
                  network={network}
                />
              }
              { wallet &&
                <WalletInfoWidget
                  wallet={wallet}
                  network={network}
                />
              }
                <Button onClick={() => props.setSection('game')}>Ok</Button>
              </BoxWidget>
              <BoxWidget>
                {renderHome()}
              </BoxWidget>
            </SpaceWidget>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <>
            <SpaceWidget>
              <BoxWidget title='Metamask Error'>
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

              </BoxWidget>
            </SpaceWidget>
            <SpaceWidget>
            <BoxWidget>
              {renderHome()}
            </BoxWidget>
            </SpaceWidget>
            </>
          )
        }
        return (
          <BoxWidget title='Metamask Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
            {renderHome()}
          </BoxWidget>
        )
      default:
        return (
          <SpaceWidget>
            <BoxWidget title='Error wallet type'>
              <p>Unkonw type : {wallet.type}</p>
              {renderHome()}
            </BoxWidget>
          </SpaceWidget>
        )
    }
  }
  return render()
}

export default WalletConnection
