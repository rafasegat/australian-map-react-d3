/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from "react";
import useResizeObserver from "../useResizeObserver";
import "./Map.scss";

const d3 = require("d3");

const formatNumber = (number) =>
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function Map({ title, data }) {
  const mapRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const arrayColors = ["#C6E4E8", "#90CED6", "#57BCC7", "#00ABBA", "#009EAD"];

  // it will be triggered initially and on every data change
  useEffect(() => {
    const map = d3.select(mapRef.current);
    // lets remove all tooltips and add
    // the current one
    d3.selectAll(".tooltip").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip hidden");
    // use resized dimensions
    // but fall back to getBoundingClientRect, if no dimensions yet.
    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    // projects geo-coordinates on a 2D plane
    const projection = d3
      .geoMercator()
      .rotate([0, -14])
      // if selectedDistrict has data, we will 'zoom' in the selected data, otherwise select all data
      .fitSize([width, height], data)
      .precision(100);

    // map controls events
    d3.select("#btn-zoomin").on("click", () => {
      zoom.scaleBy(map.transition().duration(500), 1.5);
    });
    d3.select("#btn-zoomout").on("click", () => {
      zoom.scaleBy(map.transition().duration(500), -1);
    });
    d3.select("#btn-recentre").on("click", () => {
      zoom.scaleBy(map.transition().duration(500), -10);
    });

    // takes geojson data, transforms that into the d attribute of a path element
    const pathGenerator = d3.geoPath().projection(projection);

    // select min and max of our array
    const min = d3.min(data.features, (d, i) =>
      parseInt(d.properties.AREA_SQKM)
    );
    const max = d3.max(data.features, (d, i) =>
      parseInt(d.properties.AREA_SQKM)
    );
    const colorScale = d3
      .scaleLinear()
      .domain([min, max])
      .range([arrayColors[0], arrayColors[4]]);

    // build our legend
    const legend = d3
      .select(legendRef.current)
      .attr("class", "legend")
      .selectAll("li")
      .data(arrayColors)
      .enter()
      .append("li");

    //Inside every 'legend', insert a rect
    legend.append("span").text((d, i) => {
      if (i === 0) return "Low";
      if (i === 2) return "Medium";
      if (i === 4) return "High";
      return "";
    });
    legend.append("div").style("background", (d) => d);

    // zoom functions
    const zoomed = (event) => {
      map
        .selectAll("path") // To prevent stroke width from scaling
        .attr("transform", event.transform);
    };
    const zoom = d3
      .zoom()
      .scaleExtent([1, 40])
      .translateExtent([
        [0, 0],
        [width, height]
      ])
      .extent([
        [0, 0],
        [width, height]
      ])
      .on("zoom", zoomed);

    // render each district
    map
      .selectAll(".district") // selectAll selects all matching elements. Each function takes a single argument which specifies the selector string
      .data(data.features) // source of data
      .join("path") //  data join lets you specify exactly what happens to the DOM as data changes
      .on("click", (event, el) => {
        onClickDistrict(el.properties.SvcDistr);
      })
      .on("mousemove", function (event, el) {
        const html = `<ul>
                        <li>
                          <span>Name</span>
                          <span>${el.properties.CED_NAME}</span>
                        </li>
                        <li>
                          <span>Area</span>
                          <span>${formatNumber(
                            el.properties.AREA_SQKM
                          )} SQKM</span>
                        </li>
                      </ul>`;

        // Tooltip
        tooltip
          .classed("hidden", false)
          .style("top", event.pageY - 5 + "px")
          .style("left", event.pageX + 30 + "px")
          .html(html);
      })
      .on("mouseover", (el) => {})
      .on("mouseout", function (d, i) {
        tooltip.classed("hidden", true);
      })
      .attr("class", (district) => {
        return `district`;
      })
      .attr("district", (district) => {
        const districtClass = district.properties.SvcDistr;
        return districtClass;
      })
      .style("fill", function (el, i) {
        return colorScale(el.properties.AREA_SQKM);
      })
      .attr("d", (feature) => pathGenerator(feature));

    map.call(zoom);
  }, [dimensions]);

  return (
    <section>
      <h2>{title}</h2>
      <div ref={wrapperRef} className="map">
        <div className="d3-map">
          <svg ref={mapRef} className="svg-map" />
          <div ref={tooltipRef} className="tooltip hidden"></div>
        </div>
        <div className="d3-legend">
          <ul className="legend na">
            <li>
              <span>NA</span>
              <div style={{ background: "#D1D2D4" }}></div>
            </li>
          </ul>
          <div>
            <ul ref={legendRef} className="legend"></ul>
            <div
              className="legend-gradient"
              style={{
                background: arrayColors[0],
                background: `linear-gradient(90deg, ${arrayColors[0]} 0%, ${arrayColors[4]} 100%)`
              }}
            ></div>
          </div>
        </div>
        <div className="map-controls">
          <button id="btn-recentre" icon="recentre" ariaLabel="Recentre Map">
            Recentre
          </button>
          <button id="btn-zoomin" icon="plus" ariaLabel="Zoom In Map">
            +
          </button>
          <button id="btn-zoomout" icon="minus" ariaLabel="Zoom Out Map">
            -
          </button>
        </div>
      </div>
    </section>
  );
}
