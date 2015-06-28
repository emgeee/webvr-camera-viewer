let $ = require('zepto')
let quickconnect = require('rtc-quickconnect')
let freeice = require('freeice')

let Screen = require('./classes/Screen.js')

module.exports = function view (ctx) {
  let THREE = require('three')
  let WebVRManager = require('WebVRManager')

  const room = ctx.params.id

  // const width = 640
  // const height = 480
  const width = window.innerWidth
  const height = window.innerHeight

  /**
   * create RTC connection
   */
  // Array to Maintain connected screens
  let screens = []

  let screenIndex = 0

  let rtcStream = quickconnect('https://switchboard.rtc.io/', {
      room: room,
      iceServers: freeice()
    })
    .on('call:started', (id, pc, data) => {
      console.log('call started with', id, data)
    })
    .on('call:ended', (id) => {
      console.log('call ended with', id)
    })

  /**
   * Begin VR scene
   */

  // configure camera
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000)
  camera.position.y = 1.8 // set height in meters

  let floorTexture = THREE.ImageUtils.loadTexture('assets/grid.png')
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(100, 100)
  let floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide
  })
  let floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1)
  let floor = new THREE.Mesh(floorGeometry, floorMaterial)
  // floor.position.y = -0.5
  floor.rotation.x = Math.PI / 2
  scene.add(floor)

  // let light = new THREE.PointLight(0xffffff)
  // light.position.set(0, 250, 0)
  // scene.add(light)
  // var ambientLight = new THREE.AmbientLight(0x111111)

  // let textureCube = THREE.ImageUtils.loadTextCube([
  //   'assets/posx.jpg',
  //   'assets/negx.jpg',
  //   'assets/posy.jpg',
  //   'assets/negy.jpg',
  //   'assets/posz.jpg',
  //   'assets/negz.jpg'
  // ])

  let controls = new THREE.VRControls(camera)

  // create renderer
  let renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  // renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement)

  // create VR effect
  let effect = new THREE.VREffect(renderer)
  effect.setSize(width, height)

  // create WebVR manager
  let manager = new WebVRManager(renderer, effect, {hideButton: false})

  rtcStream
    .on('stream:added', (id, stream, data) => {
      console.log('stream added from', id, stream)
      // only create a new screen for streaming connections
      if (stream.label !== 'default') {
        let screen = new Screen(stream)
        screen.rotation = screenIndex * Math.PI / 4
        scene.add(screen.mesh)
        screens.push(screen)
        screenIndex++
      }
    })
    .on('stream:removed', (id) => {
      for (let i = 0; i < screens.length; i++) {
        if (screens[i].id === id) {
          scene.remove(screens[i].mesh)
          screens.splice(i, 1)
          break
        }
      }
    })

  function animate () {
    for (let i = 0; i < screens.length; i++) {
      screens[i].update()
    }

    controls.update()

    // renderer.render(scene, camera)
    manager.render(scene, camera)
    window.requestAnimationFrame(animate)
  }

  animate()

  // Reset the position sensor when 'z' pressed.
  function onKey (event) {
    if (event.keyCode === 90) { // z
      console.log('reseting sensor')
      controls.resetSensor()
    }
  }
  window.addEventListener('keydown', onKey, true)
  // Handle window resizes
  function onWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    effect.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onWindowResize, false)
}

