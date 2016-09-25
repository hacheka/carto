// "Types" used in the application

// COORDINATES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** coords: used for world coordinates.
 *  x: easting coordinate.
 *  y: northing coordinate.
 */
coords = [x, y];

/** extent: used for rects in world coordinates */
extent = [[x0, y0], [x1, y1]];

/** worldSize: width and height of a rect in world coordinates. */
worldSize = [w, h];

/** point: used for pixel positions. */
point = [x, y]; // For screen points

/** rect: used for rects in canvas. Measured in pixels */
rect = [[x0, y0], [x1, y1]];

/** screenSize: width and height of a rect in pixel coordinates. */
screenSize = [w, h];


// TILES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** tileInfo: minimum info of a tileInfo.
 *  key {string}: tile key.
 *  zoomLevel {number}: zoom level where this tile belongs to.
 *  x {number}: x position in the tile grid,
 *  y {number}: y position in the tile grid.
 *  width: width in pixels
 */

/** extendedTileInfo: completes tileInfo with additional data.
 *  extent {extent}: world coordinates of the tile rect.
 */


