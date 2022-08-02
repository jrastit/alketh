import ContractWidget from '../game/component/contractWidget'
import SpaceWidget from '../component/spaceWidget'
import DivNice from '../component/divNice'
import StepMessageWidget from '../component/stepMessageWidget'
import { ContractHandlerType } from '../type/contractType'

import Button from 'react-bootstrap/Button'

import {
  clearState,
  fillContract,
  updateAlkethContractHash,
  updateContract,
} from '../game/reducer/contract'

import {
  clearError,
  getStep,
  StepId,
  Step,
  isStep,
  resetAllStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const AdminContract = (props : {
  contractHandler : ContractHandlerType,
}) => {
  const stepId = StepId.Contract
  const step = useAppSelector((state) => state.contractSlice.step)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const _updateContract = () => {
    if (network){
      updateContract(
        dispatch,
        network,
        props.contractHandler,
      )
    }
  }

  return (
      <DivNice title="Contract">
      <SpaceWidget>
        <ContractWidget contractHandler={props.contractHandler}/>
      </SpaceWidget>
      <StepMessageWidget
        step = {getStep(stepId, step)}
        resetStep = {() => {dispatch(clearError(stepId))}}
      />
      { (
        isStep(stepId, Step.NoAddress, step) ||
        isStep(stepId, Step.NotFound, step) ||
        isStep(stepId, Step.NotSet, step) ||
        isStep(stepId, Step.Ok, step) ||
        isStep(stepId, Step.Error, step)
      ) &&
        <SpaceWidget>
        <SpaceWidget>
        <Button variant="warning" onClick={() => {_updateContract()}}>
          Create or Update contract
        </Button>
        </SpaceWidget>
        { network?.gameContract &&
          <SpaceWidget>
          <Button variant="warning" onClick={() => {updateAlkethContractHash(
            dispatch,
            props.contractHandler
          )}}>
            Update Alketh Hash
          </Button>
          </SpaceWidget>
        }

        </SpaceWidget>
      }
      { isStep(stepId, Step.Empty, step) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {fillContract(
          dispatch,
          props.contractHandler,
        )}}>
          Fill new game contract on {network?.name}
        </Button>
        </SpaceWidget>
      }
      <SpaceWidget>
      <Button variant="warning" onClick={() => {
        clearState(dispatch)
        dispatch(resetAllStep())
      }}>
        Reload all
      </Button>
      </SpaceWidget>
    </DivNice>
  )
}

export default AdminContract
