'use strict'

/*
 * Handles creation of new screen inside WebGL space
 */

let $ = require('zepto')

module.exports = class Screen {
  constructor (stream, id) {
    // neew to require here so it will have been loaded
    let THREE = require('three')

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

