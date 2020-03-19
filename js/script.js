// Site's main .js functions
goToTop = () => {
    document.getElementsByClassName("content")[0].scrollTo({
        top: 0,
        behavior: 'smooth'
      })
}

openthedoor = () => {
    let key = document.getElementsByClassName("key")[0]

    if(key.className.includes("left")) {
        key.innerHTML = "Open"
        key.className = "key left opened"
    } else {
        key.innerHTML = "Close"
        key.className = "key right opened"
    }
}

closethedoor = () => {
    let key = document.getElementsByClassName("key")[0]

    if(key.className.includes("left")) {
        key.innerHTML = ""
        key.className = "key left"
    } else {
        key.innerHTML = ""
        key.className = "key right"
    }
}

togglePanel = () => {
    let f = document.getElementsByClassName("form")[0]
    let t = document.getElementsByClassName("key")[0]

    if(f.className.includes("active")) {
        f.className = "form"
        t.className = "key left"
    } else {
        f.className = "form active"
        t.className = "key right"
    }
}

// Maps loading
let width = document.getElementById("world").offsetWidth + 18
let height = document.getElementById("world").offsetHeight - 2
let cf = "none"

let disp = d3.dispatch("selection")
disp.on("selection", () => {
    country.filter(this.filter)
    country.polish()
    country.draw()
})

let world = new WorldMap("world", width, height)
world.dispatch = disp

d3.json("https://rawgit.com/vsychen/Big-2000-visualizacao-2017-1/master/json/world-topo-min.json", function(d) {
    world.setMap(topojson.feature(d, d.objects.countries).features)
    world.drawScale()
})

// d3.json("", (d) => {
//     let dataset = d.countries

//     world.data(dataset)
// })