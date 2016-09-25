var Tile = require('./tile');
var tileUtils = require('./tileUtils');

var TileManager = function (zoomer) {
  var self = this;
  var _zoomer = zoomer;
  var _world;
  var _tileSize = 256;
  var _tiles = {};

  /**
   * createNewTile: creates a new tile.
   * @param {tileInfo} info - tile info used for creating a new tile
   * @param {string} lastMove - what movement created the tile
   */
  function createNewTile(info, lastMove) {
    var zoomLevel = _zoomer.getZoomLevel(info.zoomLevel);
    var origin = [
      _world.extent[0][0] + (info.x * _tileSize * zoomLevel.groundResolution),
      _world.extent[0][1] + (info.y * _tileSize * zoomLevel.groundResolution )
    ];
    var tileExtent = [[
      origin[0],
      origin[1]
    ], [
      origin[0] + (_tileSize * zoomLevel.groundResolution),
      origin[1] + (_tileSize * zoomLevel.groundResolution)
    ]];
    info.extent = tileExtent;
    info.width = _tileSize;

    return new Tile(info, lastMove);
  }

  self.getVisibleTiles = function (coords, zoomLevel) {
    var lb = coords[0];
    var rt = coords[1];
    var left = Math.floor((lb[0] - _world.extent[0][0]) / _tiles[zoomLevel].widthPerTile);
    var bottom = Math.floor((lb[1] - _world.extent[0][1]) / _tiles[zoomLevel].widthPerTile); 
    var right = Math.floor((rt[0] - _world.extent[0][0]) / _tiles[zoomLevel].widthPerTile);
    var top = Math.floor((rt[1] - _world.extent[0][1]) / _tiles[zoomLevel].widthPerTile);
    var visibleTiles = [];

    for (var x = left; x <= right; x++)
    {
      for (var y = bottom; y <= top; y++) {
        visibleTiles.push({ x: x, y: y });
      }
    }

    return visibleTiles.map(function (tile) { return tileUtils.createTileKey(tile.x, tile.y, zoomLevel)}).sort();
  };

  self.getTile = function (tileKey) {
    var info = tileUtils.getTileInfoFromKey(tileKey);
    if (typeof _tiles[info.zoomLevel][tileKey] === 'undefined') {
      throw new Error('Tried to get a non existent tile.');
    }
    return theTile = _tiles[info.zoomLevel][tileKey];
  }

  self.subscribe = function (tileKeyToSubscribe, lastMove, callback) {
    var info = tileUtils.getTileInfoFromKey(tileKeyToSubscribe);
    var theTile;

    if (typeof _tiles[info.zoomLevel][tileKeyToSubscribe] === 'undefined') {
      _tiles[info.zoomLevel][tileKeyToSubscribe] = createNewTile(info, lastMove);
    }
    theTile = _tiles[info.zoomLevel][tileKeyToSubscribe];
    theTile.subscribe(callback);
  };

  self.unsubscribe = function (tileKey) {
    var info = tileUtils.getTileInfoFromKey(tileKey);
    var theTile;

    if (typeof _tiles[info.zoomLevel][tileKey] !== 'undefined') {
      theTile = _tiles[info.zoomLevel][tileKey];
      theTile.unsubscribe();
    }
  };
  

  self.init = function (world) {
    var maxDimension = Math.max(world.size.width, world.size.height);
    _world = world;
    for (var i = 1; i <= _zoomer.zoomLevels; i++) {
      var zoom = _zoomer.getZoomLevel(i);
      _tiles[i] = {};
      _tiles[i].numberOfTiles = Math.ceil((maxDimension * zoom.pixelsPerMeter) / _tileSize);
      _tiles[i].widthPerTile = _tileSize * zoom.groundResolution;
    }
  };
};

module.exports = TileManager;