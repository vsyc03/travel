// Variables
const dataset_path = "https://vsyc-travel-server.herokuapp.com/";
const world_topo = "https://raw.githubusercontent.com/vsyc03/travel/master/json/world-topo-min.json";

// Maps loading
let width = document.getElementById("world").offsetWidth + 18;
let height = document.getElementById("world").offsetHeight - 2;
let cf = "none"; //country filter

let disp = d3.dispatch("selection");
disp.on("selection", () => {
    country.filter(this.filter);
});

let world = new WorldMap("world", width, height);
world.dispatch = disp;

// Site's main .js functions
xhrRequest = (method, params, callback) => {
    if(method !== "GET" && method !== "POST") return -1;
    if(method === "POST" && params.length == 0) return -1;

    let xhr = new XMLHttpRequest();
    xhr.open(method, dataset_path, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if(callback !== null) callback(this);
            if(callback === null) alert("[Server] Entry updated.")
        } else if (this.readyState === XMLHttpRequest.DONE && this.status === 400) {
            alert("[Server] " + this.response);
        } else if (this.readyState === XMLHttpRequest.DONE && this.status === 500) {
            alert("[Server] " + this.response);
        }
    }

    if(method === "GET") {
        xhr.send();
    } else if(method === "POST") {
        xhr.send(JSON.stringify(params[0]));
    }
}

loadMap = (callback) => {
    xhrRequest("GET", [], (d) => {
        world.data(JSON.parse(d.response));
    
        d3.json(world_topo, function(d) {
            world.setMap(topojson.feature(d, d.objects.countries).features);
            world.drawScale();
        });
        callback();
    })
}

loadCountries = () => {
    let fcountry = document.getElementById("form-country"),
        ds       = world.dataset,
        opt      = null;

    for(let i = 0; i < ds.length; i++) {
        opt = document.createElement("option");
        opt.setAttribute("value", ds[i]["country"]);
        opt.innerHTML = ds[i]["country"];
        fcountry.appendChild(opt);
    }
}

loadSubdivs = () => {
    let country = document.getElementById("form-country").value,
        fsubdiv = document.getElementById("form-state"),
        ds      = world.dataset,
        opt     = null;

    if(country === "") {
        return -1;
    }

    for(let i = 0; i < ds.length; i++) {
        if(ds[i]["country"] === country) {
            for(let j = 0; j < ds[i]["states"].length; j++) {
                opt = document.createElement("option");
                opt.setAttribute("value", ds[i]["states"][j]["name"]);
                opt.innerHTML = ds[i]["states"][j]["name"];
                fsubdiv.appendChild(opt);
            }
        }
    }
}

goToTop = () => {
    document.getElementsByClassName("content")[0].scrollTo({
        top: 0,
        behavior: 'smooth'
      });
}

openthedoor = () => {
    let key = document.getElementsByClassName("key")[0];

    if(key.className.includes("left")) {
        key.innerHTML = "Open";
        key.className = "key left opened";
    } else {
        key.innerHTML = "Close";
        key.className = "key right opened";
    }
}

closethedoor = () => {
    let key = document.getElementsByClassName("key")[0];

    if(key.className.includes("left")) {
        key.innerHTML = "";
        key.className = "key left";
    } else {
        key.innerHTML = "";
        key.className = "key right";
    }
}

togglePanel = () => {
    let f = document.getElementsByClassName("form")[0];
    let t = document.getElementsByClassName("key")[0];

    if(f.className.includes("active")) {
        f.className = "form";
        t.className = "key left";
    } else {
        f.className = "form active";
        t.className = "key right";
    }
}

addnewtravel = () => {
    let d       = world.dataset,
        country = document.getElementById("form-country").value,
        subdiv  = document.getElementById("form-state").value,
        went    = document.getElementById("form-went").checked,
        plan    = document.getElementById("form-plan").checked,
        admin   = (document.getElementById("form-admin").value === "true"),
        obj     = { "country":country, "subdiv":subdiv, "went":went, "plan":plan },
        cfound  = false,
        sfound  = false;
    
    if(country === "" || subdiv === "") {
        alert("Please select a country and a subdivision/state/province to update.");
        return -1;
    }

    if(admin) {
        xhrRequest("POST", [obj], null);
    }

    for(let i = 0; i < world.dataset.length; i++) {
        let c = d[i];

        if(c["country"] === country) {
            cfound = true;
            for(let j = 0; j < c["states"].length; j++) {
                let s = c["states"][j];

                if(s["name"] === subdiv) {
                    sfound = true;

                    if(s["went"] === true) {
                    } else if(went === true) {
                        s["plan"] = false;
                        s["went"] = true;
                    } else if(plan === true) {
                        s["plan"] = true;
                    }

                    if(!admin) {
                        alert("Entry updated.")
                    }

                    world.data(world.dataset);
                    world.draw();
                }
            }

            if(!sfound && !admin) {
                alert("The Subdivision/State/Province hasn't been found.");
            }
        }
    }

    if(!cfound && !admin) {
        alert("The Country hasn't been found.");
    }
}


// Main Flow
loadMap(loadCountries);