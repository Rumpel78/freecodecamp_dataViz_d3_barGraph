(function () {
  'use strict';

  var config = {
    canvasWidth: '1050',
    canvasHeight: '650',
    padding: [80, 100, 40, 40]
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var BarChart = function () {
    function BarChart(parentElement, config, cb) {
      classCallCheck(this, BarChart);

      this.config = config;
      this.innerWidth = config.canvasWidth - config.padding[0] - config.padding[2];
      this.innerHeight = config.canvasHeight - config.padding[1] - config.padding[3];
      this.startX = config.padding[0];
      this.startY = config.padding[1];
      this.endX = config.canvasWidth - config.padding[2];
      this.endY = config.canvasHeight - config.padding[3];

      console.log(this.startX, this.startY, this.innerWidth, this.innerHeight, this.endX, this.endY);

      var canvas = this.createSvgCanvas(parentElement);
      this.svg = canvas.canvas;
      this.dataGroup = canvas.dataGroup;

      // Define the div for the tooltip http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
      this.tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

      // Callback onLoaded
      cb(this);
    }

    createClass(BarChart, [{
      key: 'getData',
      value: function getData(url, cb) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function () {
          if (xobj.readyState === 4 && xobj.status === 200) {
            console.log('BarGraph.getData: Data loaded');
            var dataRaw = JSON.parse(xobj.responseText);
            cb(dataRaw);
          }
        };
        xobj.send(null);
      }
    }, {
      key: 'setData',
      value: function setData(data) {
        // Store data
        this.data = data;
        // Calculate maximum y value
        var maxY = d3.max(this.data, function (d) {
          return d[1];
        });

        // Create data scales
        this.scaleX = d3.scale.ordinal().domain(data.map(function (d) {
          return d[0];
        })).rangeBands([0, this.innerWidth], 0, 0);
        this.scaleY = d3.scale.linear().domain([0, maxY]).range([this.innerHeight, 0]);
        // Create x axis
        var minDate = new Date(d3.min(this.data, function (d) {
          return d[0];
        }));
        var maxDate = new Date(d3.max(this.data, function (d) {
          return d[0];
        }));

        var scaleXaxis = d3.time.scale().domain([minDate, maxDate]).range([0, this.innerWidth]);
        this.axisX = d3.svg.axis().scale(scaleXaxis).ticks(20).orient('bottom');

        // Create y axis
        this.axisY = d3.svg.axis().scale(this.scaleY).ticks(20).orient('left');
      }
    }, {
      key: 'showData',
      value: function showData() {
        var _this = this;

        var bars = this.dataGroup.selectAll('p').data(this.data);
        var dateFormat = d3.time.format('%Y - %B');

        bars.exit().remove();

        bars.enter().append('rect').attr('x', function (d) {
          return _this.scaleX(d[0]);
        }).attr('y', function (d) {
          return _this.scaleY(d[1]);
        }).attr('height', function (d) {
          return _this.innerHeight - _this.scaleY(d[1]);
        }).attr('width', this.scaleX.rangeBand()).attr('class', 'bar')
        // Mouseover Tooltip
        .on('mouseover', function (d) {
          var date = new Date(d[0]);
          _this.tooltip.transition().duration(200).style('opacity', 0.9);
          _this.tooltip.style('left', d3.event.pageX + 10 + 'px').style('top', d3.event.pageY - 30 + 'px');
          _this.tooltip.html('<strong>$' + d[1].toLocaleString('en') + ' Billions</strong><br>\n                               ' + dateFormat(date));
        }).on('mouseout', function () {
          _this.tooltip.transition().duration(500).style('opacity', 0);
        });

        // bars. change
        this.svg.append('g').attr('class', 'x axis').attr('transform', 'translate(' + this.startX + ', ' + this.endY + ')').call(this.axisX);
        this.svg.append('g').attr('class', 'y axis').attr('transform', 'translate(' + this.startX + ', ' + this.startY + ')').call(this.axisY);
      }
    }, {
      key: 'createSvgCanvas',
      value: function createSvgCanvas(parentElement) {
        var canvas = d3.select(parentElement).append('svg').attr('width', this.config.canvasWidth).attr('height', this.config.canvasHeight);
        var dataGroup = canvas.append('g').attr('transform', 'translate(' + this.startX + ', ' + this.startY + ')');
        return { canvas: canvas, dataGroup: dataGroup };
      }
    }]);
    return BarChart;
  }();

  var barChart = new BarChart('body', config, function (b) {
    console.log('BarChart constructed');
    b.getData('datasets/GDP-data.json', function (d) {
      console.log('getData finished');
      b.setData(d.data);
      b.showData();
      console.log('ShowData finished');
    });
  });

}());
//# sourceMappingURL=main.js.map