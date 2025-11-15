// math.js — transformation utilities

export function identity() {
  return [1,0,0,0,
          0,1,0,0,
          0,0,1,0,
          0,0,0,1];
}

export function translationMatrix(tx, ty, tz) {
  return [1,0,0,0,
          0,1,0,0,
          0,0,1,0,
          tx,ty,tz,1];
}

export function rotationZMatrix(deg) {
  const r = deg * Math.PI / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [ c,s,0,0,
          -s,c,0,0,
           0,0,1,0,
           0,0,0,1];
}

export function scaleMatrix(sx, sy, sz) {
  return [sx,0,0,0,
          0,sy,0,0,
          0,0,sz,0,
          0,0,0,1];
}

// Column-major 4×4 matrix multiply: a * b
export function multiply(a,b) {
  const out = new Array(16);
  for (let row=0; row<4; ++row) {
    for (let col=0; col<4; ++col) {
      out[col*4+row] = 0;
      for (let k=0; k<4; ++k)
        out[col*4+row] += a[k*4+row] * b[col*4+k];
    }
  }
  return out;
}
// --- Vector helpers ---
export function normalize(v) {
  const len = Math.hypot(...v);
  return v.map(x => x / len);
}

export function subtract(a, b) {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

export function cross(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0]
  ];
}

// --- Camera lookAt matrix ---
export function lookAt(eye, target, up) {
  const zAxis = normalize(subtract(eye, target));   // forward
  const xAxis = normalize(cross(up, zAxis));        // right
  const yAxis = cross(zAxis, xAxis);                // true up

  return [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
   -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
  ];
}

export function dot(a, b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }

