class WorldMap {
    constructor(id, w, h) {
        let that = this;
        d3.select("#"+id).insert("svg")

        let zoom = d3.zoom()
            .scaleExtent([1,8])
            .translateExtent([[0,-100], [w-20,h+100]])
            .on("zoom", zoomed)
            .filter(function () { return !event.button && event.type !== 'dblclick'; });

        this.canvas = d3.select("#"+id).select("svg")
            .attr("class", "container")
            .attr("width", w-20)
            .attr("height", h)
            .call(zoom)
            .on("contextmenu", resetZoom);

        this.id = id;
        this.w = w;
        this.h = h;

        this.tooltipDiv = this.canvas.append("div").attr("class", "tooltip").style("opacity", 0);

        this.cScale = d3.scaleLinear()
            .range(["#ffa07a","#ffd700","#daa520"]);
        this.caption = d3.scaleLinear()
            .range(["#ffa07a","#ffd700","#daa520"])
            .domain([0,4,8]);

        this.projection = d3.geoMercator().translate([w/2,h/2]).scale(width/(2*Math.PI));
        this.path = d3.geoPath().projection(this.projection);

        this.dataset = [];
        this.filteredByYear = [];

        function zoomed() {
            that.canvas.selectAll(".country").attr("transform", d3.event.transform);
        }

        function resetZoom() {
            d3.event.preventDefault();
            that.canvas.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }
    }

    data(data) {
        this.dataset = data;
    }

    setMap(data) {
        var maxS = Math.log(this.maxScore)/2
        this.cScale.domain([0,maxS,(maxS*2)]);

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var that = this;

        this.map = this.canvas.selectAll(".country").data(data).enter()
        .insert("path").attr("class", "country")
        .attr("d",this.path)
        .on('mouseover', function(d){
        div.transition().duration(200).style("opacity", .9); 
        var a = that.countries.indexOf(d.properties.name);
        if(a == -1) {
        div.html(d.properties.name+"<br/> Zero Empresas")
        .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        } else {
        div.html(d.properties.name+"<br/>"+that.quantity[a]+" Empresas")
        .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        }
        })
        .on('mouseout', function(d){
        div.transition().duration(200).style("opacity", 0);  
        div.html("");
        })
        .on("dblclick", function(d) { 
        if(d3.select(this).style("stroke-width") != 3) {
        d3.select(this).style("stroke-width",3).style("stroke","white");
        } else {
        d3.select(this).style("stroke-width",1.).style("stroke","white");
        }
        that.nextPhase(d, that);
        });
        this.draw();

        // White box to wrap scale
        this.canvas
            .append("rect")
            .attr("width", (this.w/10)+3)
            .attr("height", this.h/12)
            .attr("fill", "black")
            .attr("x", -4)
            .attr("y", (22.1/24)*this.h)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("stroke", "black")
            .attr("stroke-width", this.w/1000);

        // Scale
        for(var i = 0; i <= 8; i++) {
            if(i != 8) {
                this.canvas
                    .append("rect")
                    .attr("width", this.w/100)
                    .attr("height", this.h/35)
                    .attr("x", (((i+0.3)/100)*this.w))
                    .attr("y", (23/24)*this.h)
                    .attr("fill", this.caption(i));
            } else {
                this.canvas
                    .append("rect")
                    .attr("width", this.w/100)
                    .attr("height", this.h/35)
                    .attr("x", (((i+0.3)/100)*this.w))
                    .attr("y", (23/24)*this.h)
                    .attr("fill", this.caption(i));
            }
        }

        // Scale Sub
        this.canvas
        .append("text")
        .attr("x", (0.3/100)*this.w)
        .attr("y", (22.8/24)*this.h)
        .attr("font-family", "Candara")
        .attr("font-weight", "bold")
        .attr("font-size", this.h/40)
        .text("Scale");
    }

    draw() {
        var that = this;

        this.map
            .attr("id", function(d,i) { return d.properties.name; })
            .style("fill",function(d) {
                if(that.countries.indexOf(d.properties.name) == -1) {
                    return "c9c9c9";
                } else {
                    return that.cScale(Math.log(that.score[that.countries.indexOf(d.properties.name)]));
                }
            });
    }

    nextPhase(f, widget) {
        widget.dispatch.call("selection", {caller:widget.id, filter:f.properties.name});
    }
}