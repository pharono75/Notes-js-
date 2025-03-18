document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#addNote").addEventListener("click", createNote);
    document.getElementById("clearNotes").addEventListener("click", clearNotes);
    document.getElementById("deleteSelected").addEventListener("click", deleteSelectedNote);
    document.getElementById("addTask").addEventListener("click", toggleCategories);
    document.getElementById("importantCategory").addEventListener("click", () => setCategory("#e83f5d"));
    document.getElementById("dailyCategory").addEventListener("click", () => setCategory("#19c186"));
    document.getElementById("postponedCategory").addEventListener("click", () => setCategory("#3f82e8"));
    loadNotes();
});

const defaultColor = "#eae773"; 
let selectedNote = null;    
let lastNotePosition = { left: 50, top: 50 }; 
let maxZIndex = 1; 

function createNote() {
    let note = document.createElement("div");
    note.className = "note";
    note.contentEditable = true;
    
    lastNotePosition.left += 20;
    lastNotePosition.top += 20;
    
    if (lastNotePosition.left > 600) lastNotePosition.left = 70;
    if (lastNotePosition.top > 400) lastNotePosition.top = 70;

    note.style.left = lastNotePosition.left + "px";
    note.style.top = lastNotePosition.top + "px";
    note.style.backgroundColor = defaultColor;
    note.style.zIndex = maxZIndex; 

    note.addEventListener("click", function(e) {
        e.stopPropagation();
        if (selectedNote) {
            selectedNote.style.border = "none";
            selectedNote.style.zIndex = parseInt(selectedNote.style.zIndex) || 1; 
        }
        selectedNote = note;
        maxZIndex++; 
        note.style.zIndex = maxZIndex;
        note.style.border = "2px solid #ffffff";
    });

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
            if (selectedNote !== note) { 
                if (selectedNote) {
                    selectedNote.style.border = "none";
                }
                selectedNote = note;
                maxZIndex++;
                note.style.zIndex = maxZIndex;
                note.style.border = "2px solid #ffffff";
            }
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
            backgroundColor: note.style.backgroundColor,
            zIndex: note.style.zIndex 
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
        note.style.backgroundColor = data.backgroundColor || defaultColor;
        note.style.zIndex = data.zIndex || 1; 
        note.innerText = data.text;

        
        const left = parseInt(data.left);
        const top = parseInt(data.top);
        const zIndex = parseInt(data.zIndex) || 1;
        if (left > lastNotePosition.left) lastNotePosition.left = left;
        if (top > lastNotePosition.top) lastNotePosition.top = top;
        if (zIndex > maxZIndex) maxZIndex = zIndex;

        note.addEventListener("click", function(e) {
            e.stopPropagation();
            if (selectedNote) {
                selectedNote.style.border = "none";
                selectedNote.style.zIndex = parseInt(selectedNote.style.zIndex) || 1;
            }
            selectedNote = note;
            maxZIndex++;
            note.style.zIndex = maxZIndex;
            note.style.border = "2px solid #ffffff";
        });

        container.appendChild(note);
        note.oninput = saveNotes;
        makeDraggable(note);
    });
}

function clearNotes() {
    localStorage.removeItem("notes");
    document.getElementById("notesContainer").innerHTML = "";
    selectedNote = null;
    lastNotePosition = { left: 50, top: 50 };
    maxZIndex = 1;
}

function deleteSelectedNote() {
    if (selectedNote) {
        selectedNote.remove();
        selectedNote = null;
        saveNotes();
    } else {
        alert("Пожалуйста, выберите заметку для удаления");
    }
}

function toggleCategories() {
    const categoryContainer = document.getElementById("categoryButtons");
    categoryContainer.classList.toggle("hidden");
}

function setCategory(color) {
    if (selectedNote) {
        selectedNote.style.backgroundColor = color;
        saveNotes();
    } else {
        alert("Пожалуйста, выберите заметку для изменения категории");
    }
}

document.addEventListener("click", function(e) {
    if (selectedNote && !e.target.classList.contains("note")) {
        selectedNote.style.border = "none";
        selectedNote.style.zIndex = parseInt(selectedNote.style.zIndex) || 1; 
        selectedNote = null;
    }
});