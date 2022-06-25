import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import AdminContract from '../section/adminContract'
import DisplayUserDeck from '../section/displayUserDeck'
import DisplayUserCard from '../section/displayUserCard'
import DisplayNFT from '../section/displayNFT'
import DisplayCard from '../section/displayCard'
import EditCard from '../section/editCard'
import ContractLoader from '../loader/contractLoader'
import PlayGame from './playGame'
import FindGame from './findGame'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

import { ContractHandlerType, newContractHandler } from '../type/contractType'

import {
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

const AdminSection = (props: {
  section : string | undefined,
  transactionManager : TransactionManager,
})=> {
  const [contractHandler, _setContractHandler] = useState<ContractHandlerType>(
    newContractHandler(props.transactionManager)
  )
  const step = useAppSelector((state) => state.contractSlice.step)

  const displayAdmin = () => {
    return (
      <Row>
        <Col>
          <AdminContract
            contractHandler={contractHandler}
          />
        </Col>
      </Row>
    )

  }

  const displayGame = () => {
    if (isStep(StepId.Game, Step.Init, step) || isStep(StepId.Game, Step.NotSet, step)){
      return (
        <FindGame
        contractHandler={contractHandler}
        />
      )
    }else{
        return (
          <PlayGame
          contractHandler={contractHandler}
          />
        )
    }

  }

  const render = () => {
    switch (props.section){
      case 'admin':
      return displayAdmin()
      case 'editCard':
      return (
        <EditCard/>
      )
      case 'card':
      return (
        <DisplayCard
        contractHandler={contractHandler}
        />
      )
      case 'userCard':
        return (<DisplayUserCard
            contractHandler={contractHandler}
          />)
      case 'NFT':
        return (<DisplayNFT
            contractHandler={contractHandler}
        />)
      case 'userDeck':
        return (<DisplayUserDeck
          contractHandler={contractHandler}
          />)
      default :
      return displayGame()
    }
  }

  return (
    <>
    <Row>
      <Col>
        <ContractLoader
          contractHandler={contractHandler}
        />
      </Col>
    </Row>
    {render()}
    </>
  )

}


export default AdminSection
