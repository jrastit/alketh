import { ContractHandlerType } from '../type/contractType'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import {
  getLevel,
} from '../game/card'

import {
  nftCreateCard,
} from '../game/reducer/nft'

import type {
  UserCardType,
} from '../type/userType'


import { useAppSelector, useAppDispatch } from '../hooks'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import DivFullNice from '../component/divFullNice'
import Container from 'react-bootstrap/Container'

const DisplayUserCard = (props: {
  contractHandler : ContractHandlerType,
}) => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  const [createNFT, setCreateNFT] = useState<number>()
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const userCardListToSplit = userCardList ? userCardList.concat([]).filter((userCard) => {
    return !userCard.sold && !userCard.nftId
  }).sort((card1, card2) => {
    return card2.exp - card1.exp
  }) : []

  const userCardListBash = [] as UserCardType[][]
  for (let i = 0; i < userCardListToSplit.length; i = i + 6) {
    userCardListBash.push(userCardListToSplit.slice(i, i + 6))
  }

  const _createNFT = (userCard: UserCardType) => {
    if (createNFT) {
      setLoading(true)
      nftCreateCard(
        dispatch,
        props.contractHandler,
        userCard,
      ).then(() => {
        setCreateNFT(undefined)
        setLoading(false)
      }
      ).catch((err) => {
        setCreateNFT(0)
        setLoading(false)
        setError(err.toString())
      })
    } else {
      setError("Sell card not set")
    }

  }

  const renderCreateNFT = (userCardListItem: UserCardType[]) => {
    if (createNFT) {
      const userCard = userCardListItem.filter((userCard) => userCard.id === createNFT)[0]
      if (userCard) {
        const card = cardList.filter(card => card.id === userCard.cardId)[0]
        const level = getLevel(userCard.exp)
        return (
          <>
            <div>
              Creating NFT for {card.name} level {level + 1} ({userCard.exp})
            </div>
            <Button onClick={() => { _createNFT(userCard) }}>Create NFT</Button>
          </>
        )
      }
    }
  }

  const renderRow = () => {
    if (userCardList){
      return (
        <Row>
          <Col style={{fontSize : '.9em'}}>
            <UserCardListWidget
              userCardList={userCardList.concat([]).sort((card1, card2) => {return card1.exp > card2.exp ? -1 : 1})}
              nftCard={(userCard : UserCardType) => {setCreateNFT(userCard.id)}}
            />
          </Col>
        </Row>
      )
    }
  }


  return (
    <Container>
      <Row>
      <Col>
        <DivFullNice>
          {error &&
            <>
              <Alert variant='danger'>{error}</Alert>
              <Button onClick={() => { setError(undefined) }}>Ok</Button>
            </>
          }
          {!loading && !error && userCardList &&
            <>
              {!!createNFT &&
                renderCreateNFT(userCardList)
              }
            </>
          }
          {loading &&
            <p>Loading...</p>
          }
        </DivFullNice>
      </Col>
      </Row>
      {renderRow()}
    </Container>
  )

}

export default DisplayUserCard
