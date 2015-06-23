
let $ = require('zepto')
let page = require('page')

// script loader
let toast = require('pyrsmk-toast')
let threeLoaded = false

let view = require('./viewer.js')
let viewTpl = require('./templates/view.tpl.html')

let stream = require('./streamer.js')
let streamTpl = require('./templates/stream.tpl.html')

let mainTpl = require('./templates/main.tpl.html')

document.addEventListener('DOMContentLoaded', () => {
  page.base((window.location.pathname === '/' ? '' : window.location.pathname))
  page('/view/:id', loadThree, renderTpl(viewTpl), view)

  page('/stream', stream.create, (ctx) => { page.redirect('/stream/' + ctx.params.id) })
  page('/stream/:id', renderTpl(streamTpl), stream.join)

  page('/', renderTpl(mainTpl), home)
  // page('*', () => { console.error('Oops fall through!'); page('/') })
  page({hashbang: true})
})

function renderTpl (tpl) {
  return (ctx, next) => {
    $('#app').html(tpl)
    next()
  }
}

// Only load three+friends when needed
function loadThree (ctx, next) {
  if (!threeLoaded) {
    threeLoaded = true
    toast(
      ['scripts/three.js', () => { return window.THREE }],
      'scripts/webvr-polyfill.js',
      'scripts/VRControls.js',
      'scripts/VREffect.js',
      'scripts/webvr-manager.js',
      () => {
        next()
      }
    )
  } else {
    next()
  }
}

function home () {
  let streamBtn = document.getElementById('stream')

  streamBtn.addEventListener('click', (e) => {
    page('/stream')
    e.preventDefault()
  })
}
