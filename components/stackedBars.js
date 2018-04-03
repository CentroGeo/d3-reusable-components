
function stackedBarChart(){
    
    var data = [],
        width = 350,
        height = 350,
        //margin = {top: 100, right: 30, bottom: 30, left: 45},
        margin = {top: 40, right: 75, bottom: 60, left: 75},
        stackColors = ['#d8b365','#5ab4ac'], // colour scheme
        stackVariables, // Which variables to stack in bars
        id,  // variable in data to use as identifier
        displayName, // variable in data to use as display name for each bar
        transitionTime = 250,
        floatFormat = d3.format('.1f'),
        updateData;
        
    function chart(selection) {
        var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
        var y = d3.scaleLinear().rangeRound([height - margin.top, 0]);

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
                stackedData.push({"id": e[id],
                                  "stacks":[{"id": e[id],
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
            
            var stackedData = getStackedBarData(data, stackVariables);
            x.domain(getxDomain(stackedData));
            y.domain(getyDomain(stackedData));
            
            // draw axes first so bars are on top of them
            xAxis = d3.axisTop()
                .tickSizeInner(0) // the inner ticks will be of size 0
                .tickSizeOuter(0)
                .scale(x),
            yAxis = d3.axisLeft()
                .tickSizeOuter(0)
                .scale(y);

            // g element to keep elements within svg modular
            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," +  (height -
                                                      margin.top) + ")")
                .call(xAxis)
                .selectAll("text")    
                .style("text-anchor", "start")
                .attr("dx", "0em")
                .attr("dy", "2em")
                .attr("transform", "rotate(45)");

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis.ticks())
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()))
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
                            return (x.bandwidth() + y(d.start) -
                                    y(d.end) + ", " + (x.bandwidth()));
                        } else if (i == 0){ //if bottom bar
                            return ("0, " + x.bandwidth() + ", " +
                                    2 * (y(d.start) - y(d.end) + (x.bandwidth())));
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
                .attr("x", function(d) {return x(d.name);})
                .attr("y", function(d) {return y(d.end);})
                .attr("fill", function(d,i) { return stackColors[i];})
                .attr("width", x.bandwidth())
                .attr("height", function(d,i) {return y(d.start) - y(d.end);});

            var legend = bar.selectAll(".legend")
                .data(stackVariables.reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
                //.style("font", "10px sans-serif");

            legend.append("rect")
                .attr("x", width - 95)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", function(d,i){ return stackColors[i];});

            legend.append("text")
                .attr("x", width - 70)
                .attr("y", 9)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .text(function(d) { return d; });

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

    chart.transitionTime = function(value) {
        if (!arguments.length) return transitionTime;
        transitionTime = value;
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
