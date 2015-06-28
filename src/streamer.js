'use strict'

let $ = require('zepto')
let quickconnect = require('rtc-quickconnect')
let freeice = require('freeice')

let LinkShare = require('./classes/LinkShare.js')
let VideoControlPanel = require('./classes/VideoControlPanel.js')

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia)

window.URL = (window.URL ||
             window.webkitURL ||
             window.mozURL ||
             window.msURL)

/*
 * Get an array of streams from various webcams. Only certain browsers support multiple streams
 */
function getVideoDevices () {
  return new Promise((resolve, reject) => {

    if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
      window.MediaStreamTrack.getSources((sources) => {
        // filter out non-video streams
        let videoSources = sources.filter((source) => { return source.kind === 'video' })
        console.log(videoSources)

        resolve(videoSources)
      })
    } else {
      resolve([{}])
    }

  })
}

exports.create = function createStream (ctx, next) {
  const HASH_LENGTH = 5
  const POSSIBLE = 'abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  let id = ''

  for (let i = 0; i < HASH_LENGTH; i++) {
    id += POSSIBLE[Math.floor(Math.random() * POSSIBLE.length)]
  }

  ctx.params.id = id
  next()
}

exports.join = function stream (ctx) {
  const room = ctx.params.id
  const viewLink = window.location.href.replace('stream', 'view')

  $('#roomId').text(room)

  var streamerLink = new LinkShare(window.location.href)
  var viewerLink = new LinkShare(viewLink)

  streamerLink.appendTo($('#stream-box'))
  viewerLink.appendTo($('#view-box'))

  if (navigator.getUserMedia) {
    let usersConnected = 0
    $('#user-count').text(usersConnected)

    let rtcStream = quickconnect('https://switchboard.rtc.io/', {
      room: room,
      iceServers: freeice()
    })
      .reactive()
      .on('call:started', (id, pc, data) => {
        console.log('started streaming!')
        usersConnected++
        $('#user-count').text(usersConnected)
      })
      .on('call:ended', (id) => {
        usersConnected--
        $('#user-count').text(usersConnected)
      })

    // get list of possible video devices to stream
    getVideoDevices()
      .then((devices) => {
        console.log(devices)
        devices.forEach((device) => {
          let controls = new VideoControlPanel(device, rtcStream)
          controls.element.appendTo($('#app'))
        })
      })

  } else {
    console.error('no webcam')
  }
}
