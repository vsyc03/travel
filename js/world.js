class WorldMap {
    constructor(id, w, h) {
        let that = this;
        d3.select("#"+id).insert("svg")

        let zoomed = () => {
            that.canvas.selectAll(".country").attr("transform", d3.event.transform);
        }

        let resetZoom = () => {
            d3.event.preventDefault();
            that.canvas.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        }

        let zoom = d3.zoom()
            .scaleExtent([1,8])
            .translateExtent([[0,-100], [w-20,h+100]])
            .on("zoom", zoomed)
            .filter(() => { return !event.button && event.type !== 'dblclick'; });

        this.canvas = d3.select("#"+id).select("svg")
            .attr("class", "container")
            .attr("width", w-22)
            .attr("height", h-2)
            .call(zoom)
            .on("contextmenu", resetZoom);

        this.id = id;
        this.w = w;
        this.h = h;

        this.tooltipDiv = this.canvas.append("div").attr("class", "tooltip").style("opacity", 0);

        this.cScale = d3.scaleLinear()
            .range(["#dddddd","#66bb66","#009900"]);
        this.caption = d3.scaleLinear()
            .range(["#dddddd","#66bb66","#009900"])
            .domain([0,4,8]);

        this.projection = d3.geoMercator().translate([w/2,h/2]).scale(w/(2*Math.PI));
        this.path = d3.geoPath().projection(this.projection);

        this.dataset    = [];
        this.visited    = [];
        this.percentage = [];
    }

    data(data) {
        this.dataset = data;
        this.visited = data.map(function(d) {
            return d["states"].filter(function(e) { return e["went"]; });
        });
        this.percentage = data.map(function(d) {
            let dividend = 0;
            let divisor  = d["states"].length;

            for(let i = 0; i < divisor; i++) {
                if(d["states"][i]["went"] === true) {console.log(d["states"][i]["name"])
                    dividend += 1;
                }
            }

            return dividend/divisor;
        });
    }

    setMap(data) {
        let that = this;
        this.cScale.domain([0, 0.5, 1]);

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.map = this.canvas.selectAll(".country").data(data).enter()
            .insert("path").attr("class", "country")
            .attr("d",this.path)
            .on('mouseover', function(d){
                div.transition().duration(200).style("opacity", .9);
                let a = that.dataset.indexOf(d.properties.name);console.log(d)
                if(a == -1) {
                    div.html(d.properties.name+"<br/> Zero Empresas")
                    .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                } else {
                    div.html(d.properties.name+"<br/>"+that.l_subdiv[a]+" Empresas")
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
    }

    draw() {
        var that = this;

        this.map
            .attr("id", function(d,i) { return d.properties.name; })
            .style("fill",function(d) {
                if(that.searchCountry(d.properties.name) === -1) {
                    return "000000";
                } else {console.log(that.percentage[that.searchCountry(d.properties.name)])
                    return that.cScale(that.percentage[that.searchCountry(d.properties.name)]);
                }
            });
    }

    drawScale() {
        this.canvas
            .append("rect")
            .attr("class","legend")
            .attr("fill", "#ffffff")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("x", 10)
            .attr("y", this.h-100)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("stroke-width", this.w/1000);

        this.canvas
            .append("text")
            .attr("x", 75)
            .attr("y", this.h-85)
            .attr("font-family", "Candara")
            .attr("font-size", this.h/40)
            .attr("stroke", "#000000")
            .text("% VISITED");

        // Scale
        for(var i = 0; i <= 8; i++) {
            this.canvas
                .append("rect")
                .attr("width", 20)
                .attr("height", this.h/15)
                .attr("x", 20+(i*20))
                .attr("y", this.h-60)
                .attr("fill", this.caption(i));
            
            this.canvas
                .append("text")
                .attr("width", 20)
                .attr("height", this.h/37)
                .attr("x", 25+(i*20))
                .attr("y", this.h-70)
                .attr("font-size", this.h/80)
                .attr("stroke", "#000000")
                .text(function() { if(i%2 === 0) return i*12.5; });

        }

    }

    searchCountry(country) {
        for(let i = 0; i < this.dataset.length; i++) {
            let c = this.dataset[i];

            if (c["country"] === country) {
                return i;
            }
        }

        return -1;
    }

    searchState(countryId, state) {
        let states = this.dataset[countryId]["states"];

        for(let i = 0; i < states.length; i++) {
            let s = states[i];

            if(s["name"] === state) {
                return i;
            }
        }

        return -1;
    }

    searchCountryState(country, state) {
        for(let i = 0; i < this.dataset.length; i++) {
            let c = this.dataset[i];

            if(c["country"] === country) {
                for(let j = 0; j < c["states"].length; j++) {
                    let s = c["states"][j];

                    if(s["name"] === state) {
                        return [i, j];
                    }
                }

                return [i, -1];
            }
        }

        return [-1, -1];
    }

    nextPhase(f, widget) {
        widget.dispatch.call("selection", {caller:widget.id, filter:f.properties.name});
    }
}