
function stackedBarChart(){
    
    var data = [],
        width = 350,
        height = 350,
        margin = {top: 40, right: 75, bottom: 60, left: 75},
        //margin = {top: 100, right: 30, bottom: 30, left: 45},
        stackColors = ['#d8b365','#5ab4ac'], // colour scheme
        lineColors = d3.scaleOrdinal(d3.schemeCategory10),
        stackVariables, // Which variables to stack in bars
        lineVariables, // list of variables to display as lines
        id,  // variable in data to use as identifier
        displayName, // variable in data to use as x axis labels
        transitionTime = 250,
        floatFormat = d3.format('.1f'),
        leftAxisFormat = '.2s',
        rightAxisFormat = '.0%',

        legend = false,
        //legend = {title: 'title', translateX: 100, translateY: 0, items:['item1','item2']}
        legendContainer = 'legendZone',
        updateData;
        
    function chart(selection) {
        var xBar = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
        var yBar = d3.scaleLinear().range([height, 0]);
        if(lineVariables != null){
            var yLine = d3.scaleLinear().rangeRound([height - margin.top, 0]);
            var xLine = d3.scalePoint().range([0, width]).padding(0.5);            
        }
        
        // Scale the range of the data
        xBar.domain(data.map(function(d) {return d[displayName]; }));
        //xGroups.domain(barsVariables).rangeRound([0, xBar.bandwidth()]);
        xLine.domain(data.map(function(d) { return d[displayName]; }));

        yBar.domain(getxDomain).nice();

        // Get max value for all lines

        var maxVals = [];
        lineVariables.forEach(function(v){
            maxVals.push(d3.max(data, function(d){
                //console.log(d[v])
                return d[v]
            }))
        })
        console.log(Math.max(...maxVals))
        yLine.domain([0, Math.max(...maxVals)]).nice();
        // yLine.domain([0, d3.max(data, function(d) {
        //     var maxVals = [];
        //     lineVariables.forEach(function(v){
        //         maxVals.push(d3.max(data, function(d){
        //             return d[v]
        //         }))
        //     })
        //     return Math.max(maxVals);
        // })]).nice();
        //console.log(maxVals)
        
        // valuelines for each line variable
        if(lineVariables != null){
            var valuelines = []
            lineVariables.forEach(function(v){
                valuelines.push(d3.line()
                                .x(function(d) { return xLine(d[displayName]); })
                                .y(function(d) { return yLine(v); })
                               ) 
            })
            
        }

        // Utility functions
        function getxDomain(data){
            // get X domain from stacked data
            // Note it assumes x axis moves with nombre variable
            var xDomain = [];
            data.forEach(function(e){
                xDomain.push(e.stacks[0].name);
            });
            return xDomain;
        }

        function getyDomain(data){
            var yDomain = [];
            data.forEach(function(e){
                yDomain.push(e.stacks[1].end); // End always stores the sum of stacks.
            })
            return [0, d3.max(yDomain)];
        }

        function getStackedBarData(data, stackVariables){
            //console.log(data);
            var stack = d3.stack();
            var stackedData = [];
            data.forEach(function(e){
                //console.log(e)
                stackedData.push({"id": e.id,
                                  "stacks":[{"id": e.id,
                                             "name": e[displayName],
                                             "start": 0,
                                             "end": +e[stackVariables[0]]
                                            },
                                            {"id": e[id],
                                             "name": e[displayName],
                                             "start": +e[stackVariables[0]],
                                             "end": e[stackVariables[1]] +
                                                      e[stackVariables[0]]
                                            }]
                                 });
            });
            return stackedData;
        }
        
        selection.each(function(){
            // Draw chart
            // append svg to selection
            var svg = selection.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            // legend container variable
            var legendContainerId = this.id + "-" + legendContainer,
                barLegendId = this.id + "-barLegend";
            
            var stackedData = getStackedBarData(data, stackVariables);
            xBar.domain(getxDomain(stackedData));
            yBar.domain(getyDomain(stackedData))
            
            // draw axes first so bars are on top of them
            xAxis = d3.axisTop()
                .tickSizeInner(0) // the inner ticks will be of size 0
                .tickSizeOuter(0)
                .scale(xBar),
            yAxis = d3.axisLeft()
                .tickSizeOuter(0)
                .scale(yBar);
            yLineAxis = d3.axisRight(yLine).tickFormat(d3.format(rightAxisFormat));

            // append x axis
            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                // .attr("transform", "translate(0," +  (height -
                //                                       margin.top) + ")")
                .call(xAxis)
                .selectAll("text")    
                .style("text-anchor", "start")
                .attr("dx", "0em")
                .attr("dy", "2em")
                .attr("transform", "rotate(45)");

            // append line (right side) axis 
            svg.append("g")
                .attr("class", "axis-right axisRed")
                .attr("transform", "translate( " + width + ", 0 )")
                .call(yLineAxis);

            // append bars (left side) axis
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis.ticks())
                .append("text")
                .attr("x", 2)
                .attr("y", yBar(yBar.ticks().pop()))
                .attr("dy", "-2em")
                .attr("dx", "-2em")
                .attr("text-anchor", "start")
                .text("Degree");
            
            // g element to contain bars
            svg.append("g").attr("class", "bars"); 
            
            var bar = svg.select(".bars")
                .data(stackedData);
            
            bar.selectAll("g")
                .data(stackedData, function(d){ return d.id;})
                .enter().append("g")
                .attr("id", function(d){return d.id;})
                .attr("class", "stack")
                .selectAll("rect")
                .data(function(d){return d.stacks;}, function(d){return d.id;})
                .enter()
                .append("rect")
                .attr("stroke-dasharray", function(d, i){
                    // id = -1 is a special case (National Averages)
                    // Should be included in configs or something
                    if(d.id == -1){
                        if (i == 1){ // if top bar
                            return (xBar.bandwidth() + yBar(d.start) -
                                    yBar(d.end) + ", " + (xBar.bandwidth()));
                        } else if (i == 0){ //if bottom bar
                            return ("0, " + xBar.bandwidth() + ", " +
                                    2 * (yBar(d.start) - yBar(d.end) + (xBar.bandwidth())));
                        }
                    } else {
                        return "none";
                    }
                })
                .attr("stroke", function(d){
                    if(d.id == -1){
                        return "blue";
                    } else{
                        return "none";
                    }
                })
                .attr("stroke-width", 2)
                .attr("class", "bar")
                .attr("x", function(d) {return xBar(d.name);})
                .attr("y", function(d) {return yBar(d.end);})
                .attr("fill", function(d,i) { return stackColors[i];})
                .attr("width", xBar.bandwidth())
                .attr("height", function(d,i) {return yBar(d.start) - yBar(d.end);});

            // Add the valueline path.
            if (lineVariables != null){
                valuelines.forEach(function (valueline){
                    svg.append("path")
                        .data([data])
                        .attr("class", "line")
                        .style("stroke", "steelblue")
                        .attr("fill", "none")
                        .attr("d", valueline);

                    // Points for line data (JUST ONE LINE)
                    var points = svg.selectAll("circle.point")
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
                })

            }
            
            // Draw legend box and items
            if (legend !== false & typeof legend === "object") {
                var legendZone = svg.append('g')
                                .attr("id", legendContainerId)
                                .attr("class", "legend");
                
                if (legend.title) {
                    var title = legendZone.append("text")
                        .attr("class", "title")
                        .attr('transform',
                                  `translate(${legend.translateX},${legend.translateY})`)
                        .attr("x", width - 70)
                        .attr("y", 10)
                        .attr("font-size", "12px")
                        .attr("fill", "#737373")
                        .text(legend.title);
                }
                
                var barLegend = legendZone.append("g")
                    .attr("id", barLegendId)
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform',
                          `translate(${legend.translateX},${legend.translateY + 5})`);
                
                // Create rectangles markers
                barLegend.selectAll('rect')
                    .data(legend.items.reverse())
                    .enter()
                    .append("rect")
                    .attr("x", width - 55)
                    .attr("y", function(d, i){return i * 20 + 20; })
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", function(d, i){ return stackColors[i];})
                
                // Create labels
                barLegend.selectAll('text')
                    .data(legend.items.reverse())
                    .enter()
                    .append("text")
                    .attr("x", width - 40)
                    .attr("y", function(d, i){return i * 20 + 20; })
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .attr("dy", ".75em")
                    .attr("text-anchor", "start")
                    .text(function(d) { return d; });
            }

            updateData = function(){
                var stackedData = getStackedBarData(data, stackVariables);
                
                x.domain(getxDomain(stackedData));
                y.domain(getyDomain(stackedData));

                var barsUpdate = d3.select(".bars").selectAll(".stack")
                    .data(stackedData, function(d){return d.id;}),
                    xAxisUpdate = d3.select(".axis--x"),
                    yAxisUpdate = d3.select(".axis--y");

                yAxisUpdate.transition(t).call(yAxis);
                
                xAxisUpdate.transition(t).call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "start")
                    .attr("dx", "0em")
                    .attr("dy", "2em")
                    .attr("transform", "rotate(45)");                    

                var t = barsUpdate.transition()
                    .duration(transitionTime);

                var barsEnter= barsUpdate.enter()
                    .append("g")
                    .attr("id", function(d){return d.id;})
                    .attr("class", "stack")
                    .selectAll("rect")
                    .data(function(d){return d.stacks;}, function(d){return d.id;})
                    .enter()
                    .append("rect")
                    .transition(t)
                    .attr("class", "bar")
                    .attr("x", function(d) {return x(d.name);})
                    .attr("y", function(d, i) {return y(d.end);})
                    .attr("fill", function(d,i) {return stackColors[i];})
                    .attr("width", x.bandwidth())
                    .attr("height", function(d,i) {return y(d.start) - y(d.end);});

                barsUpdate.selectAll("rect")
                    .transition(t)
                    .attr("x", function(d) {return x(d.name);})
                    .attr("y", function(d, i) {return y(d.end);})
                    .attr("fill", function(d,i) {return stackColors[i];})
                    .attr("width", x.bandwidth())
                    .attr("height", function(d,i) {return y(d.start) - y(d.end);})
                    .attr("stroke-dasharray", function(d, i){
                        if(d.id == -1){
                            if (i == 1){ // if top bar
                                return (x.bandwidth() + y(d.start) - y(d.end) +
                                        ", " + (x.bandwidth()));
                            } else if (i == 0){ //if bottom bar
                                return ("0, " + x.bandwidth() + ", " +
                                        2 * (y(d.start) - y(d.end) + (x.bandwidth())));
                            }
                        } else{
                            return "none";
                        }
                    })
                    .attr("stroke", function(d){
                        if(d.id == -1){
                            return "blue";
                        } else{
                            return "none";
                        }
                    })
                    .attr("stroke-width", 2);
                
                barsUpdate.exit().style('opacity', 1)
                    .transition(t)
                    .style('opacity', 0)
                    .remove();
            }
        });
    }

    // Getters and setters

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

    chart.stackVariables = function(value) {
        if (!arguments.length) return stackVariables;
        stackVariables = value;
        return chart;
    };

    chart.id = function(value) {
        if (!arguments.length) return id;
        id = value;
        return chart;
    };

    chart.displayName = function(value) {
        if (!arguments.length) return displayName;
        displayName = value;
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
    
    chart.transitionTime = function(value) {
        if (!arguments.length) return transitionTime;
        transitionTime = value;
        return chart;
    };
    
    chart.lineVariables = function(value) {
        if (!arguments.length) return lineVariables;
        lineVariables = value;
        return chart;
    };


    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    return chart;

}
