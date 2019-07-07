let canvas;
let context;

function initialize() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  canvas.imageSmoothingEnabled = false;

  window.addEventListener('resize', resize);
  resize();
}

function draw() {
  let p0 = [10, 20];
  let p1 = [200, 300];
  let p2 = [400, 500];
  let p3 = [800, 100];

  drawPoint(p0, 3);
  drawPoint(p1, 3);
  drawPoint(p2, 3);
  drawPoint(p3, 3);

  plotBezier(p0, p1, p2, p3);
}

function distanceBetween(a, b) {
  let diffX = a[0] - b[0];
  let diffY = a[1] - b[1];
  return Math.sqrt(diffX * diffX + diffY * diffY);
}

function lerp(a, b, t) {
  return [(1 - t) * a[0] + t * b[0], (1 - t) * a[1] + t * b[1]];
}

function diagonalDistance(a, b) {
  let diffX = b[0] - a[0];
  let diffY = b[1] - a[1];
  return Math.max(Math.abs(diffX), Math.abs(diffY));
}

function roundPoint(p) {
  return [Math.round(p[0]), Math.round(p[1])];
}

function drawLine(p0, p1) {
  let n = diagonalDistance(p0, p1);
  for (let step = 0; step <= n; step += 1) {
    let t = n == 0 ? 0 : step / n;
    let p = lerp(p0, p1, t);
    p = roundPoint(p);
    drawPoint(p, 0);
  }
}

function plotBezier(p0, p1, p2, p3) {
  let longWay = distanceBetween(p0, p1) + distanceBetween(p1, p2) + distanceBetween(p2, p3);
  let shortWay = distanceBetween(p0, p3);
  if (longWay < 1.001 * shortWay) {
    drawLine(p0, p3);
  } else {
    let q0 = lerp(p0, p1, 0.5);
    let q1 = lerp(p1, p2, 0.5);
    let q2 = lerp(p2, p3, 0.5);

    let r0 = lerp(q0, q1, 0.5);
    let r1 = lerp(q1, q2, 0.5);

    let s0 = lerp(r0, r1, 0.5);

    // drawPoint(s0, 3);
    plotBezier(p0, q0, r0, s0);
    plotBezier(s0, r1, q2, p3);
  }
}

function drawPoint(p, radius) {
  context.fillRect(p[0] - radius, p[1] - radius, radius * 2 + 1, radius * 2 + 1);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.requestAnimationFrame(draw);
}

window.addEventListener('load', initialize);
