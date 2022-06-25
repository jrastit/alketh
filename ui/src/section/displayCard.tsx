import { BigNumber } from 'ethers'
import { useState } from 'react'
import CardListWidget from '../game/component/cardListWidget'
import { ContractHandlerType } from '../type/contractType'

import { buyNewCard } from '../game/card'
import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  Step,
  StepId,
} from '../reducer/contractSlice'

import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'


const DisplayCard = (props: {
  contractHandler : ContractHandlerType,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const user = useAppSelector((state) => state.userSlice.user)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const _buyNewCard = (cardId: number, value: BigNumber) => {
      setLoading(true)
      buyNewCard(props.contractHandler, cardId, value).then(() => {
        setLoading(false)
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
      }).catch((err) => {
        setLoading(false)
        setError(err.toString())
      })
  }

  if (cardList) {
    return (
      <div>
        {error &&
          <>
            <Alert variant='danger'>{error}</Alert>
            <Button onClick={() => { setError(undefined) }}>Ok</Button>
          </>
        }
        {loading &&
          <p>Loading...</p>
        }
        {!loading && !error &&
          <CardListWidget
            buyNewCard={_buyNewCard}
            cardList={cardList}
            userId={user?.id}
            tokenName={network?.tokenName}
          />
        }

      </div>
    )
  }

  return (<></>)
}

export default DisplayCard
