document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#addNote").addEventListener("click", createNote);
    document.getElementById("clearNotes").addEventListener("click", clearNotes);
    loadNotes();
});
const colors = [
    "#ff9999", // Красный
    "#99ff99", // Зеленый
    "#9999ff", // Синий
    "#ffff99", // Желтый
    "#ff99ff", // Розовый
    "#99ffff"  // Голубой
];

function createNote() {
    let note = document.createElement("div");
    note.className = "note";
    note.contentEditable = true;
    note.style.left = "50px";
    note.style.top = "50px";
  

    note.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    document.getElementById("notesContainer").appendChild(note);
    saveNotes();
    note.oninput = saveNotes;
    makeDraggable(note); 
}

function makeDraggable(note) {
    let isDragging = false;
    let shiftX, shiftY;

    note.addEventListener("mousedown", function (e) {
      
        if (e.button === 0) { 
            isDragging = true;
            shiftX = e.clientX - parseInt(note.style.left || 0);
            shiftY = e.clientY - parseInt(note.style.top || 0);
            note.style.zIndex = 1000; 
        }
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging) {
            note.style.left = (e.clientX - shiftX) + "px";
            note.style.top = (e.clientY - shiftY) + "px";
            saveNotes();
        }
    });

    document.addEventListener("mouseup", function () {
        if (isDragging) {
            isDragging = false;
            note.style.zIndex = 1; 
        }
    });
}

function saveNotes() {
    let notes = [];
    document.querySelectorAll(".note").forEach(note => {
        notes.push({
            text: note.innerText,
            left: note.style.left,
            top: note.style.top,
            backgroundColor: note.style.backgroundColor 
        });
    });
    localStorage.setItem("notes", JSON.stringify(notes));
}

function loadNotes() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let container = document.getElementById("notesContainer");

    notes.forEach(data => {
        let note = document.createElement("div");
        note.className = "note";
        note.contentEditable = true;
        note.style.left = data.left;
        note.style.top = data.top;
        note.style.backgroundColor = data.backgroundColor; 
        note.innerText = data.text;

        container.appendChild(note);

        note.oninput = saveNotes;
        makeDraggable(note); 
    });
}

function clearNotes() {
    localStorage.removeItem("notes");
    document.getElementById("notesContainer").innerHTML = "";
}