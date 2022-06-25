type CardActionType = {
  description: string
}

type CardLevelType = {
  description: string
  life: number
  attack: number
  speed: number
  action: Array<CardActionType>
}

type CardType = {
  id: number
  name: string
  mana: number
  family: number
  level: Array<CardLevelType>
  starter: number
}

export type { CardType, CardLevelType }
