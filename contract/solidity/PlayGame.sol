// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import { Card } from './CardList.sol';
import { GameManager, GameDeck, UserCard } from "./GameManager.sol";
import { PlayActionLib } from "./PlayActionLib.sol";
import { PlayBot } from "./PlayBot.sol";

struct GameCard {
    uint64 userId;
    uint32 userCardId;
    uint32 cardId;
    uint16 life;
    uint16 attack;
    uint16 speed;
    uint64 exp;
    uint64 expWin;
    uint8 mana;
    uint8 turn;
}

struct GameUser {
    uint64 userId;
    uint32[5] cardIdList;
    GameCard[7] cardList;
}

struct GameExp {
  mapping(uint32 => uint64) expWin;
}

contract PlayGame {

    constructor(
      GameManager _gameManager,
      uint64 _userId1,
      uint16 _gameDeckId1,
      uint64 _userId2,
      uint16 _gameDeckId2,
      uint64 _gameId,
      PlayBot _playBot
    ) {
        gameManager = _gameManager;
        playActionLib = _gameManager.gameList().playActionLib();
        playBot = _playBot;
        pos = (playActionLib.random8(2, turn, actionId) == 1) ? 0 : 1;
        _loadCard(_userId1, _gameDeckId1);
        pos = 1 - pos;
        _loadCard(_userId2, _gameDeckId2);
        latestTime = block.timestamp;
        gameId = _gameId;
        pos = 0;
        _drawNextCard();
    }

    ///////////////////////////// imported event /////////////////////////
    event GameCreated(uint64 id, uint64 userId);
    event GameCreatedBot(uint64 id, uint64 userId);
    event GameFill(uint64 id, uint64 userId);
    event GameEnd(uint64 id, uint64 winner);

    ///////////////////////////// resource /////////////////////////
    GameManager gameManager;
    PlayActionLib playActionLib;
    PlayBot playBot;

    ///////////////////////////// game /////////////////////////
    uint64 public gameId;
    GameUser[2] public gameUser;
    GameExp[2] private gameExp;

    uint8 private pos = 0;
    uint8 public turn = 1;
    uint256 public latestTime = block.timestamp;
    uint64 public winner = 0;
    bool public ended = false;

    uint8 private actionId = 0;
    uint8 public mana = 1;

    event GameUpdate(uint16 version);

    /////////////////////////// Version /////////////////////////////

    uint16 public version = 0;

    function _updateVersion() private {
        version = version + 1;
        latestTime = block.timestamp;
        emit GameUpdate(version);
    }

    /////////////////////////// View //////////////////////////////

    function getGameFull() public view returns (
      uint64,
      uint64,
      uint64,
      uint32[5] memory,
      uint32[5] memory,
      GameCard[7] memory,
      GameCard[7] memory,
      uint256,
      uint16,
      uint8,
      uint64,
      bool
    ) {
      uint32[5] memory cardIdList0 = gameUser[0].cardIdList;
      uint32[5] memory cardIdList1 = gameUser[1].cardIdList;
      GameCard[7] memory cardList0 = gameUser[0].cardList;
      GameCard[7] memory cardList1 = gameUser[1].cardList;
      return (
        gameId,
        gameUser[0].userId,
        gameUser[1].userId,
        cardIdList0,
        cardIdList1,
        cardList0,
        cardList1,
        latestTime,
        version,
        turn,
        winner,
        ended
      );
    }

    function getNewGameCardFromId(uint64 _userId, uint8 _gameCardId) public view returns (GameCard memory){
      uint8 _pos = 0;
      if (_userId == gameUser[1].userId){
        _pos = 1;
      }
      if (_userId == 0){
        _userId = gameUser[1 - _pos].userId;
      }
      return playActionLib.getGameCard(gameManager, _userId, gameUser[_pos].cardList[_gameCardId].userCardId);
    }

    function getGameCardList(uint8 _pos) public view returns (GameCard[7] memory){
        return gameUser[_pos].cardList;
    }

    function getUserCardExp(uint8 _pos, uint32 userCardId) public view returns(uint64){
        return (gameExp[_pos].expWin[userCardId]);
    }

    function getUserPos(uint64 userId) public view returns(uint8){
        if (userId == gameUser[0].userId){
            return 0;
        }
        return 1;
    }

    ////////////////////////////// Step ///////////////////////////////////
    function _checkPlayer(uint8 _turn) private view {
      uint64 userId = gameManager.userAddressList(msg.sender);
      require(!ended, 'Already ended');
      require(turn == _turn, 'Wrong turn');
      require(userId != 0, 'user not found');
      require(userId == gameUser[pos].userId, 'Wrong user');
    }

    function playStep(uint8 _turn, uint8[3] memory _action) public {
      _checkPlayer(_turn);
      _playAction(_action[0], _action[1], _action[2]);
      _updateVersion();
    }

    /////////////////////////////// Turn ////////////////////////////////////

    function _playBotTurn() private {
        uint8 actionTypeId;
        uint8 gameCardId;
        uint8 dest;
        do {
          (
              gameCardId,
              actionTypeId,
              dest
          ) = playBot.nextAction(
            pos,
            gameUser,
            ended,
            turn
            );
          if (actionTypeId != 0){
            _playAction(gameCardId, actionTypeId, dest);
          }
        } while (actionTypeId != 0 && !ended);

        if (!ended)
            _endTurn();
    }

    function _endTurn() public {
      if (gameUser[0].cardList[6].cardId != 0){
        _endGame(gameUser[1].userId);
        return;
      }
      if (gameUser[1].cardList[6].cardId != 0){
        _endGame(gameUser[0].userId);
        return;
      }
      turn = turn + 1;
      mana = (turn + 1) / 2;
      pos = 1 - pos;
      actionId = 0;
      _drawNextCard();
      emit PlayAction(turn, actionId++, 0, 0, 0, 0);
    }

    function endTurn(uint8 _turn, uint8[3][] memory _action) public {
      _checkPlayer(_turn);
      for (uint8 i = 0; i < _action.length && !ended; i++){
        _playAction(_action[i][0], _action[i][1], _action[i][2]);
      }
      if (!ended) {
        _endTurn();
        if (gameUser[pos].userId == 0 && !ended) {
          _playBotTurn();
        }
      }
      _updateVersion();
    }

    /////////////////////////////// End ///////////////////////////////////

    function _endGame(uint64 _winner) private {
        require(!ended, 'Already ended');
        winner = _winner;
        ended = true;
        gameManager.gameList().endGame(gameId);
    }

    function endGameByTime() public {
        require(block.timestamp > latestTime + 180, 'Time not ok');
        _endGame(gameUser[(turn % 2)].userId);
        _updateVersion();
    }

    function leaveGame() public {
        uint64 userId = gameManager.userAddressList(msg.sender);
        require(userId != 0, 'user not found');
        if (userId == gameUser[0].userId){
            _endGame(gameUser[1].userId);
        } else if (userId == gameUser[1].userId){
            _endGame(gameUser[0].userId);
        }
        _updateVersion();
    }

    /////////////////////////// Action ///////////////////////////
    event PlayAction(uint8 turn, uint8 id, uint8 gameCardId, uint8 actionTypeId, uint8 dest, uint16 result);

    function _loadCard(uint64 _userId, uint16 _gameDeckId) private {
        GameUser storage user = gameUser[pos];
        user.userId = _userId;
        if (_userId == 0){
          _userId = gameUser[1 - pos].userId;
        }
        uint32[5] memory gameDeckCard = gameManager.getUserDeckCard(_userId, _gameDeckId);

        require(gameDeckCard.length == 5, "not enought card");

        user.cardIdList = gameDeckCard;

    }

    function _drawCard(uint8 _pos, uint8 _i) private {
      uint32 userCardId = gameUser[_pos].cardIdList[_i];
      if (userCardId != 0){
        gameUser[_pos].cardIdList[_i] = 0;
        uint64 userId = gameUser[_pos].userId;
        if (userId == 0){
          userId = gameUser[1 - _pos].userId;
        }
        _setGameCard(pos, _i, playActionLib.getGameCard(gameManager, userId, userCardId));
        emit PlayAction(turn, actionId++, _i, 0, 0, 1);
        return;
      }
    }

    function _drawNextCard() private {
        for (uint8 _pos = 0; _pos < 2; _pos++){
          uint32[5] storage cardIdList = gameUser[_pos].cardIdList;
          if (cardIdList.length == 0) return;
          for (uint8 i = 0; i < 2; i++) {
            _drawCard(_pos, i);
          }
        }
    }

    function _setGameCard(uint8 _pos, uint8 i, GameCard memory gameCard) private {
      gameUser[_pos].cardList[i] = gameCard;
    }

    function _removeGameCard(uint8 _pos, uint8 _from, GameCard memory gameCard) private {
        //GameCard storage gameCard = gameUser[_pos].cardList[_from];
        for (uint8 i = 16; i < 36; i++){
            if (gameUser[_pos].cardList[i].cardId == 0){
                _setGameCard(_pos, i, gameCard);
                gameUser[_pos].cardList[_from].cardId = 0;
                return;
            }
        }
    }

    function _playAction(
      uint8 _gameCardId,
      uint8 _actionTypeId,
      uint8 _dest
    ) private {
        uint16 result = 0;
        GameUser storage user = gameUser[pos];
        GameUser storage oponent = gameUser[1 - pos];
        GameCard memory gameCard = user.cardList[_gameCardId];
        require(gameCard.turn < turn);
        if (_actionTypeId == 2) {
            if (_gameCardId >= 0 && _gameCardId < 2) {
                    require(_dest >= 0 && _dest < 2, "dest out of bound");
                    GameCard memory gameCard2 = oponent.cardList[_dest];
                    (
                        result,
                        gameCard,
                        gameCard2
                    ) = playActionLib.playActionAttack(
                        gameCard,
                        gameCard2,
                        turn
                    );
                    if (result != 0){
                        if (gameCard2.life == 0){
                            //oponent.cardList[_dest].cardId = 0;
                            _removeGameCard(1 - pos, _dest, gameCard2);
                        } else {
                            _setGameCard(1 - pos, _dest, gameCard2);
                        }
                        gameExp[1 - pos].expWin[gameCard.userCardId] = gameCard2.expWin;
                    }
                if (result != 0){
                    gameExp[pos].expWin[gameCard.userCardId] = gameCard.expWin;
                    if (gameCard.life == 0){
                        //user.cardList[_gameCardId].cardId = 0;
                        _removeGameCard(pos, _gameCardId, gameCard);
                    } else {
                        _setGameCard(pos, _gameCardId, gameCard);
                    }
                }


            }
        }
        emit PlayAction(turn, actionId++, _gameCardId, _actionTypeId, _dest, result);
    }
}
