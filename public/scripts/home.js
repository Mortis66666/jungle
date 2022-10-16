function randInt(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function create() {
    document.querySelector("form").action = `/game/${randInt(1000, 9999)}`;
    document.querySelector("form").submit();
}