let $ = require('zepto')
let quickconnect = require('rtc-quickconnect')
let freeice = require('freeice')
let QRCode = require('qrcode')

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

function openVideoStream (options) {
  return new Promise((resolve, reject) => {
    navigator.getUserMedia(options, resolve, reject)
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

class LinkShare {
  constructor (link) {
    this.link = link
    this.element = $('<div></div>')
    this.qrcode = $('<div></div>')
    this.twitter = $('<div></div>')
    this.linkElement = $('<a>' + link + '</a>', {href: link})

    this.element
      .append(this.qrcode)
      .append(this.linkElement)
      .append(this.twitter)
  }

  appendTo (elem) {
    this.element.appendTo(elem)

    // generate a QRCode for easy sharing
    new QRCode(this.qrcode[0], { // eslint-disable-line
      text: this.link,
      width: 512,
      height: 512,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })

    window.twttr.ready(() => {
      window.twttr.widgets.createShareButton(this.link, this.twitter[0], {
        text: 'Live on #WebVR:',
        hashtags: 'cardboard',
        size: 'large',
        count: 'none'
      })
    })
  }
}

class VideoControlPanel {
  constructor (device, rtcStream) {
    this.element = $('<div class="video-control"></div>')
    this.device = device
    this.rtcStream = rtcStream

    // create various HTML elements
    this.startButton = $('<button>Start Feed</button>')
    this.stopButton = $('<button>Stop Feed</button>')
    this.streamingStatusIndicator = $('<div class="streaming-indicator" style="color:red;">not streaming</div>')
    this.video = $('<video></video>')
    this.video[0].autoplay = true

    this.startButton.on('click', (e) => {
      this.startFeed()
    })

    this.stopButton.on('click', (e) => {
      this.stopFeed()
    })

    this.element
      .append($('<div class="streaming-buttons"></div>').append(this.startButton).append(this.stopButton))
      .append(this.streamingStatusIndicator)
      .append(this.video)
  }

  // Start streaming a camera feed over WebRTC
  startFeed () {
    if (!this.stream) {
      let options
      if (this.device.id) {
        options = {
          video: {
            optional: [{
              sourceId: this.device.id
            }]
          }
        }
      } else {
        options = {video: true}
      }

      openVideoStream(options)
        .then((stream) => {
          this.stream = stream
          this.video[0].src = window.URL.createObjectURL(stream)

          // add stream to the rtc Stream
          this.rtcStream.addStream(stream)
          this.streamingStatusIndicator.text('streaming!')
          this.streamingStatusIndicator.css('color', 'green')
        })
    } else {
      this.rtcStream.addStream(this.stream)
      this.streamingStatusIndicator.text('streaming!')
      this.streamingStatusIndicator.css('color', 'green')
    }
  }

  // Stop streaming a camera feed
  stopFeed () {
    this.rtcStream.removeStream(this.stream)
    this.streamingStatusIndicator.text('not streaming')
    this.streamingStatusIndicator.css('color', 'red')
  }
}
