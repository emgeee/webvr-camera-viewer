'use strict'

/*
 * Handles creation of new screen inside WebGL space
 */

let TWEEN = require('tween.js');

const STEP = 128
const ROTATION_SPEED = Math.PI / STEP

module.exports = class Screen {
  constructor (stream) {
    // neew to require here so it will have been loaded
    let THREE = require('three')

    this.id = stream.id // stream ID
    this.stream = stream

    // automatically remove stream from scene when ended
    this.stream.onended = () => {
      console.log('stream removed onended')
      this.remove()
    }

    // set screen to have 16:9 aspect ratio with width === 1 meter
    this.width = 1
    this.height = 9 / 16

    this.screenDistance = 1 // distance in meters between screen and camera

    const eyeLevel = 1.8 // corresponds to height of camera

    this.theta = 0

    this.video = document.createElement('video')
    this.video.width = this.width
    this.video.height = this.height
    this.video.autoplay = true

    this.video.src = window.URL.createObjectURL(stream)

    this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height)

    // translate geometry away from the origin to allow rotation
    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -this.screenDistance))

    this.videoTexture = new THREE.Texture(this.video)
    this.videoTexture.minFilter = THREE.NearestFilter

    this.material = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      side: THREE.DoubleSide
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.y = eyeLevel
  }

  add (scene) {
    this.scene = scene
    this.scene.add(this.mesh)
  }

  remove () {
    if (this.scene) {
      this.scene.remove(this.mesh)
    }
  }

  update () {
    // update to most recent camera frame
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.videoTexture.needsUpdate = true
    }
  }

  rotate (newTheta) {
    let self = this

    const MOVE = 0.1

    console.log(this.id, this.theta, newTheta)
    if (this.theta === newTheta) {
      return
    }

    this.mesh.position.z += MOVE

    let tween = new TWEEN.Tween({theta: this.theta})
      .to({theta: newTheta}, 1500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function () {
        self.mesh.rotation.y = this.theta
      })
      .onComplete(function () {
        self.mesh.position.z -= MOVE
        self.theta = newTheta
      })
      .start()
  }

}

