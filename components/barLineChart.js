function barLineChart(){
    var data = [],
        width = 350,
        height = 350,
        margin = {top: 40, right: 75, bottom: 60, left: 75},
        id,  // variable in data to use as identifier
        barsVariables, // list of variables to display as bars
        lineVariables = null, // list of variables to display as lines
        displayName, // // variable in data to use as x axis labels
        transitionTime = 500,
        color = d3.scaleOrdinal(d3.schemeCategory10),	//Color function,
        barColor = d3.scaleOrdinal(d3.schemeCategory10), //bar Color function
        leftAxisFormat = '.2s',
        rightAxisFormat = '.0%',
        legend = { title: '', translateX: 100, translateY: 0 },
        legendContainer = 'legendZone',
        updateData;
    

    function chart(selection){

        // set the ranges
        var xBar = d3.scaleBand().range([0, width])
            .paddingInner(0.5)
            .paddingOuter(0.25);
        var xGroups  = d3.scaleBand()
            .padding(0.05);
        var xLine = d3.scalePoint().range([0, width]).padding(0.5);
        var yBar = d3.scaleLinear().range([height, 0]);
        var yLine = d3.scaleLinear().range([height, 0]);
        
        // Scale the range of the data
        xBar.domain(data.map(function(d) {return d[displayName]; }));
        xGroups.domain(barsVariables).rangeRound([0, xBar.bandwidth()]);
        xLine.domain(data.map(function(d) { return d[displayName]; }));

        // TODO: Just one bar and one line
        // From here on this must be done for each lien and bar variable
        yBar.domain([0, d3.max(data, function(d) {
            return d[barsVariables[0]];
        })]).nice();
        yLine.domain([0, d3.max(data, function(d) {
            return d[lineVariables[0]];
        })]).nice();

        // define the 1st line
        var valueline = d3.line()
            .x(function(d) { return xLine(d[displayName]); })
            .y(function(d) { return yLine(d[lineVariables[0]]); });
        
        selection.each(function(){
            
            var svg = selection.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "multiBar");

            var g = svg.append("g")
                .attr("class", "g-bar")
                .attr("transform", "translate(" + margin.right + "," +
                       margin.top + ")");

            // Draw bars
            var rect = g.selectAll("g")
                .data(data, function(d){ return d[id]; })
                .enter()
                .append("g")
                .attr("class", "bars")
                .attr("id", function(d){
                    return d[displayName]
                })
                .attr("transform", function(d) {
                    return "translate(" + xBar(d[displayName]) + ",0)"; })
  	        .selectAll("rect")
                .data(function(d) {
                    return barsVariables.map(function(key) {
                        return {key: key, value: d[key]};
                    });
                })
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("id", function(d){ return d.key;})
                .style("stroke", "none")
                .attr("x", function(d){ return xGroups(d.key); })
                .attr("width", function(d){ return xGroups.bandwidth(); })
                .attr("y", function(d) { return yBar(d.value); })
                .attr("height", function(d) { return height - yBar(d.value); })
                .attr("fill", function(d) { return barColor(d.key); });
            
            // Add the valueline path.
            g.append("path")
                .data([data])
                .attr("class", "line")
                .style("stroke", "steelblue")
                .attr("fill", "none")
                .attr("d", valueline);

            // Points for line data (JUST ONE LINE)
            var points = g.selectAll("circle.point")
                .data(data, function(d){ return d[id]; })
                .enter()
                .append("circle")
                .attr("class", "point")
                .style("stroke", "crimson")
                .style("stroke-width", 3)
  		.style("fill", "none")
                .attr("cx", function(d){
                    return xLine(d[displayName]);
                })
                .attr("cy", function(d){
                    return yLine(d[lineVariables[0]]);
                })
                .attr("r", function(d){
                    return 2.5;
                });
            
            // Add the X Axis
            var xAxis = d3.axisBottom(xLine)
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "x-axis")
                .call(xAxis);

            var leftAxis = d3.axisLeft(yBar).tickFormat(d3.format(leftAxisFormat));
            var rightAxis = d3.axisRight(yLine).tickFormat(d3.format(rightAxisFormat));
            // Add the Y0 Axis
            g.append("g")
                .attr("class", "axis-left axisSteelBlue")
                .call(leftAxis);

            // Add the Y1 Axis
            g.append("g")
                .attr("class", "axis-right axisRed")
                .attr("transform", "translate( " + width + ", 0 )")
                .call(rightAxis);

            updateData = function(){
                // Scale the range of the data
                xBar.domain(data.map(function(d) {return d[displayName]; }));
                xGroups.domain(barsVariables).rangeRound([0, xBar.bandwidth()]);
                xLine.domain(data.map(function(d) { return d[displayName]; }));

                // TODO: Just one bar and one line
                // From here on this must be done for each lien and bar variable
                yBar.domain([0, d3.max(data, function(d) {
                    return d[barsVariables[0]];
                })]).nice();
                yLine.domain([0, d3.max(data, function(d) {
                    return d[lineVariables[0]];
                })]).nice();

                valueline = d3.line()
                    .x(function(d) { return xLine(d[displayName]); })
                    .y(function(d) { return yLine(d[lineVariables[0]]); });

                var barGroups = d3.select(".g-bar").selectAll(".bars")
                    .data(data, function(d){return d[id]});

                //console.log(barGroups.data())
                var xAxisUpdate = d3.select(".x-axis"),
                    leftAxisUpdate = d3.select(".axis-left"),
                    rightAxisUpdate = d3.select(".axis-right");
                
                leftAxisUpdate
                    .transition(transitionTime)
                    .call(leftAxis);
                rightAxisUpdate
                    .transition(transitionTime)
                    .call(rightAxis);
                xAxisUpdate
                    .transition(transitionTime)
                    .call(xAxis);

                var barGroupsEnter = barGroups.enter()
                    .append("g")
                    .attr("id", function(d){
                        return d[displayName]
                    })
                    .attr("transform", function(d) {
                        return "translate(" + xBar(d[displayName]) + ",0)"; })
  	            .selectAll("rect")
                    .data(function(d) {
                        return barsVariables.map(function(key) {
                            return {key: key, value: d[key]};
                        });
                    })
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("id", function(d){ return d.key;})
                    .style("stroke", "none")
                    .attr("x", function(d){ return xGroups(d.key); })
                    .attr("width", function(d){ return xGroups.bandwidth(); })
                    .attr("y", function(d) { return yBar(d.value); })
                    .attr("height", function(d) { return height - yBar(d.value); })
                    .attr("fill", function(d) { return barColor(d.key); });

                barGroups.exit().remove();

                var lineUpdate = d3.select(".g-bar").select(".line")
                    .data([data])
                    .transition(transitionTime)
                    .attr("d", valueline);
                
                var points = d3.select(".g-bar").selectAll("circle.point")
                    .data(data, function(d){ return d[id]; });

                points
                    .transition(transitionTime)
                    .attr("cx", function(d){
                        return xLine(d[displayName]);
                    })
                    .attr("cy", function(d){
                        return yLine(d[lineVariables[0]]);
                    });

                points.enter()
                    .append("circle")
                    .transition(transitionTime)
                    .attr("class", "point")
                    .style("stroke", "crimson")
                    .style("stroke-width", 3)
  		    .style("fill", "none")
                    .attr("cx", function(d){
                        return xLine(d[displayName]);
                    })
                    .attr("cy", function(d){
                        return yLine(d[lineVariables[0]]);
                    })
                    .attr("r", function(d){
                        return 2.5;
                    });
                
                points.exit().transition(transitionTime).remove();
                
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
    
    chart.lineVariables = function(value) {
        if (!arguments.length) return lineVariables;
        lineVariables = value;
        return chart;
    };

    chart.barsVariables = function(value) {
        if (!arguments.length) return barsVariables;
        barsVariables = value;
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

    
    chart.leftAxisFormat = function(value) {
        if (!arguments.length) return leftAxisFormat;
        leftAxisFormat = value;
        return chart;
    };

    
    chart.rightAxisFormat = function(value) {
        if (!arguments.length) return rightAxisFormat;
        rightAxisFormat = value;
        return chart;
    };

    chart.transitionTime = function(value) {
        if (!arguments.length) return transitionTime;
        transitionTime = value;
        return chart;
    };

    return chart;

}
