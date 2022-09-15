import DivNice from '../divNice'
import Button from 'react-bootstrap/Button'
import SpaceWidget from '../spaceWidget'

const OptionButton = (props : {
  displayOption : boolean
  setDisplayOption : (displayOption : boolean) => void
}) => {
  return (<>
  <SpaceWidget>
    <Button variant="primary" onClick={() => {
      props.setDisplayOption(!props.displayOption)
    }}>{props.displayOption ? "Back" : "Option"}</Button>
  </SpaceWidget>
  </>)
}

export default OptionButton
