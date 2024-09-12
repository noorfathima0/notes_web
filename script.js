const addBtn = document.getElementById('add');
let notes = JSON.parse(localStorage.getItem('notes')) || [];

if (notes.length) {
    notes.forEach(note => addNewNote(note.title, note.content));
}

addBtn.addEventListener('click', () => addNewNote());

function addNewNote(title = '', text = '') {
    const note = document.createElement('div');
    note.classList.add('note');
    note.draggable = true;

    note.innerHTML = `
        <div class="tools">
            <button class="edit"><i class="fas fa-edit"></i></button>
            <button class="delete"><i class="fas fa-trash-alt"></i></button>
        </div>
        <input type="text" class="note-title" placeholder="Title" value="${title}">
        <div class="main ${text ? "" : "hidden"}"></div>
        <textarea class="${text ? "hidden" : ""}"></textarea>
        <span class="save-confirm">Saved!</span>
    `;

    const editBtn = note.querySelector('.edit');
    const deleteBtn = note.querySelector('.delete');
    const main = note.querySelector('.main');
    const textArea = note.querySelector('textarea');
    const noteTitle = note.querySelector('.note-title');
    const saveConfirm = note.querySelector('.save-confirm');

    textArea.value = text;
    main.innerHTML = marked(text);

    deleteBtn.addEventListener('click', () => {
        note.remove();
        updateLS();
    });

    editBtn.addEventListener('click', () => {
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
    });

    textArea.addEventListener('input', (e) => {
        const { value } = e.target;
        main.innerHTML = marked(value);
        showSaveConfirm(saveConfirm);
        updateLS();
    });

    noteTitle.addEventListener('input', () => {
        showSaveConfirm(saveConfirm);
        updateLS();
    });

    note.addEventListener('dragstart', () => {
        note.classList.add('dragging');
    });

    note.addEventListener('dragend', () => {
        note.classList.remove('dragging');
        updateLS();
    });

    document.body.appendChild(note);
}

function showSaveConfirm(saveConfirm) {
    saveConfirm.style.visibility = 'visible';
    setTimeout(() => {
        saveConfirm.style.visibility = 'hidden';
    }, 1000);
}

function updateLS() {
    const notesElements = document.querySelectorAll('.note');
    const notesArray = Array.from(notesElements).map(note => {
        const title = note.querySelector('.note-title').value;
        const content = note.querySelector('textarea').value;
        return { title, content };
    });

    localStorage.setItem('notes', JSON.stringify(notesArray));
}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(document.body, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
        document.body.appendChild(dragging);
    } else {
        document.body.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
