/* eslint-disable prefer-destructuring */
// https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js
export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
export function matrixArrayToCssMatrix(array: number[]) {
  return `matrix3d(${array.join(',')})`;
}

export function multiplyPoint(matrix: number[], point: number[]) {
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const w = point[3];

  const c1r1 = matrix[0];
  const c2r1 = matrix[1];
  const c3r1 = matrix[2];
  const c4r1 = matrix[3];
  const c1r2 = matrix[4];
  const c2r2 = matrix[5];
  const c3r2 = matrix[6];
  const c4r2 = matrix[7];
  const c1r3 = matrix[8];
  const c2r3 = matrix[9];
  const c3r3 = matrix[10];
  const c4r3 = matrix[11];
  const c1r4 = matrix[12];
  const c2r4 = matrix[13];
  const c3r4 = matrix[14];
  const c4r4 = matrix[15];

  return [
    x * c1r1 + y * c1r2 + z * c1r3 + w * c1r4,
    x * c2r1 + y * c2r2 + z * c2r3 + w * c2r4,
    x * c3r1 + y * c3r2 + z * c3r3 + w * c3r4,
    x * c4r1 + y * c4r2 + z * c4r3 + w * c4r4,
  ];
}

export function multiplyMatrices(a: number[], b: number[]) {
  // TODO - Simplify for explanation
  // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

  const result = [];

  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  // Cache only the current line of the second matrix
  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  result[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  result[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  result[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  result[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return result;
}

export function multiplyArrayOfMatrices(matrices: number[][]) {
  let inputMatrix = matrices[0];

  for (let i = 1; i < matrices.length; i++) {
    inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
  }

  return inputMatrix;
}

export function normalMatrix(matrix: number[]) {
  /*
    This function takes the inverse and then transpose of the provided
    4x4 matrix. The result is a 3x3 matrix. Essentially the translation
    part of the matrix gets removed.

    https://github.com/toji/gl-matrix
  */

  const a00 = matrix[0];
  const a01 = matrix[1];
  const a02 = matrix[2];
  const a03 = matrix[3];
  const a10 = matrix[4];
  const a11 = matrix[5];
  const a12 = matrix[6];
  const a13 = matrix[7];
  const a20 = matrix[8];
  const a21 = matrix[9];
  const a22 = matrix[10];
  const a23 = matrix[11];
  const a30 = matrix[12];
  const a31 = matrix[13];
  const a32 = matrix[14];
  const a33 = matrix[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  const result = [];

  result[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  result[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  result[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

  result[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  result[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  result[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

  result[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  result[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  result[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

  return result;
}

export function rotateXMatrix(a: number) {
  const { cos } = Math;
  const { sin } = Math;

  return [1, 0, 0, 0, 0, cos(a), -sin(a), 0, 0, sin(a), cos(a), 0, 0, 0, 0, 1];
}

export function rotateYMatrix(a: number) {
  const { cos } = Math;
  const { sin } = Math;

  return [cos(a), 0, sin(a), 0, 0, 1, 0, 0, -sin(a), 0, cos(a), 0, 0, 0, 0, 1];
}

export function rotateZMatrix(a: number) {
  const { cos } = Math;
  const { sin } = Math;

  return [cos(a), -sin(a), 0, 0, sin(a), cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function translateMatrix(x: number, y: number, z: number) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

export function scaleMatrix(w: number, h: number, d: number) {
  return [w, 0, 0, 0, 0, h, 0, 0, 0, 0, d, 0, 0, 0, 0, 1];
}

export function getScale(matrix: number[]) {
  return [matrix[0], matrix[5], matrix[10]];
}

export function perspectiveMatrix(
  fieldOfViewInRadians: number,
  aspectRatio: number,
  near: number,
  far: number,
) {
  // Construct a perspective matrix

  /*
     Field of view - the angle in radians of what's in view along the Y axis
     Aspect Ratio - the ratio of the canvas, typically canvas.width / canvas.height
     Near - Anything before this point in the Z direction gets clipped (resultside of the clip space)
     Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
  */

  const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
  const rangeInv = 1 / (near - far);

  return [
    f / aspectRatio,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0,
  ];
}

export function orthographicMatrix(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
) {
  // Each of the parameters represents the plane of the bounding box

  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  const row4col1 = (left + right) * lr;
  const row4col2 = (top + bottom) * bt;
  const row4col3 = (far + near) * nf;

  return [-2 * lr, 0, 0, 0, 0, -2 * bt, 0, 0, 0, 0, 2 * nf, 0, row4col1, row4col2, row4col3, 1];
}

export function normalize(vector: number[]) {
  // A utility function to make a vector have a length of 1

  const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);

  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

export function invertMatrix(matrix: number[]) {
  // Adapted from: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js

  // Performance note: Try not to allocate memory during a loop. This is done here
  // for the ease of understanding the code samples.
  const result = [];

  const n11 = matrix[0];
  const n12 = matrix[4];
  const n13 = matrix[8];
  const n14 = matrix[12];
  const n21 = matrix[1];
  const n22 = matrix[5];
  const n23 = matrix[9];
  const n24 = matrix[13];
  const n31 = matrix[2];
  const n32 = matrix[6];
  const n33 = matrix[10];
  const n34 = matrix[14];
  const n41 = matrix[3];
  const n42 = matrix[7];
  const n43 = matrix[11];
  const n44 = matrix[15];

  result[0] =
    n23 * n34 * n42 -
    n24 * n33 * n42 +
    n24 * n32 * n43 -
    n22 * n34 * n43 -
    n23 * n32 * n44 +
    n22 * n33 * n44;
  result[4] =
    n14 * n33 * n42 -
    n13 * n34 * n42 -
    n14 * n32 * n43 +
    n12 * n34 * n43 +
    n13 * n32 * n44 -
    n12 * n33 * n44;
  result[8] =
    n13 * n24 * n42 -
    n14 * n23 * n42 +
    n14 * n22 * n43 -
    n12 * n24 * n43 -
    n13 * n22 * n44 +
    n12 * n23 * n44;
  result[12] =
    n14 * n23 * n32 -
    n13 * n24 * n32 -
    n14 * n22 * n33 +
    n12 * n24 * n33 +
    n13 * n22 * n34 -
    n12 * n23 * n34;
  result[1] =
    n24 * n33 * n41 -
    n23 * n34 * n41 -
    n24 * n31 * n43 +
    n21 * n34 * n43 +
    n23 * n31 * n44 -
    n21 * n33 * n44;
  result[5] =
    n13 * n34 * n41 -
    n14 * n33 * n41 +
    n14 * n31 * n43 -
    n11 * n34 * n43 -
    n13 * n31 * n44 +
    n11 * n33 * n44;
  result[9] =
    n14 * n23 * n41 -
    n13 * n24 * n41 -
    n14 * n21 * n43 +
    n11 * n24 * n43 +
    n13 * n21 * n44 -
    n11 * n23 * n44;
  result[13] =
    n13 * n24 * n31 -
    n14 * n23 * n31 +
    n14 * n21 * n33 -
    n11 * n24 * n33 -
    n13 * n21 * n34 +
    n11 * n23 * n34;
  result[2] =
    n22 * n34 * n41 -
    n24 * n32 * n41 +
    n24 * n31 * n42 -
    n21 * n34 * n42 -
    n22 * n31 * n44 +
    n21 * n32 * n44;
  result[6] =
    n14 * n32 * n41 -
    n12 * n34 * n41 -
    n14 * n31 * n42 +
    n11 * n34 * n42 +
    n12 * n31 * n44 -
    n11 * n32 * n44;
  result[10] =
    n12 * n24 * n41 -
    n14 * n22 * n41 +
    n14 * n21 * n42 -
    n11 * n24 * n42 -
    n12 * n21 * n44 +
    n11 * n22 * n44;
  result[14] =
    n14 * n22 * n31 -
    n12 * n24 * n31 -
    n14 * n21 * n32 +
    n11 * n24 * n32 +
    n12 * n21 * n34 -
    n11 * n22 * n34;
  result[3] =
    n23 * n32 * n41 -
    n22 * n33 * n41 -
    n23 * n31 * n42 +
    n21 * n33 * n42 +
    n22 * n31 * n43 -
    n21 * n32 * n43;
  result[7] =
    n12 * n33 * n41 -
    n13 * n32 * n41 +
    n13 * n31 * n42 -
    n11 * n33 * n42 -
    n12 * n31 * n43 +
    n11 * n32 * n43;
  result[11] =
    n13 * n22 * n41 -
    n12 * n23 * n41 -
    n13 * n21 * n42 +
    n11 * n23 * n42 +
    n12 * n21 * n43 -
    n11 * n22 * n43;
  result[15] =
    n12 * n23 * n31 -
    n13 * n22 * n31 +
    n13 * n21 * n32 -
    n11 * n23 * n32 -
    n12 * n21 * n33 +
    n11 * n22 * n33;

  const determinant = n11 * result[0] + n21 * result[4] + n31 * result[8] + n41 * result[12];

  if (determinant === 0) {
    throw new Error("Can't invert matrix, determinant is 0");
  }

  for (let i = 0; i < result.length; i++) {
    result[i] /= determinant;
  }

  return result;
}
