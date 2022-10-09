function randInt(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

let form = document.querySelector("form");

form.action = `/game/${randInt(1000, 9999)}`;