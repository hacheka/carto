/** 
 * Converter: translate world coordinates to screen coordinates or viceversa
*/

var Converter = function () {
    var self = this;

    /**
     * fromWorldToScreen: converts from world coordinates to screen coordinates.
     * @param {coords} worldCoords - world coordinates to convert.
     * @param {extent} screenCoords - world coordinates of screen.
     * @param {number} groundResolution - amount of meters per pixel
     * @returns {point}: position in pixels of the world coords relative to the given screen.
     */
    self.fromWorldToScreen = function (worldCoords, screenCoords, groundResolution) {
        var relativeCoords = [
            worldCoords[0] - screenCoords[0][0],
            worldCoords[1] - screenCoords[0][1]
        ];

        return [
            relativeCoords[0] / groundResolution,
            relativeCoords[1] / groundResolution
        ];
    };
};

module.exports = new Converter();