'use strict'

let $ = require('zepto')
let QRCode = require('qrcode')

module.exports = class LinkShare {
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
