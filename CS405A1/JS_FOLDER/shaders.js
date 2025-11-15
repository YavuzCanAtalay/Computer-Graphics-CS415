// shaders.js — vertex & fragment shaders for Part A
export const vertexShaderSrc = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform mat4 u_model;
  varying vec3 v_color;
  void main() {
    v_color = a_color;
    gl_Position = u_model * vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSrc = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;
