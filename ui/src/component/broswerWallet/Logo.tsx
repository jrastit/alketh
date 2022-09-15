import CardWidget from '../../game/component/cardWidget'

const Logo = () => {
  return (
  <div style={{ fontSize: '14px' }}>
    <CardWidget
      family={1}
      name={'Hacker'}
      mana={1}
      level={0}
      attack={10}
      life={10}
      speed={1}
      description={'Connecting...'}
      exp={0}
    />
  </div>
  )
}

export default Logo
