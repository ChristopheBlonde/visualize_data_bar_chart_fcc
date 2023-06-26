import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const fetchData = async () => {
  try {
    const data = await fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json",
      {
        method: "GET",
        cache: "default",
        headers: new Headers(),
        mode: "cors",
      }
    );
    const dataJson = await data.json();

    return dataJson.data;
  } catch (error) {
    console.log(error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Document loaded !");

  const dataSet = await fetchData();

  const width = 800;
  const height = 400;
  const barWidth = width / dataSet.length;

  const overlay = d3
    .select(".bar-chart-container")
    .append("div")
    .attr("class", "overlay")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const svg = d3.select("div").append("svg");
  svg.attr("width", width + 100);
  svg.attr("height", height + 80);
  svg.style("background-color", "white");

  const GDP = dataSet.map((elem) => elem[1]);
  const GDPMax = d3.max(GDP);

  const years = dataSet.map((elem) => new Date(elem[0]));
  const yearsMax = d3.max(years);

  const xScale = d3
    .scaleTime()
    .domain([d3.min(years), yearsMax])
    .range([0, width]);

  const xAxis = d3.axisBottom().scale(xScale);

  const linearScale = d3.scaleLinear().domain([0, GDPMax]).range([0, height]);

  const scaleGPD = GDP.map((elem) => {
    return linearScale(elem);
  });

  const yScale = d3.scaleLinear().domain([0, GDPMax]).range([height, 3]);

  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(60,435)");

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60,35)");

  svg
    .append("text")
    .attr("x", -300)
    .attr("y", 90)
    .text("Gross Domestic Product")
    .style("font-style", "italic")
    .style("font-size", "1.2rem")
    .attr("transform", "rotate(-90)");

  svg
    .append("text")
    .attr("x", 450)
    .attr("y", 473)
    .style("font-size", "0.9rem")
    .style("font-style", "italic")
    .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf");

  svg
    .selectAll("rect")
    .data(scaleGPD)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("data-date", (d, i) => dataSet[i][0])
    .attr("data-gdp", (d, i) => dataSet[i][1])
    .attr("x", (d, i) => xScale(years[i]))
    .attr("y", (d) => height - d)
    .attr("width", barWidth)
    .attr("height", (d) => d)
    .attr("transform", "translate(60, 35)")
    .style("fill", "#12C7EB")
    .style("cursor", "pointer")
    .attr("index", (d, i) => i)
    .on("mouseover", (event) => {
      const index = event.target.getAttribute("index");
      const distX = event.target.getAttribute("x");
      const year = dataSet[index][0].slice(0, 4);
      const mounthStr = dataSet[index][0].slice(5, 7);
      const mounth =
        mounthStr === "01"
          ? "Quarter 1"
          : mounthStr === "04"
          ? "Quarter 2"
          : mounthStr === "07"
          ? "Quarter 3"
          : "Quarter 4";
      const value = String(dataSet[index][1]);
      const unity = value.split(".")[1];
      const milion = value.split(".")[0].slice(-3);
      const billion = value.split(".")[0].slice(0, -3);

      event.target.style.opacity = 0.1;
      overlay
        .style("opacity", 0.7)
        .style("left", String(Number(distX) + 230) + "px")
        .text(
          `Date:${year} ${mounth} ${billion ? billion + "," : "0,"}${milion}${
            unity ? "." + unity : ""
          } Billion${billion < 2 ? "" : "s"}`
        );
    })
    .on("mouseout", (event) => {
      event.target.style.opacity = 1;
      overlay.style("opacity", 0);
    });
});
