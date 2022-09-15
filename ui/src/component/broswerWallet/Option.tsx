import DivNice from '../divNice'
import WalletAddWidget from '../wallet/walletAddWidget'
import WalletDelete from '../wallet/walletDelete'

const Option = () => {
  return (
  <>
    <DivNice title='Add wallet'>
      <WalletAddWidget/>
    </DivNice>
    <DivNice title='Delete wallet'>
      <WalletDelete/>
    </DivNice>
  </>)
}

export default Option
