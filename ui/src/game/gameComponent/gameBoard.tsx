import { ContractHandlerType } from '../../type/contractType'
import { useEffect, useState, useRef, ReactElement } from 'react'
import {
  GameType,
  GameCardType,
  TurnDataType,
  GameActionType,
  GameActionListType,
  GameActionPayloadType,
  ActionType,
} from '../../type/gameType'
import { UserType } from '../../type/userType'

import GameTimer from './gameTimer'
import GameCardWidget from './gameCardWidget'
import DropHelper from '../../component/dropHelper'
import PlaceHelper, { PlaceRefType } from '../../component/placeHelper'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from '../../component/buttonNice'

import {
  playAction,
} from '../../game/playGame'

import {
  endTurnData,
  getTurnData,
  checkTurnData,
} from '../../game/turnData'

import {
  playRandomly,
} from '../../game/gameBot'

import {
  addPlayAction,
} from '../../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  StepId,
  setError,
} from '../../reducer/contractSlice'

import {
  endTurn,
  endGameByTime,
} from '../../game/game'


enum Play {
  Init,
  MyTurn,
  EndTurn,
  Replay,
  Playing,
  Ready,
  Loading,
  AutoPlay,
  WaitReplay,
}

const stepId = StepId.Game

const annimatePlay = async (
  pos: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  actionId : number,
  gameCardId1: number,
  gameCardId2: number,
  preview: boolean,
) => {
  console.log("annimatePlay", gameCardId1, gameCardId2)
  console.log(preview, actionId, gameCardId1, gameCardId2)
  const place1 = current[cardRefIdList[pos][gameCardId1]]?.getPlace()
  //console.log(place1)
  if (place1) {
    if (gameCardId2 !== undefined) {
      let place2 = undefined
      if (actionId - (actionId % 2) === ActionType.Attack){
        place2 = current[cardRefIdList[1 - pos][gameCardId2]]?.getPlace()
        if (place2) {
          await current[cardRefIdList[pos][gameCardId1]]?.doTranslate2({
            x: place2.x - place1.x,
            y: place2.y - place1.y,
          })
        }
      } else {
        console.log("actionId not replay")
      }
    }else {
      console.log("gameCardId2 undefined")
    }
  } else {
    console.log("place1 not found")
  }
}

const _playAction = async (
  contractHandler : ContractHandlerType,
  gameAction: GameActionType,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  preview : boolean,
  annimate?: {
    cardRefIdList: number[][],
    current: (PlaceRefType | null)[],
    annimatePlay: (
      myTurn: number,
      cardRefIdList: number[][],
      current: (PlaceRefType | null)[],
      actionId: number,
      gameCardId1: number,
      gameCardId2: number,
      preview: boolean,
    ) => Promise<void>
  },
) => {
  await playAction(
    contractHandler,
    gameAction,
    turnData,
    setTurnData,
    preview,
    annimate,
  )
}

const _playNextAction = async (
  contractHandler : ContractHandlerType,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  setPlay: (play: number) => void,
  game: GameType,
  playActionList: GameActionListType[],
  userId: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  check: (val1: number, val2: number, message: string) => boolean
) => {
  const playActionTurnList = playActionList[turnData.turn - 1]
  console.log(turnData.playActionList.length, playActionTurnList)
  console.log("playNextAction", playActionTurnList && playActionTurnList[turnData.playActionId])
  if (
    playActionTurnList &&
    playActionTurnList[turnData.playActionId] &&
    playActionTurnList[turnData.playActionId] != null
  ) {
    const gameAction = playActionTurnList[turnData.playActionId] as GameActionType
    await _playAction(
      contractHandler,
      gameAction,
      turnData,
      setTurnData,
      false,
      {
        cardRefIdList,
        current,
        annimatePlay,
      }

    )
    setPlay(Play.Replay)
  } else {
    if (playActionList.length > turnData.turn) {
      endTurnData(turnData, setTurnData)
      setPlay(Play.Replay)
    } else {
      checkTurnData(game, turnData, check)
      setTurnData(getTurnData(game, userId))
      setPlay(Play.Ready)
    }
  }
}

const GameBoard = (props: {
  contractHandler : ContractHandlerType,
  game: GameType,
  user: UserType,
  oponent: UserType,
  children?: any,
}) => {

  const playActionList = useAppSelector((state) => state.gameSlice.playActionList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  //const cardIdSpace = [[[],[],[]],[[],[],[]]] as number[][][]

  const [turnData, setTurnData] = useState<TurnDataType>({
    turn: 0,
    pos: 0,
    playActionId: 0,
    userId: [0, 0],
    playActionList: [],
    cardList: [[], []],
  })

  const [play, setPlay] = useState(Play.Init)

  const [ autoPlay, setAutoPlay] = useState(false)

  const turn = props.game.turn

  const cardRefList = useRef<(PlaceRefType | null)[]>([])
  const cardRefIdList = [] as number[][]
  let cardRefIdx = -1

  const getRefId = (pos: number, gameCardId: number) => {
    if (!cardRefIdList[pos]) {
      cardRefIdList[pos] = []
    }
    cardRefIdx++
    cardRefIdList[pos][gameCardId] = cardRefIdx
    return cardRefIdx
  }

  const check = (val1: number, val2: number, message: string) => {
    if (val1 !== val2) console.error(message)
    return val1 === val2
  }

  const _addPlayAction = async (
    payload: GameActionPayloadType,
  ) => {
    dispatch(addPlayAction(payload))
  }

  const _endGameByTime = () => {
    endGameByTime(props.contractHandler).then(() => {
    }).catch((err) => { dispatch(setError({ id: stepId, catchError: err })) })
  }

  const _endTurn = async () => {
    setPlay(Play.EndTurn)
    endTurn(
      props.contractHandler,
      turnData.playActionList,
      turn,
      _addPlayAction,
    ).then(() => {
    }).catch((err) => {
      console.log(err)
      dispatch(setError({ id: stepId, catchError: err }))
    })
  }

  const _autoPlay = async () => {
    if (playRandomly(turnData, true)){
        await _playRandomly()
        setTimeout(async () => {
          setPlay(Play.AutoPlay)
        }, 500)
      } else {
        await _endTurn()
      }

  }

  useEffect(() => {
    if (play === Play.Init) {
      setTurnData(getTurnData(props.game, props.user.id))
      setPlay(Play.Ready)
    }
    if (play === Play.Replay) {
      setPlay(Play.Playing)
      _playNextAction(
        props.contractHandler,
        turnData,
        setTurnData,
        setPlay,
        props.game,
        playActionList,
        props.user.id,
        cardRefIdList,
        cardRefList.current,
        check,
      ).catch((err) => {
        console.log(err)
        dispatch(setError({ id: stepId, catchError: err }))
      })
    }
    if ((play === Play.Ready || play === Play.EndTurn) && turnData.turn < turn) {
      setPlay(Play.Loading)
      //endTurnData(turnData, setTurnData)
      setTimeout(async () => {
        setPlay(Play.Replay)
      }, 1000)
    }
    if (play === Play.Ready && turnData.turn === turn && autoPlay) {
      setPlay(Play.Loading)
      setTimeout(async () => {
        setPlay(Play.AutoPlay)
      }, 500)
    }
    if (play === Play.AutoPlay) {
      setPlay(Play.Loading)
      _autoPlay()
    }
  }, [play, autoPlay, props.game, props.user.id, props.contractHandler, turnData, playActionList, cardRefIdList, turn, dispatch])


  const displayGameCardList = (
    pos: number,
    start: number,
    stop: number,
    draggable?: boolean,
    onDrop?: (data: string, gameCard: GameCardType,) => void,
    onDropEmpty?: (data: string, id: number) => void,
  ) => {
    const xs = Math.floor(12 / (stop - start))
    const padding = Math.floor((12 - ((stop - start) * xs)) / 2)
    const gameCardList = turnData.cardList[pos].slice(start, stop)
    return (
      <Row>
        {!!padding && <Col xs={padding}></Col>}
        {gameCardList.map((_card, _id) => {
          const id = start + _id
          return (
            <Col xs={xs} key={id} style={{ paddingTop: '1em' }}>
              <div style={{
                width:"12em",
                height:"18em",
                backgroundColor : '#ffffff40',
                borderRadius:"1.2em",
              }}>
              <PlaceHelper ref={el => {
                if (el) {
                  cardRefList.current[getRefId(pos, id)] = el
                }
              }} disable={!_card}>
              { !!_card &&
                <GameCardWidget
                  cardList={cardList}
                  gameCard={_card}
                  draggable={draggable ?
                    (_card.id >= 0 && _card.id < 2 && _card.play === 0)
                    :
                    false}
                  onDrop={onDrop}
                />
              }
              { !_card &&
                <DropHelper
                  onDrop={(data : string) => onDropEmpty && onDropEmpty(data, id)}
                  style={{
                    width:"12em",
                    height:"18em",
                  }}
                >
                </DropHelper>
              }
              </PlaceHelper>
              </div>
            </Col>
          )
        })}
      </Row>
    )
  }

  const _playAttack = async (data: string, gameCard2: GameCardType) => {
    const gameCardId1 = parseInt(data)
    const gameCardId2 = gameCard2.id
    const gameAction = {
      gameCardId : gameCardId1,
      actionTypeId : ActionType.Attack,
      dest : gameCardId2,
      self : true,
    }
    try{
      await _playAction(
        props.contractHandler,
        gameAction,
        turnData,
        setTurnData,
        true,
        {
          cardRefIdList,
          current : cardRefList.current,
          annimatePlay,
        }
      )
    } catch (err : any) {
      console.log(err)
      dispatch(setError({ id: stepId, catchError: err }))
    }
  }

  const _playRandomly = async (isAnimate ?: boolean) => {
    try {
      const gameAction = playRandomly(turnData)
      if (gameAction !== 0 && gameAction !== 1) {
        let animate = undefined
        if (isAnimate){
          animate = {
            cardRefIdList,
            current: cardRefList.current,
            annimatePlay,
          }
        }
        await _playAction(
          props.contractHandler,
          gameAction,
          turnData,
          setTurnData,
          true,
          animate,
        )
      }
    } catch (err : any) {
      console.log(err)
      dispatch(setError({ id: stepId, catchError: err }))
    }
  }

  const _displayAction = () => {
    const _actionList = [] as ReactElement[]
    for (let _turn = playActionList.length; _turn > 0; _turn--) {
      const _playActionTurnList = playActionList[_turn - 1]
      for (let _id = _playActionTurnList.length - 1; _id >= 0 ; _id--) {
        const _playAction = _playActionTurnList[_id]
        if (_playAction) {
          let _style
          if (_id === 0){
            _style={borderBottom : 'thin solid black'}
          }
          let toPlay = ''
          if (turnData.turn < _turn || (turnData.turn == _turn &&  _id >= turnData.playActionId)) {
            toPlay = '*'
          }
          _actionList.push(
            <div style={_style} key={_turn + ' ' + _id}>
              {toPlay} {_turn}/{_id} {ActionType[_playAction.actionTypeId]} {_playAction.gameCardId} {_playAction.dest}
            </div>
          )
        }
      }
    }

    const _actionList2 = [] as ReactElement[]
    for (let _id = turnData.playActionList.length - 1; _id >= 0 ; _id--) {
      const _playAction = turnData.playActionList[_id]
      if (_playAction) {
        let _style
        if (_id === 0){
          _style={borderBottom : 'thin solid black'}
        }
        _actionList2.push(
          <div style={_style} key={_id}>
            {_id} {turnData.pos} {ActionType[_playAction.actionTypeId]} {_playAction.gameCardId} {_playAction.dest}
          </div>
        )
      }
    }

    return (
      <Row>
        <Col>
          {_actionList}
        </Col>
        <Col>
          {_actionList2}
        </Col>
      </Row>
    )
  }

  return (
    <div style={{ fontSize: "11px" }}>

      <Row style={{ height: "20em", backgroundColor: "#00000080" }}>
        {displayGameCardList(
          1 - turnData.pos,
          0,
          2,
          false,
          _playAttack,
        )}
      </Row>
      <GameTimer
        myTurn={1}
        latestTime={props.game.latestTime}
        endGameByTime={_endGameByTime}
      />
      <div>
      </div>
      <Row
        style={{ height: "20em", backgroundColor: "#00000080" }}
      >
      <Col>
          {displayGameCardList(
            turnData.pos,
            0,
            2,
            play === Play.Ready,
          )}
          </Col>
          </Row>
          <Row>
        <Col style={{
          backgroundColor: '#ffffff80',
          paddingTop: '1em',
        }}>
          <div style={{ height: '10em', textAlign: 'center' }}>
            {
              <div>
                <div style={{ height: '4em' }}>

                    <span>
                    {!autoPlay && play === Play.Ready &&
                      playRandomly(turnData, true) === 1 &&
                      (<Button
                      onClick={() => {
                        _playRandomly(true)
                      }}
                    >Play randomly</Button>)}&nbsp;&nbsp;
                    <Button
                      onClick={() => {
                        setAutoPlay(!autoPlay)
                      }}
                    >{autoPlay ? "Stop" : "Auto play"}</Button>
                    </span>

                </div>
                {play === Play.WaitReplay &&
                  <Button
                    onClick={() => {
                      setPlay(Play.Replay)
                    }}
                  >Replay next</Button>
                }
                {!autoPlay && play === Play.Ready &&
                  <Button
                    onClick={() => {
                      _endTurn()
                    }}
                  >End turn</Button>
                }
              </div>

            }
          </div>
          <div style={{ height: '4em', textAlign: 'center' }}>
            <div>Game : {props.game.id} Turn : {turnData.turn} Action : {turnData.playActionId}</div>
            <div>{Play[play]}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {props.children}
          </div>
        </Col>
      </Row>
      <Row style={{ height: "20em" }}>
        <Col style={{
          backgroundColor: '#ffffffD0',
          paddingTop: '1em',
        }}>
          {_displayAction()}
        </Col>
      </Row>
    </div>
  )
}

export default GameBoard
