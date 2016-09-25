var _ = require('lodash');
var converter = require('./converter');
var Colors = require('./colors');

var Camera = function (center, levelOneSize, viewport, zoomer) {
  var self = this;
  var _initialised = false;
  var _center = [0, 0];
  var _extent = [[0, 0], [0, 0]];
  var _numOfZoomLevels = 10;
  var _zoomLevels = [];
  var _currentZoomLevel = 1;
  var _viewport = [0, 0];
  var _zoomer = zoomer;
  var _visibleTiles = [];
  var _pendingOffscreenRender = [];
  var _redraw = false;
  var _prevMoving = '';
  var _moving = '';
  var _duration = 700;
  var _soFar = 0;
  var _animationStart = 0;
  var _colors = new Colors();
  var _lastMove;

  Object.defineProperty(self, 'center', {
    get: function () { return _center; },
    set: function (newValue) {
      _center = newValue;
      calculateCoords();
    } 
  });

  Object.defineProperty(self, 'extent', {
    get: function () { return _extent; }
  });
  
  function calculateCoords () {
    var zoom = _zoomer.getZoomLevel(_currentZoomLevel);
    _extent = [[
      _center[0] - (zoom.w / 2),
      _center[1] - (zoom.h / 2)
    ], [
      _center[0] + (zoom.w / 2),
      _center[1] + (zoom.h / 2)
    ]];
  }

  function tileUpdate(data) {
    _redraw = true;
  }

  function subscribeToNewTiles(newVisibleTiles) {
    _.shuffle(newVisibleTiles).map(function (tileKey) {
      self.tileManager.subscribe(tileKey, _lastMove, tileUpdate);
    });
  }

  function unsubscribeFromOldTiles(oldTiles) {
    oldTiles.map(function (tileKey) {
      self.tileManager.unsubscribe(tileKey);
    });
  }

  function visibleTilesHaveChanged() {
    var currentVisibleTiles = self.tileManager.getVisibleTiles(_extent, _currentZoomLevel);
    var newVisibleTiles = _.difference(currentVisibleTiles, _visibleTiles);
    var disappearingTiles = _.difference(_visibleTiles, currentVisibleTiles);
    _visibleTiles = currentVisibleTiles;

    subscribeToNewTiles(newVisibleTiles);
    unsubscribeFromOldTiles(disappearingTiles);
  };

  function clearCanvas() {
    self.context.fillStyle = _colors.getBackgroundColor();
    self.context.fillRect(0, 0, _viewport[0], _viewport[1]);    
  }

  function prepareCanvas() {
    if (self.context === null) {
      throw new Error('Canvas context is not assigned to the main camera.');
    }
    self.context.transform(1, 0, 0, -1, 0, self.context.canvas.height);
  }

  self.move = function (direction) {
    var zoom = _zoomer.getZoomLevel(_currentZoomLevel);
    switch (direction) {
      case 'up':
        self.center = [_center[0], _center[1] + zoom.moveOffset];
        break;
      case 'down':
        self.center = [_center[0], _center[1] - zoom.moveOffset];
        break;
      case 'right':
        self.center = [_center[0] + zoom.moveOffset, _center[1]];
        break;
      case 'left':
        self.center = [_center[0] - zoom.moveOffset, _center[1]];
        break;        
    }
    _lastMove = 'pan';
    visibleTilesHaveChanged();
    _redraw = true;

  };

  self.zoom = function (direction) {
    switch (direction) {
      case 'in':
        startAnimation('scale-in');
        break;
      case 'out':
        startAnimation('scale-out');
        break;
    }
    _lastMove = 'zoom';
  };

  function renderTiles() {
    var zoom = _zoomer.getZoomLevel(_currentZoomLevel);
    _visibleTiles.map(function (tileKey) {
      var theTile = self.tileManager.getTile(tileKey);
      var pos = converter.fromWorldToScreen(
        [theTile.info.extent[0][0], theTile.info.extent[0][1]], _extent, zoom.groundResolution);
      self.context.drawImage(theTile.canvas, pos[0], pos[1]);
    });    
  }

  function easeInOutCubic (t, d) {
    t /= d/2;
    if (t < 1) return 1/2*t*t*t;
    t -= 2;
    return 1/2*(t*t*t + 2);
  };

  function finishAnimation () {
    var zoom = zoomer.getZoomLevel(_currentZoomLevel);
    switch (_moving) {
      case 'scale-in':
        _currentZoomLevel = _zoomer.clipZoomLevel(++_currentZoomLevel);
        break;
      case 'scale-out':
        _currentZoomLevel = _zoomer.clipZoomLevel(--_currentZoomLevel);
        break;
    }
    _moving = '';
    _prevMoving = '';    
    calculateCoords();
    visibleTilesHaveChanged();
    _redraw = true;  
  }

  function startAnimation (typeOfAnimation) {
    if (_moving === '') {
      _moving = typeOfAnimation;
      _prevMoving = '';
    }
  }

  function handleAnimations(timestamp) {
    var value;
    var zoom = zoomer.getZoomLevel(_currentZoomLevel);
    // Scale
    var scaleInRange = 1;
    var scaleOutRange = 0.5;
    var currentScale;

    if (_prevMoving === '' && _moving !== '') {
      // Starting an animation
      _soFar = 0;
      _animationStart = timestamp;
      _prevMoving = _moving;
      return;
    }
    value = easeInOutCubic(timestamp - _animationStart, _duration);
    if (_moving !== '') {
      switch(_moving) {
        case 'scale-in':
          self.context.translate(-(_viewport[0] / 2) * value, -(_viewport[1] / 2) * value);
          self.context.scale(1 + scaleInRange * value, 1 + scaleInRange * value);
          break;
        case 'scale-out':
          clearCanvas();
          currentScale = 1 - (0.5 * value);
          self.context.translate((_viewport[0] - _viewport[0] * currentScale) / 2, (_viewport[1] - _viewport[1] * currentScale) / 2);
          self.context.scale(currentScale, currentScale);          
          break;
      }
      _redraw = true;
      if ((timestamp - _animationStart) > _duration) {
        finishAnimation(_moving);
        return true;
      }
    }
    return false;
  }

  self.renderMap = function (timestamp) {
    var animationFinished;
    self.context.save();
    animationFinished = handleAnimations(timestamp);

    if (!_redraw) {
      self.context.restore();
      requestAnimationFrame(self.renderMap);
      return;
    }

    _redraw = false;
    renderTiles();
    self.context.restore();

    if (animationFinished) {
      renderTiles();
    }

    requestAnimationFrame(self.renderMap);
  };

  self.beginRendering = function () {
    prepareCanvas();
    visibleTilesHaveChanged();
    requestAnimationFrame(self.renderMap);
  };

  self.redraw = function () {
    _redraw = true;
  };

  self.tileManager = null;
  self.context = null;

  function init() {
    _center = center;
    _viewport = viewport;
    calculateCoords();
  }

  init();
};

module.exports = Camera;
