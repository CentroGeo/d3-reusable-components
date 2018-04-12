function horizontalBarChart(){
    var data = [],
        width = 350,
        height = 350,
        margin = {top: 40, right: 75, bottom: 60, left: 75},
        id,  // variable in data to use as identifier
        barsVariable, // list of variables to display as bars
        displayName, // // variable in data to use as x axis labels
        transitionTime = 500,
        barColor = d3.scaleOrdinal(d3.schemeCategory10), //bar Color function
        axisFormat = d3.format('.1f'),
        legend = { title: '', translateX: 100, translateY: 0 },
        legendContainer = 'legendZone',
        doHighlight,
        highlightValue,
        updateData;

    function chart(selection){
        var svg = selection.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");
        
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleBand().range([height, 0]).paddingInner(0.1);

        var g = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        selection.each(function(){
            console.log(data)
            
  	    x.domain([0, d3.max(data, function(d) { return d[barsVariable]; })]);
            y.domain(data.map(function(d) { return d[displayName]; })).padding(0.1);

            g.append("g")
                .attr("class", "x axis")
       	        .attr("transform", "translate(0," + height + ")")
      	        .call(d3.axisBottom(x)
                      .ticks(5)
                      .tickFormat(axisFormat)
                      .tickSizeInner([-height]));

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "horizontal-bar")
                .attr("id", function(d){
                    return d[displayName].replace(/\s+/g, '-')
                })
                .attr("x", 0)
                .attr("height", y.bandwidth())
                .attr("y", function(d) { return y(d[displayName]); })
                .attr("width", function(d) { return x(d[barsVariable]); })
                .on("mousemove", function(d){
                    tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .html((d.area) + "<br>" + "£" + (d.value));
                })
    		.on("mouseout", function(d){ tooltip.style("display", "none");});

            doHighlight = function(){
                //console.log("heeeeey")
                selection.selectAll(".horizontal-bar")
                    .each(function(){
                        //console.log("heeeeey")
                        d3.select(this)
                            //.attr("class", "highlighted-bar")
                            .style("fill", function(d){
                                return d[displayName] === highlightValue ? "red":
                                    "steelblue" //TODO: this should not be hardcoded
                            })
                    })
            }
            
        })
    }
     chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.id = function(value) {
        if (!arguments.length) return id;
        id = value;
        return chart;
    };

    chart.barsVariable = function(value) {
        if (!arguments.length) return barsVariable;
        barsVariable = value;
        return chart;
    };

    
    chart.displayName = function(value) {
        if (!arguments.length) return displayName;
        displayName = value;
        return chart;
    };


    chart.transitionTime = function(value) {
        if (!arguments.length) return transitionTime;
        transitionTime = value;
        return chart;
    };    

    chart.color = function(value) {
        if (!arguments.length) return color;
        color = value;
        return chart;
    };

    chart.legend = function(value) {
        if (!arguments.length) return legend;
        legend = value;
        return chart;
    };

    chart.legendContainer = function(value) {
        if (!arguments.length) return legendContainer;
        legendContainer = value;
        return chart;
    };

    chart.data = function(value) {        
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.highlight = function(value) {
        console.log(value)
        if (!arguments.length) return highlightValue;
        highlightValue = value;
        if (typeof doHighlight === 'function') doHighlight();
        return chart;
    };
    
    // chart.highlightValue = function(value) {
    //     console.log("heeeey")
    //     if (!arguments.length) return highlightValue;
    //     highlightValue = value;
    //     return chart;
    // };
    
    return chart;
}
