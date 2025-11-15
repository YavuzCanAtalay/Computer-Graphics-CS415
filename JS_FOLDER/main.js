import {translationMatrix, rotationZMatrix, scaleMatrix, multiply} from './math.js';
import {Camera} from './camera.js';

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if (!gl) alert("WebGL not supported.");

let tx=0, ty=0, rot=0, sc=1, swapOrder=false;
const cam = new Camera();

document.getElementById('toggleCam').onclick = () => {
  cam.toggle();
  document.getElementById('toggleCam').innerText =
    cam.enabled ? "Disable Camera Control" : "Enable Camera Control";
};

let lastX=0, lastY=0, dragging=false;
canvas.addEventListener('mousedown', e => { if(cam.enabled){dragging=true; lastX=e.clientX; lastY=e.clientY;} });
canvas.addEventListener('mouseup', ()=> dragging=false);
canvas.addEventListener('mousemove', e=>{
  if(dragging && cam.enabled){
    const dx = (e.clientX-lastX)*0.01;
    const dy = (e.clientY-lastY)*0.01;
    cam.update(dx,dy);
    lastX=e.clientX; lastY=e.clientY;
    draw();
  }
});

function draw() {
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  const T = translationMatrix(tx, ty, 0);
  const R = rotationZMatrix(rot);
  const S = scaleMatrix(sc, sc, sc);
  const modelMatrix = swapOrder
        ? multiply(R, multiply(T, S))
        : multiply(T, multiply(R, S));

  const viewMatrix = cam.getViewMatrix();
  document.getElementById('viewMatrixDisplay').textContent =
    viewMatrix.map((v,i)=>v.toFixed(2)+((i+1)%4===0?'\n':'\t')).join('');

  renderAxes(viewMatrix);
  renderTriangle(modelMatrix, viewMatrix);
}

function renderAxes(view) {
  const prog = makeProgram(`
    attribute vec3 pos;
    uniform mat4 uView;
    uniform vec4 uColor;
    void main() {
      gl_Position = uView * vec4(pos, 1.0);
    }`,
    `precision mediump float;
     uniform vec4 uColor;
     void main(){ gl_FragColor = uColor; }`);

  const verts = new Float32Array([
    0,0,0, 1,0,0,   // X (red)
    0,0,0, 0,1,0,   // Y (green)
    0,0,0, 0,0,1    // Z (blue)
  ]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  const uView = gl.getUniformLocation(prog, 'uView');
  const uColor = gl.getUniformLocation(prog, 'uColor');
  gl.uniformMatrix4fv(uView, false, new Float32Array(view));

  gl.uniform4fv(uColor, [1,0,0,1]); gl.drawArrays(gl.LINES, 0, 2);
  gl.uniform4fv(uColor, [0,1,0,1]); gl.drawArrays(gl.LINES, 2, 2);
  gl.uniform4fv(uColor, [0,0,1,1]); gl.drawArrays(gl.LINES, 4, 2);
}

function renderTriangle(model, view) {
  const prog = makeProgram(`
    attribute vec3 pos;
    uniform mat4 uModel, uView;
    void main(){
      gl_Position = uView * uModel * vec4(pos,1.0);
    }`,
    `void main(){ gl_FragColor = vec4(0.6,0.9,1.0,1.0); }`);

  const verts = new Float32Array([
    0.0,  0.5, 0.0,
   -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

  const uModel = gl.getUniformLocation(prog, 'uModel');
  const uView = gl.getUniformLocation(prog, 'uView');
  gl.uniformMatrix4fv(uModel, false, new Float32Array(model));
  gl.uniformMatrix4fv(uView, false, new Float32Array(view));

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function makeProgram(vsSrc, fsSrc){
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  return prog;
}

function compile(type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(s));
  return s;
}

draw();
