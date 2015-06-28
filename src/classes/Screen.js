'use strict'

/*
 * Handles creation of new screen inside WebGL space
 */

module.exports = class Screen {
  constructor (stream, id) {
    // neew to require here so it will have been loaded
    let THREE = require('three')

    this.id = id // stream ID
    this.stream = stream

    // set screen to have 16:9 aspect ratio with width === 1 meter
    this.width = 1
    this.height = 9 / 16

    this.screenDistance = 1 // distance in meters between screen and camera

    const eyeLevel = 1.8 // corresponds to height of camera

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

