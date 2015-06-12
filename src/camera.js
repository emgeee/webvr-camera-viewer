let quickconnect = require('rtc-quickconnect')

module.exports = function () {
  const room = 'oix1@lkjs8dcSd'
  // const width = 640
  // const height = 480
  // const width = window.innerWidth
  // const height = window.innerHeight

  let video = document.createElement('video')
  // video.width = width
  // video.height = height
  video.autoplay = true

  document.body.appendChild(video)

  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL

  if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: false, video: true}, (stream) => {
      video.src = window.URL.createObjectURL(stream)

      quickconnect('https://switchboard.rtc.io/', {room: room})
        .addStream(stream)
        .on('call:started', (id, pc, data) => {
          console.log('started streaming!')
        })

    }, (error) => {
      console.log('Failed to get a stream due to', error)
    })
  } else {
    console.error('no webcam')
  }
}
