
let THREE = require('three')
let WebVRManager = require('WebVRManager')

let quickconnect = require('rtc-quickconnect')


module.exports = function () {
  const room = 'oix1@lkjs8dcSd'

  // const width = 640
  // const height = 480
  const width = window.innerWidth
  const height = window.innerHeight

  let video = document.createElement('video')
  video.width = width
  video.height = height
  video.autoplay = true

  quickconnect('https://switchboard.rtc.io/', {room: room})
    .on('call:started', (id, pc, data) => {
      video.src = window.URL.createObjectURL(pc.getRemoteStreams()[0])
    })

  /*
   * Begin VR scene
   */

  // configure camera
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000)
  camera.position.z = height

  let controls = new THREE.VRControls(camera)

  // create renderer
  let renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  // renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement)

  let effect = new THREE.VREffect(renderer)
  effect.setSize(width, height)

  let manager = new WebVRManager(renderer, effect, {hideButton: false})

  // let geometry = new THREE.PlaneGeometry(1, 1)
  let geometry = new THREE.PlaneBufferGeometry(width, height)
  let videoTexture = new THREE.Texture(video)
  videoTexture.minFilter = THREE.NearestFilter

  let material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide
  })

  let plane = new THREE.Mesh(geometry, material)

  scene.add(plane)

  function animate () {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      videoTexture.needsUpdate = true
    }

    // controls.update()
    // plane.rotation.y += 0.01

    // renderer.render(scene, camera)
    manager.render(scene, camera)
    window.requestAnimationFrame(animate)
  }

  animate()

  // Reset the position sensor when 'z' pressed.
  function onKey (event) {
    console.log(controls)
    if (event.keyCode === 90) { // z
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
