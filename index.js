'use strict'

require('isomorphic-fetch')
const _ = require('lodash')
const schedule = require('node-schedule')

let hasNotified = false

function hasJamesYoungEnteredTheGame (gameId) {
  return fetch(`http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/scores/gamedetail/${gameId}_gamedetail.json`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Arjun-Balaji'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    const playerData = _.merge(data.g.vls.pstsg, data.g.hls.pstsg)
    const jamesYoung = _.find(playerData, (player) => {
      return player.fn === 'James' && player.ln === 'Young'
    })
    return jamesYoung.totsec >= 0
  })
  .catch((error) => {
    console.log(error)
    return error.toString()
  })
}

function getTodaysCelticsGame () {
  return fetch('http://data.nba.com/data/5s/v2015/json/mobile_teams/nba/2016/scores/00_todays_scores.json', {
    method: 'GET',
    headers: {
      'User-Agent': 'Arjun-Balaji'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    const celticsGame = _.find(data.gs.g, (game) => {
      return game.v.tn === 'Celtics' || game.h.tn === 'Celtics'
    })
    return celticsGame
  })
  .catch((error) => {
    return error.toString()
  })
}

// Clear the notifier variable every day @ 2am.
schedule.scheduleJob('0 2 * * *', () => {
  hasNotified = false
})

// Run the job every minute.
schedule.scheduleJob('*/1 * * * *', () => {
  if (!hasNotified) {
    const celticsGame = getTodaysCelticsGame()
    if (celticsGame) {
      const jamesYoungIsIn = hasJamesYoungEnteredTheGame(celticsGame.gid)
      if (jamesYoungIsIn) {
        console.log('James Young has entered the game')
        hasNotified = true
      }
    }
  }
})
