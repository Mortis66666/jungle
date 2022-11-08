function join() {
    if (document.getElementById("input").value)
        window.location.href =
            "/game/" + document.getElementById("input").value;
}

function openPopup() {
    document.getElementById("create-popup").style.display = "block";
}

function closePopup() {
    document.getElementById("create-popup").style.display = "none";
}
