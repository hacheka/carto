var Zoomer = function () {
  var self = this;
  var _numOfZoomLevels = 6;
  var _zoomLevels = [];

  function buildZoomLevels(levelOneSize, canvasSize) {
    var currentSize = levelOneSize;
    for (var i = 1; i <= _numOfZoomLevels; i++) {
      var newZoomLevel = {
        w: currentSize[0],
        h: currentSize[1],
        groundResolution: currentSize[0] / canvasSize[0]
      };
      newZoomLevel.baseArea = Math.pow(newZoomLevel.groundResolution, 2);
      newZoomLevel.pixelsPerMeter = 1 / newZoomLevel.groundResolution;
      newZoomLevel.moveOffset = newZoomLevel.w * 0.1;
      _zoomLevels.push(newZoomLevel);
      currentSize = currentSize.map(function (item) { return item / 2; }); 
    }
  }

  self.getZoomLevel = function (level) {
    if (level < 1 || level > _numOfZoomLevels) {
      throw new Error('Zoom level out of bounds.');
    }
    return _zoomLevels[level - 1];
  }

  self.clipZoomLevel = function (level) {
    if (level < 1) {
      return 1;
    }
    if (level > _numOfZoomLevels) {
      return _numOfZoomLevels;
    }
    return level;
  };

  Object.defineProperty(self, 'zoomLevels', {
    get: function () { return _numOfZoomLevels; }
  });

  self.init = function (worldSize, canvasSize) {
    buildZoomLevels(worldSize, canvasSize);
  };
};

module.exports = new Zoomer();