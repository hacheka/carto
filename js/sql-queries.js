var SqlQueries = function () {
  var self = this;

  self.worldExtendQuery = function (database) {
    return 'select ST_Extent(ST_Transform(the_geom, 3857)) as table_extent from ' + database;
  };

  self.tileGeomQuery = function (database, extent, limit, offset) {
    var query = '';
    query += 'select ST_AsGeoJSON(ST_Transform(the_geom, 3857)), lot ';
    query += 'FROM ' + database + ' ';
    query += 'WHERE ST_Intersects(ST_Transform(the_geom, 3857), ';
    query += 'ST_MakeEnvelope(' + extent[0][0] + ',' + extent[0][1] + ',';
    query += extent[1][0] + ',' + extent[1][1]+ ', 3857)) ';
    query += 'LIMIT ' + limit + ' OFFSET ' + offset;

    return query;
  };
};

module.exports = new SqlQueries();