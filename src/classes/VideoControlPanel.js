'use strict'

let $ = require('zepto')

function openVideoStream (options) {
  return new Promise((resolve, reject) => {
    navigator.getUserMedia(options, resolve, reject)
  })
}

module.exports = class VideoControlPanel {
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
