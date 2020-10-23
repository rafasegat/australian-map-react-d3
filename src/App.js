import React from "react";
import Map from "./components/Map/Map";
import BarChart from "./components/BarChart/BarChart";
import "./styles.css";

//Data
import geoJSONCED from "./assets/data/ced_australia.districts.json";
// import geoJSONSSC from "./assets/data/ssc_australia.districts.json";

export default function App() {
  return (
    <div className="App">
      <h1>React (hooks) + D3.js: Map of Australia</h1>
      <p>Featuring cloropeth colors, tooltip, scroll zoom and map control</p>
      <p>
        Source:{" "}
        <a
          href="https://datapacks.censusdata.abs.gov.au/datapacks"
          target="_blank"
        >
          https://datapacks.censusdata.abs.gov.au/datapacks/
        </a>
      </p>
      <Map title="Commonwealth Electoral Division" data={geoJSONCED} />
      <BarChart title="" data={geoJSONCED} />
    </div>
  );
}
