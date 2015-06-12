
var camera = require('./camera')
var viewer = require('./viewer')

window.addEventListener('load', () => {
  let streamBtn = document.getElementById('stream')
  let viewBtn = document.getElementById('view')

  function removeBtns () {
    document.body.removeChild(streamBtn)
    document.body.removeChild(viewBtn)
  }

  streamBtn.addEventListener('click', () => {
    removeBtns()
    camera()
  })

  viewBtn.addEventListener('click', () => {
    removeBtns()
    viewer()
  })

})
