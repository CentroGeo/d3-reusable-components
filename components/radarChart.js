function radarChart(){
    
    var data = [],
        width = 350,
        height = 350,
        margin = {top: 40, right: 75, bottom: 60, left: 75},
        //margin = {top: 40, right: 60, bottom: 60, left: 60},
        id,  // variable in data to use as identifier
        displayName, // variable in data to use as display name for each bar
        transitionTime = 250,
//        possibleNames, // all possible names for legend
        levels = 3, //How many levels of inner circles to draw
        maxValue = 0, //Max value of outer circle
        labelFactor = 1.35, //How much farther than the radius of the outer circle should the labels be placed
        wrapWidth = 60, //Number of pixels after which a label needs to be given a new line
        opacityArea = 0.05, //Opacity of the area of the blob
        dotRadius = 3, //Size of the colored circles of each blob
        opacityCircles = 0.05, //Opacity of the circles of each blob
        strokeWidth = 1.2, //Width of the stroke around each blob
        roundStrokes = true, //If true the area and stroke will follow a round path (2cardinal-closed)
        color = d3.scaleOrdinal(d3.schemeCategory10),	//Color function,
        format = '.0f',
        unit = '',
        legend = false,//{ title: '', translateX: 100, translateY: 0 },
        legendContainer = 'legendZone',
        updateData;

    function chart(selection){
        const max = Math.max;
        const sin = Math.sin;
        const cos = Math.cos;
        const HALF_PI = Math.PI / 2;
        var radarLine,
            pos  = d3.scaleBand().rangeRound([0, height]);
        var Format = d3.format(format);
        var wrap = (text, width) => {
            text.each(function() {
                var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan")
                        .attr("x", x).attr("y", y)
                        .attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }

        function axesFormatData(data){
            var chartData = [];
            data.forEach(function(d){
                var currentAxis = {"name": d[displayName],
                                   "axes": []
                                  };
                d3.keys(d).forEach(function(i){
                    if (i != "id" && i != displayName && i!="zona") {
                        currentAxis.axes.push(
                            {"axis": i,
                             "value": d[i],
                             "name": d[displayName]
                            }
                        );
                    }
                });
                chartData.push(currentAxis);
            });
            return chartData;
        }

        var formattedData = axesFormatData(data);
        
        var computedMaxValue = 0;
        for (var j=0; j < formattedData.length; j++) {
            for (var i = 0; i < formattedData[j].axes.length; i++) {
                formattedData[j].axes[i]['id'] = formattedData[j].name;
                if (formattedData[j].axes[i]['value'] > maxValue) {
                    maxValue = formattedData[j].axes[i]['value'];
                }
            }
        }
        maxValue = max(maxValue, computedMaxValue);

        var allAxis = formattedData[0].axes.map((i, j) => i.axis), //Name of each axis
            total = allAxis.length, //Number of different axes
            radius = Math.min(width/2, height/2), //Outermost radius
            angleSlice = Math.PI * 2 / total;	//Width in radians of each "slice"

        //Scale for the radius
        rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        // svg container and g
        selection.each(function(){
            var legendContainerId = this.id + "-" + legendContainer,
                radarLegendId = this.id + "-radarLegend";

            var svg = selection.append("svg")
                .attr("width", width + 1.5*(margin.left + margin.right))
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "radar");

            var g = svg.append("g")
                .attr("transform", "translate(" + (width/2 + margin.left - margin.left/3) + "," +
                      (height/2 + margin.top) + ")");

            // glow filter
            var filter = g.append('defs').append('filter').attr('id','glow'),
                feGaussianBlur = filter.append('feGaussianBlur')
                    .attr('stdDeviation','2.5')
                    .attr('result','coloredBlur'),
                feMerge = filter.append('feMerge'),
                feMergeNode_1 = feMerge.append('feMergeNode')
                    .attr('in','coloredBlur'),
                feMergeNode_2 = feMerge.append('feMergeNode')
                    .attr('in','SourceGraphic');

            // circular grid

            //Wrapper for the grid & axes
            var axisGrid = g.append("g").attr("class", "axisWrapper");

            //Draw the background circles
            axisGrid.selectAll(".levels")
                .data(d3.range(1,(levels+1)).reverse())
                .enter()
                .append("circle")
                .attr("class", "gridCircle")
                .attr("r", d => radius / levels * d)
                .style("fill", "#CDCDCD")
                .style("stroke", "#CDCDCD")
                .style("fill-opacity", opacityCircles)
                .style("filter" , "url(#glow)");

            //Text indicating at what % each level is
            axisGrid.selectAll(".axisLabel")
                .data(d3.range(1,(levels+1)).reverse())
                .enter().append("text")
                .attr("class", "axisLabel")
                .attr("x", 4)
                .attr("y", d => -d * radius / levels)
                .attr("dy", "0.4em")
                .style("font-size", "10px")
                .attr("fill", "#737373")
                    .text(function(d){
                        return Format((maxValue * d / levels) + unit);
                    });

            // draw axes

            //Create the straight lines radiating outward from the center
            var axis = axisGrid.selectAll(".axis")
                .data(allAxis)
                .enter()
                .append("g")
                .attr("class", "axis");
            
            //Append the lines
            axis.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", (d, i) =>
                          rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
                .attr("y2", (d, i) =>
                          rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))
                .attr("class", "line")
                .style("stroke", "white")
                .style("stroke-width", "2px");

            //Append the labels at each axis
            axis.append("text")
                .attr("class", "legend")
                .style("font-size", "11px")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .attr("x", (d,i) =>
                          rScale(maxValue * labelFactor) * cos(angleSlice * i - HALF_PI))
                .attr("y", (d,i) =>
                          rScale(maxValue * labelFactor) * sin(angleSlice * i - HALF_PI))
                .text(d => d)
                .call(wrap, wrapWidth);

            // draw radar blobs

            //The radial line function
            radarLine = d3.radialLine()
                .curve(d3.curveLinearClosed)
                .radius(d => rScale(d.value))
                .angle((d,i) => i * angleSlice);

            if(roundStrokes) {
                radarLine.curve(d3.curveCardinalClosed);
            }

            //Create a wrapper for the blobs
            var blobWrapper = g.selectAll(".radarWrapper")
                .data(formattedData, function(d){ return d.name; })
                .enter().append("g")
                .attr("class", "radarWrapper");

            //Append the backgrounds
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("d", d => radarLine(d.axes))
                .style("fill", (d,i) => color(d))
                .style("fill-opacity", opacityArea)
                .on('mouseover', function(d, i) {
                    //Dim all blobs
                    selection.selectAll(".radarArea")
                    .transition().duration(transitionTime)
                    .style("fill-opacity", 0.1);
                    //Bring back the hovered over blob
                    d3.select(this)
                    .transition().duration(transitionTime)
                    .style("fill-opacity", 0.7);
                })
                .on('mouseout', () => {
                    //Bring back all blobs
                    selection.selectAll(".radarArea")
                    .transition().duration(transitionTime)
                    .style("fill-opacity", opacityArea);
                });

            //Create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", function(d,i) { return radarLine(d.axes); })
                .style("stroke-width", strokeWidth + "px")
                .style("stroke", (d,i) => color(d.name))
                .style("fill", "none")
                .style("filter" , "url(#glow)");

            //Append the circles
            blobWrapper.selectAll(".radarCircle")
                .data(d => d.axes)
                .enter()
                .append("circle")
                .attr("class", "radarCircle")
                .attr("r", dotRadius)
                .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
                .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
                .style("fill", (d) => color(d.name))
                .style("fill-opacity", 0.8);

            // append invisible circles for tooltip

            //Wrapper for the invisible circles on top
            var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
                .data(formattedData)
                .enter().append("g")
                .attr("class", "radarCircleWrapper");

            //Append a set of invisible circles on top for the mouseover pop-up
            blobCircleWrapper.selectAll(".radarInvisibleCircle")
                .data(d => d.axes)
                .enter().append("circle")
                .attr("class", "radarInvisibleCircle")
                .attr("r", dotRadius * 1.5)
                .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
                .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function(d,i) {
                    tooltip
                        .attr('x', this.cx.baseVal.value - 10)
                        .attr('y', this.cy.baseVal.value - 10)
                        .transition()
                        .style('display', 'block')
                        .text(Format(d.value) + unit);
                })
                .on("mouseout", function(){
                    tooltip.transition()
                        .style('display', 'none').text('');
                });

            var tooltip = g.append("text")
                  .attr("class", "toolTip") // changed class namer to toolTip, otherwise conflicts with Bootstrap
                  .attr('x', 0)
                  .attr('y', 0)
                  .style("font-size", "12px")
                  .style('display', 'none')
                  .attr("text-anchor", "middle")
                  .attr("dy", "0.35em");

            // radar legend
            
            if (legend !== false && typeof legend === "object") {
                var legendZone = svg.append('g').attr("id", legendContainerId);
                var names = formattedData.map(el => el.name);

                pos  = d3.scaleBand().rangeRound([0, height]);
                pos.domain(names);
                
                if (legend.title) {
                    var title = legendZone.append("text")
                        .attr("class", "title")
                        .attr('transform',
                                  `translate(${legend.translateX},${legend.translateY})`)
                        .attr("x", width - 70)
                        .attr("y", 10)
                        .attr("font-size", "12px")
                        .attr("fill", "#404040")
                        .text(legend.title);
                }
                var radarLegend = legendZone.append("g")
                    .attr("id", radarLegendId)
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform',
                          `translate(${legend.translateX},${legend.translateY + 20})`);
                
                // Create rectangles markers
                radarLegend.selectAll('rect')
                    .data(names, function(d){ return d;})
                    .enter()
                    .append("rect")
                    .attr("x", width - 55)
                    .attr("y", function(d){return pos(d)-9;})
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", (d,i) => color(d));
                
                // Create labels
                radarLegend.selectAll('text')
                    .data(names, function(d){return d;})
                    .enter()
                    .append("text")
                    .attr("x", width - 40)
                    .attr("y", function(d){return pos(d);})
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .text(d => d);
            }

            updateData = function(){
                var g = selection.select("g");
                var formattedData = axesFormatData(data);
                var computedMaxValue = 0;
                for (var j=0; j < formattedData.length; j++) {
                    for (var i = 0; i < formattedData[j].axes.length; i++) {
                        formattedData[j].axes[i]['id'] = formattedData[j].name;
                        if (formattedData[j].axes[i]['value'] > maxValue) {
                            maxValue = formattedData[j].axes[i]['value'];
                        }
                    }
                }
                maxValue = max(maxValue, computedMaxValue);

                var allAxis = formattedData[0].axes.map((i, j) => i.axis), //Name of each axis
                    total = allAxis.length, //Number of different axes
                    radius = Math.min(width/2, height/2), //Outermost radius
                    angleSlice = Math.PI * 2 / total;	//Width in radians of each "slice"

                //Scale for the radius
                rScale = d3.scaleLinear()
                    .range([0, radius])
                    .domain([0, maxValue]);
                
                    //Text indicating at what % each level is
                g.selectAll(".axisLabel")
                    .text(function(d){
                            return Format((maxValue * d / levels) + unit);
                        })
                        .transition(transitionTime);

                g.selectAll(".axis line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", (d, i) =>
                              rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
                    .attr("y2", (d, i) =>
                              rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))

                g.selectAll(".axis text")
                    .attr("x", (d,i) =>
                              rScale(maxValue * labelFactor) * cos(angleSlice * i - HALF_PI))
                    .attr("y", (d,i) =>
                              rScale(maxValue * labelFactor) * sin(angleSlice * i - HALF_PI))
                    .text(d => d)
                    .call(wrap, wrapWidth);
                    
                if (roundStrokes) {
                    radarLine.curve(d3.curveCardinalClosed)
                }

                var radarWrapperUpdate = g.selectAll(".radarWrapper")
                    .data(formattedData, function(d){return d.name;});
                
                //Append the backgrounds
                var radarWrapperEnter = radarWrapperUpdate.enter().append("g")
                    .attr("class", "radarWrapper");
                
                var radarAreaEnter = radarWrapperEnter.append("path")
                    .transition(transitionTime)
                    .attr("class", "radarArea")
                    .attr("d", d => radarLine(d.axes))
                    .style("fill", d => color(d.name))
                    .style("fill-opacity", opacityArea);

                //Create the outlines
                var radarStrokeEnter = radarWrapperEnter.append("path")
                    .transition(transitionTime)
                    .attr("class", "radarStroke")
                    .attr("d", function(d,i) { return radarLine(d.axes); })
                    .style("stroke-width", strokeWidth + "px")
                    .style("stroke", d => color(d.name))
                    .style("fill", "none")
                    .style("filter" , "url(#glow)");
                
                //Append the circles
                var radarCircleEnter = radarWrapperEnter.selectAll(".radarCircle")
                    .data(d => d.axes)
                    .enter()
                    .append("circle")
                    .transition(transitionTime)
                    .attr("class", "radarCircle")
                    .attr("r", dotRadius)
                    .attr("cx", (d,i) =>
                              rScale(d.value) * cos(angleSlice * i - HALF_PI))
                    .attr("cy", (d,i) =>
                              rScale(d.value) * sin(angleSlice * i - HALF_PI))
                    .style("fill", d => color(d.name))
                    .style("fill-opacity", 0.8);
                
                radarWrapperUpdate.exit().remove();

                // update legend
                var radarLegend = d3.select("#" + legendContainerId).select("g")
                var names = formattedData.map(el => el.name);
                pos.domain(names);

                var radarLegendSquareUpdate = radarLegend.selectAll("rect")
                    .data(names, function(d){ return d;})
                    .attr("id", function(d,i){return i;})
                    .attr("x", width - 55)
                    .attr("y", function(d){return pos(d)-9;})
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", (d,i) => color(d));
                
                var radarLegendTextUpdate = radarLegend.selectAll("text")
                    .data(names, function(d){ return d;})
                    .attr("x", width - 40)
                    .attr("y", function(d){return pos(d);})
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .text(d => d);

                var radarLegendSquareEnter = radarLegendSquareUpdate.enter();
                var radarLegendTextEnter = radarLegendTextUpdate.enter();

                var legendSquares = radarLegendSquareEnter.append("rect")
                    .transition(transitionTime)
                    .attr("id", function(d,i){return i;})
                    .attr("x", width - 55)
                    .attr("y", function(d){return pos(d)-9;})
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", (d,i) => color(d));

                var legendTexts = radarLegendTextEnter.append("text")
                    .transition(transitionTime)
                    .attr("x", width - 40)
                    .attr("y", function(d){return pos(d);})
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .text(d => d);

                radarLegendSquareUpdate.exit()
                    .transition(transitionTime)
                    .remove();
                radarLegendTextUpdate.exit().
                    transition(transitionTime).
                    remove();
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

    chart.maxValue = function(value) {
         if (!arguments.length) return maxValue;
         maxValue = value;
         return chart;
         };

    chart.levels = function(value) {
         if (!arguments.length) return levels;
         levels = value;
         return chart;
         };
         
    chart.format = function(value) {
         if (!arguments.length) return format;
         format = value;
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

    return chart;

}
