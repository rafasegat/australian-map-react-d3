import React, { useRef, useEffect } from "react";
import useResizeObserver from "../useResizeObserver";

const d3 = require("d3");

export default function BarChart({ title, data }) {
  const barChartRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  // let { width, height } = 600; // dimensions || wrapperRef.current.getBoundingClientRect();

  useEffect(() => {
    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 300 };
    let width = 500 - margin.left - margin.right;
    let height = 5000 - margin.top - margin.bottom;

    // set the ranges
    var y = d3.scaleBand().range([height, 0]).padding(0.1);
    var x = d3.scaleLinear().range([0, width]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3.select(barChartRef.current);
    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g");
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // format the data
    // data.forEach(function (d) {
    //   d.sales = +d.sales;
    // });

    // Scale the range of the data in the domains
    x.domain([
      0,
      d3.max(data.features, (d) => parseInt(d.properties.AREA_SQKM, 10))
    ]);
    y.domain(
      data.features.map(function (d) {
        return d.properties.CED_NAME;
      })
    );

    // append the rectangles for the bar chart
    svg
      .selectAll(".bar")
      .data(data.features)
      .enter()
      .append("rect")
      .attr("class", "bar")
      //.attr("x", function(d) { return x(d.sales); })
      .attr("width", function (d) {
        return x(d.properties.CED_NAME);
      })
      .attr("y", function (d) {
        return y(parseInt(d.properties.AREA_SQKM, 10));
      })
      .attr("height", y.bandwidth());

    // add the x Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g").call(d3.axisLeft(y));
  }, [dimensions]);

  return (
    <section>
      <div ref={wrapperRef}>
        <svg ref={barChartRef}></svg>
      </div>
    </section>
  );
}
