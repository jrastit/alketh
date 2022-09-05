import { ContractHandlerType } from '../type/contractType'
import AdminContract from '../section/adminContract'
import DisplayUserDeck from '../section/displayUserDeck'
import DisplayUserCard from '../section/displayUserCard'
import DisplayNFT from '../section/displayNFT'
import DisplayCard from '../section/displayCard'
import EditCard from '../section/editCard'
import UserSection from '../section/userSection'
import ContractLoader from '../loader/contractLoader'
import PlayGame from './playGame'
import FindGame from './findGame'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

import {
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

const AdminSection = (props: {
  section : string | undefined,
  contractHandler : ContractHandlerType,
})=> {

  const step = useAppSelector((state) => state.contractSlice.step)

  const displayAdmin = () => {
    return (
      <Row>
        <Col>
          <AdminContract
            contractHandler={props.contractHandler}
          />
        </Col>
      </Row>
    )

  }

  const displayGame = () => {
    if (isStep(StepId.Game, Step.Init, step) || isStep(StepId.Game, Step.NotSet, step)){
      return (
        <FindGame
        contractHandler={props.contractHandler}
        />
      )
    }else{
        return (
          <PlayGame
          contractHandler={props.contractHandler}
          />
        )
    }

  }

  const render = () => {
    switch (props.section){
      case 'user':
      return <UserSection/>
      case 'admin':
      return displayAdmin()
      case 'editCard':
      return (
        <EditCard/>
      )
      case 'card':
      return (
        <DisplayCard
        contractHandler={props.contractHandler}
        />
      )
      case 'userCard':
        return (<DisplayUserCard
            contractHandler={props.contractHandler}
          />)
      case 'NFT':
        return (<DisplayNFT
            contractHandler={props.contractHandler}
        />)
      case 'userDeck':
        return (<DisplayUserDeck
          contractHandler={props.contractHandler}
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
          contractHandler={props.contractHandler}
        />
      </Col>
    </Row>
    {render()}
    </>
  )

}


export default AdminSection
