togglePanel = () => {
    let c = document.getElementsByClassName("content")[0]
    let f = document.getElementsByClassName("form")[0]
    let t = document.getElementsByClassName("triangle")[0]

    if(c.className.includes("active")) {
        c.className = "content"
        f.className = "form active"
        t.className = "triangle right"
    } else {
        c.className = "content active"
        f.className = "form"
        t.className = "triangle left"
    }
}