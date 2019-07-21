let canvas;
let context;

// --------------------------------------------------------------------------- 

class Vector2 {
  constructor(x = 0, y = 0) {
    this.xy = [x, y];
  }

  get x() {
    return this.xy[0];
  }

  get y() {
    return this.xy[1];
  }

  set x(value) {
    this.xy[0] = value;
  }

  set y(value) {
    this.xy[1] = value;
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(that) {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  subtract(that) {
    return new Vector2(this.x - that.x, this.y - that.y);
  }

  flipAround(that) {
    return this.subtract(that).negate().add(that);
  }

  negate() {
    return new Vector2(-this.x, -this.y);
  }

  distance(that) {
    return this.subtract(that).magnitude;
  }

  diagonalDistance(that) {
    let diffX = that.x - this.x;
    let diffY = that.y - this.y;
    return Math.max(Math.abs(diffX), Math.abs(diffY));
  }

  round() {
    return new Vector2(Math.round(this.x), Math.round(this.y));
  }

  lerp(that, t) {
    return new Vector2((1 - t) * this.x + t * that.x, (1 - t) * this.y + t * that.y);
  }

  toString() {
    return `[${this.x}, ${this.y}]`;
  }
}

class Node {
  constructor(position = null, controlIn = null, controlOut = null) {
    this.position = position;
    this.controlIn = controlIn;
    this.controlOut = controlOut;
  }

  get pull() {
    return this.controlIn;
  }

  get push() {
    if (this.controlOut) {
      return this.controlOut;
    } else {
      return this.controlIn.flipAround(this.position);
    }
  }
}

// --------------------------------------------------------------------------- 

let spline = [ 
  new Node(new Vector2(10, 20), null, new Vector2(200, 300)),
  new Node(new Vector2(600, 400), new Vector2(500, 100), null),
  new Node(new Vector2(800, 500), new Vector2(800, 490), null),
];

let selectedVertex = null;

// --------------------------------------------------------------------------- 

function initialize() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  // canvas.imageSmoothingEnabled = false;
  window.addEventListener('resize', resize);
  window.addEventListener('mousedown', mouseDown);
  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
  resize();
}

function mouseDown(e) {
  let mousePosition = new Vector2(e.clientX, e.clientY);

  // Figure out if any vertex was clicked on. If so, remember it.
  let close = 6;
  for (let node of spline) {
    if (mousePosition.distance(node.position) < close) {
      selectedVertex = node.position;
      break;
    } else if (node.controlIn && mousePosition.distance(node.controlIn) < close) {
      selectedVertex = node.controlIn;
      break;
    } else if (node.controlOut && mousePosition.distance(node.controlOut) < close) {
      selectedVertex = node.controlOut;
      break;
    }
  }
}

function mouseMove(e) {
  if (selectedVertex) {
    selectedVertex.x = e.clientX;
    selectedVertex.y = e.clientY;
    window.requestAnimationFrame(draw);
  }
}

function mouseUp() {
  selectedVertex = null;
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let node of spline) {
    drawPointMaybe(node.position, 3);
    drawPointMaybe(node.controlIn, 3);
    drawPointMaybe(node.controlOut, 3);
  }

  for (let i = 0; i < spline.length - 1; ++i) {
    plotCubic(spline[i], spline[i + 1]);
  }
}

function drawLine(a, b) {
  let n = a.diagonalDistance(b);
  for (let step = 0; step <= n; step += 1) {
    let t = n == 0 ? 0 : step / n;
    let p = a.lerp(b, t).round();
    drawPoint(p, 0);
  }
}

function plotCubic(from, to) {
  let a = from.position;
  let b = from.push;
  let c = to.pull;
  let d = to.position;

  let longWay = a.distance(b) + b.distance(c) + c.distance(d);
  let shortWay = a.distance(d);

  if (longWay < 1.001 * shortWay) {
    drawLine(a, d);
  } else {
    let q0 = a.lerp(b, 0.5);
    let q1 = b.lerp(c, 0.5);
    let q2 = c.lerp(d, 0.5);

    let r0 = q0.lerp(q1, 0.5);
    let r1 = q1.lerp(q2, 0.5);

    let s0 = r0.lerp(r1, 0.5);

    plotCubic(new Node(a, null, q0), new Node(s0, r0, null));
    plotCubic(new Node(s0, null, r1), new Node(d, q2, null));
  }
}

function drawPointMaybe(p, radius) {
  if (p) {
    drawPoint(p, radius);
  }
}

function drawPoint(p, radius) {
  context.fillRect(p.x - radius, p.y - radius, radius * 2 + 1, radius * 2 + 1);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.requestAnimationFrame(draw);
}

window.addEventListener('load', initialize);
