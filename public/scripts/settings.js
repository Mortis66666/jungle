function save() {
    let pieceDisplay = +document.getElementById("piece-display").value;
    localStorage.setItem("pieceDisplay", pieceDisplay);
}

document.getElementById("piece-display").children[localStorage.getItem("pieceDisplay")].setAttribute("selected", "");
