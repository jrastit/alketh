import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import WalletWidget from './component/walletWidget'
import BalanceWidget from './component/wallet/balanceWidget'
import UserWidget from './game/component/userWidget'

import { useAppSelector } from './hooks'

import { getStep, StepId } from './reducer/contractSlice'

const AppNav = (props: {
  section: string | undefined,
  setSection: (section : string) => void,
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const gameId = useAppSelector((state) => state.gameSlice.gameId)
  const network = useAppSelector((state) => state.walletSlice.network)
  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const displayAdmin = useAppSelector((state) => state.configSlice.displayAdmin)

  return (
    <Navbar
      fixed="top"
      variant="dark"
      style={{ backgroundColor:'#000000B0'}}
      collapseOnSelect
      expand="lg"
      >
    <Container fluid>
      <Navbar.Brand onClick={() => props.setSection('wallet')}>Alketh {displayAdmin && network?.name && <> on {network?.name}</>}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link onClick={() => props.setSection('wallet')}>Wallet</Nav.Link>
          <Nav.Link eventKey="1" onClick={() => props.setSection('game')}>Game</Nav.Link>
          { !!user &&
            <>
            <Nav.Link eventKey="1" onClick={() => props.setSection('userCard')}>My cards</Nav.Link>
            <Nav.Link eventKey="1" onClick={() => props.setSection('userDeck')}>My decks</Nav.Link>
            <Nav.Link eventKey="1" onClick={() => props.setSection('NFT')}>My NFTs</Nav.Link>
            </>

          }
          <Nav.Link eventKey="1" onClick={() => props.setSection('card')}>All cards</Nav.Link>
          { (displayAdmin) &&
            <>
            <Nav.Link eventKey="1" onClick={() => props.setSection('editCard')}>Edit cards</Nav.Link>
            <Nav.Link eventKey="1" onClick={() => props.setSection('admin')}>Admin</Nav.Link>
            <Nav.Link eventKey="1" onClick={() => props.setSection('user')}>User</Nav.Link>
            </>
          }
        </Nav>
        <Nav className="mr-auto">
        </Nav>
      </Navbar.Collapse>
      <Navbar.Brand>
        { displayAdmin &&
          <UserWidget gameId={gameId} user={user}/>
        }
        <WalletWidget address={wallet.address} error={getStep(StepId.Wallet, step).error} />
        <BalanceWidget />
      </Navbar.Brand>
      <Navbar.Brand>
      </Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export default AppNav
