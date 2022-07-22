import Button from 'react-bootstrap/Button'
import WalletDeleteAll from '../component/wallet/walletDeleteAll'
import DivNice from '../component/divNice'


import { useAppSelector, useAppDispatch } from '../hooks'

import { setDisplayAdmin } from '../reducer/configSlice'

const OptionConnection = (props: {
  setDisplayConfig: (arg : boolean) => void
}) => {

  const dispatch = useAppDispatch()

  const displayAdmin = useAppSelector((state) => state.configSlice.displayAdmin)

  const render = () => {

    return (
      <>
      <DivNice title='Broswer Wallet'>
        <WalletDeleteAll />
      </DivNice>
      <DivNice title='Admin display'>
        <Button variant="warning" onClick={() => dispatch(setDisplayAdmin(!displayAdmin))}>{displayAdmin ? 'On' : 'Off'}</Button>
      </DivNice>
      <DivNice>
        <Button variant="warning" onClick={() => props.setDisplayConfig(false)}>Home</Button>
      </DivNice>
      </>
    )

  }
  return render()
}

export default OptionConnection
