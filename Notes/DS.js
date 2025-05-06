document.addEventListener("DOMContentLoaded", function () {
    // Инициализация переключателя темы
    initThemeSwitch();
    // Существующие обработчики событий
    document.querySelector("#addNote").addEventListener("click", createNote);
    document.getElementById("clearNotes").addEventListener("click", clearNotes);
    document.getElementById("deleteSelected").addEventListener("click", deleteSelectedNote);
    document.getElementById("addTask").addEventListener("click", toggleCategories);
    document.getElementById("importantCategory").addEventListener("click", () => setCategory("#e83f5d"));
    document.getElementById("dailyCategory").addEventListener("click", () => setCategory("#19c186"));
    document.getElementById("postponedCategory").addEventListener("click", () => setCategory("#3f82e8"));
    loadNotes();
});

// Функция инициализации переключателя темы
function initThemeSwitch() {
    const themeSwitch = document.getElementById('themeSwitch');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Обработчик клика по переключателю
    themeSwitch.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Функция установки темы
function setTheme(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.src = 'img/moon.png';
        themeText.textContent = 'Темная тема';
    } else {
        document.body.removeAttribute('data-theme');
        themeIcon.src = 'img/sun.png';
        themeText.textContent = 'Светлая тема';
    }
}

const defaultColor = "#eae773"; 
let selectedNote = null;    
let lastNotePosition = { left: 50, top: 50 }; 
let maxZIndex = 1; 

// Исправлено: createContexMenu -> createContextMenu и contextMenu вместо contexMenu
function createContextMenu(note) {
    let contextMenu = document.getElementById('noteContextMenu');
    if (!contextMenu) {  // Исправлено: contextMenu вместо contexMenu
        contextMenu = document.createElement('div');
        contextMenu.id = 'noteContextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }

    contextMenu.innerHTML = '';
    
    const menuItems = [
        { 
            label: 'Важные', 
            icon: '<img src="img/important.png" alt="!">',
            action: () => setCategory("#e83f5d", note) 
        },
        { 
            label: 'Ежедневные', 
            icon: '<img src="img/daily.png" alt="~">',
            action: () => setCategory("#19c186", note) 
        },
        { 
            label: 'Отложенные', 
            icon: '<img src="img/postponed.png" alt=">">',
            action: () => setCategory("#3f82e8", note) 
        },
        { 
            label: 'Удалить', 
            icon: '<img src="img/clearp.png" alt="X">',
            action: () => deleteNote(note),
            className: 'delete'
        }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = `context-menu-item ${item.className || ''}`;
        menuItem.innerHTML = `${item.icon} ${item.label}`;
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action();
            hideContextMenu();
        });
        contextMenu.appendChild(menuItem);
    });

    return contextMenu;
}

function showContextMenu(e, note) {
    e.preventDefault();
    
    if (selectedNote !== note) {
        if (selectedNote) {
            selectedNote.style.border = "none";
        }
        selectedNote = note;
        maxZIndex++;
        note.style.zIndex = maxZIndex;
        note.style.border = "2px solid #ffffff";
    }

    const contextMenu = createContextMenu(note);
    contextMenu.style.display = 'block';
    
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    let x = e.pageX;
    let y = e.pageY;

    if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth;
    }
    if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight;
    }

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
    const contextMenu = document.getElementById('noteContextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function deleteNote(note) {
    note.remove();
    if (selectedNote === note) {
        selectedNote = null;
    }
    saveNotes();
}

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

    note.addEventListener('contextmenu', (e) => {
        showContextMenu(e, note);
    });

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

        note.addEventListener('contextmenu', (e) => {
            showContextMenu(e, note);
        });

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

function setCategory(color, note = selectedNote) {
    if (note) {
        note.style.backgroundColor = color;
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
    const contextMenu = document.getElementById('noteContextMenu');
    if (contextMenu && !contextMenu.contains(e.target) && !e.target.classList.contains('note')) {
        hideContextMenu();
    }
});
