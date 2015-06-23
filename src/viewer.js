let $ = require('zepto')
let quickconnect = require('rtc-quickconnect')

module.exports = function view (ctx) {
  let THREE = require('three')
  let WebVRManager = require('WebVRManager')

  class Screen {
    constructor (stream, id) {
      this.id = id // stream ID
      this.stream = stream

      this.width = 1280
      this.height = 768

      this.video = document.createElement('video')
      this.video.width = this.width
      this.video.height = this.height
      this.video.autoplay = true

      this.video.src = window.URL.createObjectURL(stream)

      this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height)

      // translate geometry away from the origin to allow rotation
      this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -1800))

      this.videoTexture = new THREE.Texture(this.video)
      this.videoTexture.minFilter = THREE.NearestFilter

      this.material = new THREE.MeshBasicMaterial({
        map: this.videoTexture,
        side: THREE.DoubleSide
      })

      this.mesh = new THREE.Mesh(this.geometry, this.material)
      this.rotation = 0
    }

    update () {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.videoTexture.needsUpdate = true
      }

      if (this.mesh.rotation.y < this.rotation) {
        this.mesh.rotation.y += Math.PI / 128
      }
    }
  }

  const room = ctx.params.id
  console.log(room)

  // const width = 640
  // const height = 480
  const width = window.innerWidth
  const height = window.innerHeight

  /**
   * Begin VR scene
   */

  // configure camera
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000)

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

  // Array to Maintain connected screens
  let screens = []

  let blah = 0

  let rtcStream = quickconnect('https://switchboard.rtc.io/', {room: room})
    .on('call:started', (id, pc, data) => {
      console.log('call started with', id, data)
    })
    .on('call:ended', (id) => {
      console.log('call ended with', id)
    })
    .on('stream:added', (id, stream, data) => {

      console.log('stream added from', id, stream)

      // only create a new screen for streaming connecctions
      if (stream.label !== 'default') {
        let screen = new Screen(stream)
        screen.rotation = blah * Math.PI / 4
        scene.add(screen.mesh)
        screens.push(screen)
        blah++
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

