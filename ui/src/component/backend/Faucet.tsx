import Button from 'react-bootstrap/Button'

import { useAppSelector, useAppDispatch } from '../../hooks'

import { faucet } from '../../reducer/backend/faucetSlice'

const Faucet = (props : {
  address : string
}) => {

  const dispatch = useAppDispatch()

  const network = useAppSelector((state) => state.walletSlice.network)

  return (
    <Button onClick={() => {
      if (network){
        dispatch(faucet({address : props.address, networkName : network.name}))
      }
    }}>Faucet</Button>
  )
}

export default Faucet
