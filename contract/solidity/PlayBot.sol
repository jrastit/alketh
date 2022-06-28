// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { GameUser, GameCard } from './PlayGame.sol';

contract PlayBot {

    uint256 public contractHash;

    constructor(
        uint256 _contractHash
    ) {
        contractHash = _contractHash;
    }

      /////////////////////////////// Bot ///////////////////////////////////
      function nextAction(
          uint8 _pos,
          GameUser[2] calldata gameUser,
          uint8 cardPos
          ) public pure returns(uint8, uint8, uint8){
        GameUser calldata user = gameUser[_pos];
        GameCard calldata gameCard = user.cardList[cardPos];
        if (gameCard.cardId != 0) {
          for (uint8 j = 0; j < 2; j++){
            if (gameUser[1 - _pos].cardList[j].cardId != 0){
              return (cardPos, 2 + _pos, j);
            }
          }
        }
        return (0, 0, 0);
      }


}
