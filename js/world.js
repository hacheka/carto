var apiCaller = require('./api-caller');

var World = function () {
  var self = this;
  var _extent;
  var _size;

  self.fetchExtension = function () {
    return new Promise(function (resolve, reject) {
      if (typeof _extent !== 'undefined') {
        resolve();
      } else {
        apiCaller.getWorldExtent()
          .then(function(data) {
            _extent = data;
            _size = {
              width: Math.abs(_extent[0][0] - _extent[1][0]),
              height: Math.abs(_extent[0][1] - _extent[1][1])
            };
            resolve();
          })
          .catch(function (err) {
            reject();
          });
      }
    });
  };

  self.calculateInitialCamera = function (viewport) {
    var normalizedCanvasHeight;
    var normalizedCanvasWidth;
    var normalizedWorlHeight;
    var normalizedWorldWidth;
    var cameraWidth;
    var cameraHeight;

    if (viewport.height > viewport.width) {
      normalizedCanvasHeight = 1;
      normalizedCanvasWidth = viewport.width / viewport.height;
    } else {
      normalizedCanvasWidth = 1;
      normalizedCanvasHeight = viewport.height / viewport.width;
    }

    if (_size.height > _size.width) {
      normalizedWorldHeight = 1;
      normalizedWorldWidth = _size.width / _size.height;
    } else {
      normalizedWorldWidth = 1;
      normalizedWorldHeight = _size.height / _size.width;
    }

    // Expanding map to fill as much screen space as possible 
    var expandedWidth = normalizedCanvasWidth;
    var expandedHeight = normalizedWorldHeight * normalizedCanvasWidth / normalizedWorldWidth;

    expansion = expandedHeight > normalizedCanvasHeight ? 'width' : 'height';

    // Camera dimensions in projection system
    if (expansion === 'width') {
      cameraWidth = _size.width;
      cameraHeight = _size.width * viewport.height / viewport.width;
    } else {
      cameraWidth = _size.height * viewport.width / viewport.height;
      cameraHeight = _size.height;    
    }

    // Camera center in coordinates
    var cameraCenter =  [
      _extent[0][0] + _size.width / 2,
      _extent[0][1] + _size.height / 2
    ];

    return {
      center: cameraCenter,
      size: [cameraWidth, cameraHeight]
    };
  };

  Object.defineProperty(self, 'size', {
    get: function () {
      if (typeof _size === 'undefined') {
        throw new Error('World size is only available after calling fetchExtension().');
      }
      return _size;
    }
  });

  Object.defineProperty(self, 'extent', {
    get: function () {
      if (typeof _extent === 'undefined') {
        throw new Error('World extension is only available after calling fetchExtension().');
      }
      return _extent;
    }
  });

};

module.exports = World;