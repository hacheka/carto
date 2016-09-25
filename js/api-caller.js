var Promise = require('bluebird');
var request = require('superagent');
var sqlQueries = require('./sql-queries');

var ApiCaller = function () {
  var self = this;
  var base = 'https://rambo-test.carto.com:443/api/v2/sql?q=';
  var database = 'public.mnmappluto';

  function parseExtent (extent) {
    var match = extent.match(/BOX\((.+)\)/);
    if (match === null || match.length < 2) {
      throw new Error('Unexpected payload.');
    }
    var rawCoords = match[1].split(/,|\s/);
    return [
      [parseFloat(rawCoords[0]), parseFloat(rawCoords[1])],
      [parseFloat(rawCoords[2]), parseFloat(rawCoords[3])]
    ];
  }

  function flatCoordinates(data) {
    var polygons = this;

    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0]) && data[0].length > 0 && typeof data[0][0] === 'number') {
        if (typeof polygons.push !== 'function') {
          comsole.error('Something weird in the payload!');
        }

        polygons.push(data);
      } else {
        data.forEach(flatCoordinates, polygons);
      }
    }
  }

  self.getWorldExtent = function () {
    return new Promise(function (resolve, reject) {
      request
        .get(base + sqlQueries.worldExtendQuery(database))
        .end(function(err, res){
          if (err) {
            reject(err);
          } else {
            var extent = parseExtent(res.body.rows[0].table_extent);
            resolve(extent);
          }
        });
    });
  };

  self.getGeom = function (extent, limit, offset) {
    return new Promise(function (resolve, reject) {
      request
        .get(base + sqlQueries.tileGeomQuery(database, extent, limit, offset))
        .end(function(err, res){
          var payload;
          var rows = [];

          if (err) {
            reject(err);
          } else {
            payload = JSON.parse(res.text);
            payload.rows.forEach(function (aRow) {
              var flatted = [];
              JSON.parse(aRow.st_asgeojson).coordinates.forEach(flatCoordinates, flatted);
              rows.push({ polygons: flatted, lot: aRow.lot });
            });
            resolve(rows);
          }
        });
    });
  };
};

module.exports = new ApiCaller();