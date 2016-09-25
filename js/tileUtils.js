var TileUtils = function () {
  var self = this;

  /**
   * createTileKey: create the tile key from its characteristics
   * @param {number} tileX: x position of the tile in the grid for the zoom level.
   * @param {number} tileY: y position of the tile in the grid for the zoom level.
   * @param {number} zoomLevel: zoom level to whom zoom belongs. 
   */
  self.createTileKey = function(tileX, tileY, zoomLevel) {
    return '' + zoomLevel + '#' + tileX + '#' + tileY;
  };

  /**
   * getTileInfoFromKey: parse tile info from the tile key 
   * @param {string} key: 
   */
  self.getTileInfoFromKey = function (key) {
    var match = key.match(/(-?\d+)#(-?\d+)#(-?\d+)/);
    if (match === null || match.length < 4) {
      throw new Error('Bad tile key format.');
    }

    return {
      key: key,
      zoomLevel: match[1],
      x: parseFloat(match[2]),
      y: parseFloat(match[3])
    };
  }

};

module.exports = new TileUtils();