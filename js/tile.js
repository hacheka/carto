var apiCaller = require('./api-caller');
var converter = require('./converter');
var zoomer = require('./zoomer');
var Colors = require('./colors');

/**
 * Tile: represents a tile of the map
 * @param {extendedTileInfo}: tile info
 */
var Tile = function (info, createdBy) {
  var self = this;
  self.info = info;
  var _canvas;
  var _ctx;
  var _callback = null;
  var _completed = false;
  var _rowsEveryQuery = 3000;
  var _rowsSoFar = 0;
  var _zoomData;
  var _colorManager;
  var _cleared = false;
  var _createdBy = createdBy;

  Object.defineProperty(self, 'canvas', {
    get: function () { return _canvas; }
  });

  function notifySubscriber() {
    if (_callback !== null) {
      _callback();
    }
  }

  function clearTile() {
    _cleared = true;
    _ctx.fillStyle = _colorManager.getBackgroundColor();
    _ctx.fillRect(0, 0, self.info.width, self.info.width);
  }

  function paintPolygons(rows) {
    rows.map(function (row) {
      var color = _colorManager.getColorForValue(row.lot);

      row.polygons.map(function (polygon) {
        var first = true;
        _ctx.beginPath();
        polygon.forEach(function (coords) {
          var translated = converter.fromWorldToScreen(coords, self.info.extent, zoomer.getZoomLevel(self.info.zoomLevel).groundResolution);
          if (first) {
            _ctx.moveTo(translated[0], translated[1]);
            first = false;
          } else {
            _ctx.lineTo(translated[0], translated[1]);
          }
        });
        _ctx.closePath();
        _ctx.fillStyle = color;
        _ctx.fill();
      });
    });
    notifySubscriber();
  }

  function callEndpoint(rowsEveryQuery, rowsSoFar) {
    apiCaller.getGeom(self.info.extent, rowsEveryQuery, rowsSoFar)
      .then(function (rows) {
        if (!_cleared) {
          clearTile();
        }
        if (rows.length === 0) {
          _completed = true;
          notifySubscriber();
        } else {
          paintPolygons(rows);
          rowsSoFar += rows.length;
          if (_callback !== null) {
            callEndpoint(rowsEveryQuery, rowsSoFar);
          }
        }
      });
  }

  self.subscribe = function (callback) {
    _callback = callback;

    if (_completed) {
      notifySubscriber();
      return;
    }
    callEndpoint(_rowsEveryQuery, _rowsSoFar);
  };

  self.unsubscribe = function () {
    _callback = null;

  }

  function init() {
    _canvas = document.createElement('canvas');
    _canvas.width = self.info.width;
    _canvas.height = self.info.width;
    _ctx = _canvas.getContext('2d');

    _zoomData = zoomer.getZoomLevel(self.info.zoomLevel);    
    _colorManager = new Colors([0, 110]);

    if (_createdBy !== 'zoom') {
      clearTile();
    }
  }

  init();
};

module.exports = Tile;