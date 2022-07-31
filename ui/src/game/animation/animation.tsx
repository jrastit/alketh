import * as ReactDOM from 'react-dom';
import LineHelper from '../../component/lineHelper'
import RoundHelper from '../../component/roundHelper'
import { PlaceRefType } from '../../component/placeHelper'

import {
  GameActionListType,
  ActionType,
} from '../../type/gameType'

const getPlace = (
  pos: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  gameCardId : number,
) => {
  return current[cardRefIdList[pos][gameCardId]]?.getPlace()
}

const displayAction = (
  id: number,
  pos: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  actionId : number,
  gameCardId1: number,
  dest: number | undefined,
) => {
  console.log("Display action", pos, actionId, gameCardId1, dest)
  if (actionId - (actionId % 2) === ActionType.Attack && dest !== undefined){
    const place1 = getPlace(pos, cardRefIdList, current, gameCardId1)
    const place2 = getPlace(1 - pos, cardRefIdList, current, dest)
    if (place1 && place2) {
      console.log("Display action attack", gameCardId1, dest)
      console.log("Display line", place1, place2)
      return (
        <div key={id}>
        <LineHelper key={id}
          x1={place2.x + 70}
          y1={place2.y}
          x2={place1.x + 70}
          y2={place1.y}
          color='#ffffff80'
        />
        <RoundHelper
          x={place2.x + 70}
          y={place2.y}
          radius={10}
          color='#ffffff80'
        />
        </div>
      )
    } else {
      console.log("place1 or place2 not found")
    }
  }
}

export const displayAllAction = (
  pos : number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  playActionList : GameActionListType,
  actionPlaceholder : HTMLDivElement | null
) => {
  if (actionPlaceholder) {
    const element = (
      <div>{playActionList.map((_playAction, id) => {
        if (_playAction){
          return displayAction(
            id,
            pos,
            cardRefIdList,
            current,
            _playAction.actionTypeId,
            _playAction.gameCardId,
            _playAction.dest,
          )
        }
      })}</div>
    )
    ReactDOM.render(element, actionPlaceholder)
    /*
    actionPlaceholder.append(
      element
    )
    */
  }
}

export const annimatePlay = async (
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
  const place1 = getPlace(pos, cardRefIdList, current, gameCardId1)
  //console.log(place1)
  if (place1) {
    if (gameCardId2 !== undefined) {
      let place2 = undefined
      if (actionId - (actionId % 2) === ActionType.Attack){
        place2 = getPlace(1 - pos, cardRefIdList, current, gameCardId2)
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
