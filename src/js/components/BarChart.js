export default class BarChart {
  constructor(parentElement, config, cb) {
    // Save config and calculate usefull shortcuts
    this.config = config;
    this.innerWidth = config.canvasWidth - config.padding[0] - config.padding[2];
    this.innerHeight = config.canvasHeight - config.padding[1] - config.padding[3];
    this.startX = config.padding[0];
    this.startY = config.padding[1];
    this.endX = config.canvasWidth - config.padding[2];
    this.endY = config.canvasHeight - config.padding[3];

    // Store refs to elements
    const canvas = this.createSvgCanvas(parentElement);
    this.svg = canvas.canvas;
    this.dataGroup = canvas.dataGroup;

    // Define the div for the tooltip, see http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Callback onLoaded
    cb(this);
  }

  getData(url, cb) {
    // Get data per Request
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === 200) {
        console.log('BarGraph.getData: Data loaded');
        const dataRaw = JSON.parse(xobj.responseText);
        cb(dataRaw);
      }
    };
    xobj.send(null);
  }

  setData(data) {
    // Store data
    this.data = data;
    // Calculate maximum y value
    const maxY = d3.max(this.data, d => d[1]);

    // Create data scales
    this.scaleX = d3.scale.ordinal()
                    .domain(data.map(d => d[0]))
                    .rangeBands([0, this.innerWidth], 0, 0);
    this.scaleY = d3.scale.linear()
                    .domain([0, maxY])
                    .range([this.innerHeight, 0]);
    // Create x axis
    const minDate = new Date(d3.min(this.data, d => d[0]));
    const maxDate = new Date(d3.max(this.data, d => d[0]));

    const scaleXaxis = d3.time.scale()
                    .domain([minDate, maxDate])
                    .range([0, this.innerWidth - this.scaleX.rangeBand()]);
    this.axisX = d3.svg.axis()
                    .scale(scaleXaxis)
                    .ticks(20)
                    .orient('bottom');
    this.svg.append('text')
        .attr('x', this.config.canvasWidth / 2)
        .attr('y', this.config.canvasHeight - this.config.padding[3] / 2 + 20)
        .style('text-anchor', 'middle')
        .text(this.config.xAxisText);

    // Create y axis
    this.axisY = d3.svg.axis()
                    .scale(this.scaleY)
                    .ticks(20)
                    .orient('left');
    this.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.startY)
        .attr('y', this.startX+ 20)
        .style('text-anchor', 'end')
        .text(this.config.yAxisText);
  }

  showData() {
    // Format for tooltip
    const dateFormat = d3.time.format('%Y - %B');

    // D3js select, exit, enter, update
    const bars = this.dataGroup.selectAll('p').data(this.data);

    bars.exit().remove();

    bars.enter()
        .append('rect')
        .attr('x', (d) => { return this.scaleX(d[0]); })
        .attr('y', (d) => { return this.scaleY(d[1]); })
        .attr('height', (d) => { return this.innerHeight - this.scaleY(d[1]); })
        .attr('width', this.scaleX.rangeBand())
        .attr('class', 'bar')
        // Mouseover Tooltip
        .on('mouseover', d => {
          const date = new Date(d[0]);
          this.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
          this.tooltip.style('left', `${d3.event.pageX + 10}px`)
                .style('top', `${d3.event.pageY - 30}px`);
          this.tooltip.html(`<strong>$${d[1].toLocaleString('en')} Billions</strong><br>
                               ${dateFormat(date)}`);
        })
        .on('mouseout', () => {
          this.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
        // Mouseover tooltip end

    // finaly add x and y axis
    this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${this.startX}, ${this.endY})`)
            .call(this.axisX);
    this.svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.startX}, ${this.startY})`)
            .call(this.axisY);
  }

  createSvgCanvas(parentElement) {
    // Creates basic svg canvas
    const canvas = d3.select(parentElement)
      .append('svg')
      .attr('width', this.config.canvasWidth)
      .attr('height', this.config.canvasHeight);
    const dataGroup = canvas.append('g')
      .attr('transform', `translate(${this.startX}, ${this.startY})`);
    return { canvas, dataGroup };
  }

}
