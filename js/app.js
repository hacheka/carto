var Camera = require('./camera');
var zoomer = require('./zoomer');
var World = require('./world');
var TileManager = require('./tileManager');
var converter = require('./converter');
var Colors = require('./colors');

var mainCamera;
var world = new World();
var tileManager = new TileManager(zoomer);
var canvas;

function handleKeyup(evt) {
  console.log(evt.keyCode);
  switch (evt.keyCode) {
    case 65:
    case 37:
      mainCamera.move('left');
      break;
    case 87:
    case 38:
      mainCamera.move('up');      
      break;
    case 68:
    case 39:
      mainCamera.move('right');      
      break;
    case 83:
    case 40:
      mainCamera.move('down');      
      break;
    case 80:
    case 187:
      mainCamera.zoom('in');      
      break;
    case 76:
    case 189:
      mainCamera.zoom('out');      
      break;            
  }
}

function hookEvents() {
  document.addEventListener('keyup', handleKeyup);
  document.getElementById('zoom-in').addEventListener('click', function (evt) { mainCamera.zoom('in') });
  document.getElementById('zoom-out').addEventListener('click', function (evt) { mainCamera.zoom('out') });  
}

function clearCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;  
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = new Colors().getBackgroundColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);   
}

function setMainCameraAndZoom() {
  var cameraData = world.calculateInitialCamera({
    width: canvas.width,
    height: canvas.height
  });
  var viewport = [canvas.width, canvas.height];

  zoomer.init(cameraData.size, viewport);
  mainCamera = new Camera(cameraData.center, cameraData.size, viewport, zoomer);
};

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function init() {
  canvas = document.getElementById('the-canvas');
  clearCanvas();

  world.fetchExtension().then(function () {
    setMainCameraAndZoom();
    tileManager.init(world);
    mainCamera.tileManager = tileManager;
    mainCamera.context = canvas.getContext('2d');
    hookEvents();
    mainCamera.beginRendering();
  }); 
}

ready(init);