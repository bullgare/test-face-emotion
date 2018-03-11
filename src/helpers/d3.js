import * as d3 from 'd3';

/************ d3 code for barchart *****************/

export default class D3 {
  constructor(selector, emotionData, ec) {
    this.margin = {top : 20, right : 20, bottom : 10, left : 40};
    this.width = 400 - this.margin.left - this.margin.right;
    this.height = 100 - this.margin.top - this.margin.bottom;

    this.barWidth = 30;

//  let formatPercent = d3.format(".0%");

    this.x = d3.scaleLinear()
        .domain([0, ec.getEmotions().length]).range([this.margin.left, this.width + this.margin.left]);

    this.y = d3.scaleLinear()
        .domain([0,1]).range([0, this.height]);

    d3.select(selector + ' svg').remove();

    this.svg = d3.select(selector).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);

    let x = this.x;
    let y = this.y;
    let height = this.height;
    let barWidth = this.barWidth;

    this.svg.selectAll("rect").
    data(emotionData).
    enter().
    append("svg:rect").
    attr("x", function(datum, index) { return x(index); }).
    attr("y", function(datum) { return height - y(datum.value); }).
    attr("height", function(datum) { return y(datum.value); }).
    attr("width", barWidth).
    attr("fill", "#2d578b");

    this.svg.selectAll("text.labels").
    data(emotionData).
    enter().
    append("svg:text").
    attr("x", function(datum, index) { return x(index) + barWidth; }).
    attr("y", function(datum) { return height - y(datum.value); }).
    attr("dx", -barWidth/2).
    attr("dy", "1.2em").
    attr("text-anchor", "middle").
    text(function(datum) { return datum.value;}).
    attr("fill", "white").
    attr("class", "labels");

    this.svg.selectAll("text.yAxis").
    data(emotionData).
    enter().append("svg:text").
    attr("x", function(datum, index) { return x(index) + barWidth; }).
    attr("y", height).
    attr("dx", -barWidth/2).
    attr("text-anchor", "middle").
    attr("style", "font-size: 12").
    text(function(datum) { return datum.emotion;}).
    attr("transform", "translate(0, 18)").
    attr("class", "yAxis");
  }

  updateData(data) {
    let height = this.height;
    let y = this.y;

    let rects = this.svg.selectAll("rect")
        .data(data)
        .attr("y", function(datum) { return height - y(datum.value); })
        .attr("height", function(datum) { return y(datum.value); });
    let texts = this.svg.selectAll("text.labels")
        .data(data)
        .attr("y", function(datum) { return height - y(datum.value); })
        .text(function(datum) { return datum.value.toFixed(1);});

    // enter
    rects.enter().append("svg:rect");
    texts.enter().append("svg:text");

    // exit
    rects.exit().remove();
    texts.exit().remove();
  }

  resetData(data = []) {
    if (!data) {
      return;
    }
    this.updateData(data.map(item => {
      item.value = 0;
      return item;
    }))
  }
}
