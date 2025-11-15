import {lookAt} from './math.js';

export class Camera {
  constructor() {
    this.eye = [0, 2, 4];
    this.target = [0, 0, 0];
    this.up = [0, 1, 0];
    this.enabled = false;
    this.azimuth = 0;
    this.distance = 4;
    this.elev = 30 * Math.PI / 180;
  }

  toggle() { this.enabled = !this.enabled; }

  update(deltaAz = 0, deltaElev = 0) {
    this.azimuth += deltaAz;
    this.elev = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.elev + deltaElev));

    const x = this.distance * Math.cos(this.elev) * Math.sin(this.azimuth);
    const y = this.distance * Math.sin(this.elev);
    const z = this.distance * Math.cos(this.elev) * Math.cos(this.azimuth);
    this.eye = [x, y, z];
  }

  getViewMatrix() {
    return lookAt(this.eye, this.target, this.up);
  }

  // Simple frustum visualization (draw pyramid lines)
  drawFrustum(gl, program) {
    const uColor = gl.getUniformLocation(program, 'uColor');
    const verts = new Float32Array([
      0,0,0,   -0.5,-0.5,-1,
      0,0,0,    0.5,-0.5,-1,
      0,0,0,   -0.5, 0.5,-1,
      0,0,0,    0.5, 0.5,-1
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(uColor, [1,1,0,1]);
    gl.drawArrays(gl.LINES, 0, 8);
  }
}
