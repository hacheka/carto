var Colors = function (range) {
  var self = this;
  var _palette = [[246, 255, 224], [149, 171, 99]];
  var _backgroundColor = [16, 34, 43];
  var _range = range;
  var _division;

  function colorToText(color) {
    return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
  }

  self.getColorForValue = function (value) {
    var color;
    var normalized;
    if (value <= _range[0]) {
      color = _palette[0];
    } else if (value >= _range[1]) {
      color = _palette[1];
    } else {
      normalized = (value - _range[0]) / (_range[1] - _range[0]);
      color = [
        Math.floor(_palette[0][0] + (normalized * (_palette[1][0] - _palette[0][0]))),
        Math.floor(_palette[0][1] + (normalized * (_palette[1][1] - _palette[0][1]))),
        Math.floor(_palette[0][2] + (normalized * (_palette[1][2] - _palette[0][2])))
      ];
    }

    return colorToText(color);
  };

  self.getBackgroundColor = function () {
    return colorToText(_backgroundColor);
  };

  function init() {
    if (typeof range !== 'undefined') {
      _division = (_range[1] - _range[0]) / 4;
    }
  }

  init();
};

module.exports = Colors;