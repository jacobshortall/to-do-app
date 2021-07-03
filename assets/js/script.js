/* eslint-disable comma-dangle */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */

document.addEventListener("DOMContentLoaded", () => {
    // add event listener to "add note" button
    const addNoteButton = document.getElementById("add-note");
    addNoteButton.addEventListener("click", showModal);

    // add event listeners to each trash button
    const clearButtons = document.getElementsByClassName("fa-trash");
    for (const button of clearButtons) {
        button.addEventListener("click", clearAll);
    }

    // add event listener to modal cross
    const modalCross = document.getElementsByClassName("fa-times")[0];
    modalCross.addEventListener("click", closeModal);

    // add event listener to "add note" button
    const confNote = document.getElementById("add-conf");
    confNote.addEventListener("click", addNote);

    // add event listener to textarea for the enter and escape keys
    const textArea = document.getElementById("note-input");
    textArea.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addNote();
        } else if (event.key === "Escape") {
            closeModal();
        }
    });

    // load items from localStorage
    getToDoLocalStorage();
    getCompletedLocalStorage();
});

/** displays modal for user to enter text */
function showModal() {
    // darkens background elements with overlay
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    // shows modal
    const modal = document.getElementById("modal");
    modal.style.display = "flex";

    // set focus to textarea
    document.getElementById("note-input").focus();
}

/** closes modal */
function closeModal() {
    // hides modal
    const modal = document.getElementById("modal");
    modal.style.display = "none";

    // removes darkened overlay
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
}

/** adds note to to do list */
function addNote() {
    const textArea = document.getElementById("note-input");
    const toDoContainer = document.getElementById("to-do");

    // check text area isn't empty
    if (textArea.value) {
        // add created element
        toDoContainer.appendChild(createNote(textArea.value, "todo"));

        // add input to localStorage
        addToLocalStorage(textArea.value, "todo");

        // add event listeners to each button when new item is created
        addToDoListeners();

        textArea.value = "";
        textArea.focus();
    } else {
        alert("Please enter some text.");
    }
}

/** creates note element from given user input */
function createNote(input, list) {
    // creating element to be added to list
    const div = document.createElement("div");
    if (list === "todo") {
        div.innerHTML = `
            <p>${input}</p>
            <div class="button-cont">
                <i class="fas fa-check-square"></i>
                <i class="fas fa-ban"></i>
            </div>
        `;
    } else if (list === "completed") {
        div.innerHTML = `
            <p>${input}</p>
            <div class="button-cont">
                <i class="fas fa-undo-alt"></i>
                <i class="fas fa-ban"></i>
            </div>
        `;
    }
    div.className = "to-do-item";

    return div;
}

/** adds user input to localStorage so it's saved on reload */
function addToLocalStorage(input, list) {
    if (list === "todo") {
        if ("toDo" in localStorage) {
            // convert localStorage into array to push new item
            const arr = localStorage.toDo.split(",");
            arr.push(input);
            localStorage.toDo = arr;
        } else {
            // create new array and localStorage object
            const arr = [input];
            localStorage.toDo = arr;
        }
    } else if (list === "completed") {
        if ("completed" in localStorage) {
            // convert localStorage into array to push new item
            const arr = localStorage.completed.split(",");
            arr.push(input);
            localStorage.completed = arr;
        } else {
            // create new array and localStorage object
            const arr = [input];
            localStorage.completed = arr;
        }
    }
}

/** clears all items from either the to-do or completed list */
function clearAll() {
    // check which list to clear by grabbing class attribute
    if (this.classList.contains("to-do-clear")) {
        document.getElementById("to-do").innerHTML = "";
        delete localStorage.toDo; // clear from localStorage
    } else {
        document.getElementById("completed").innerHTML = "";
        delete localStorage.completed; // clear from localStorage
    }
}

/** adds event listeners to each button when new item is added to to-do list */
function addToDoListeners() {
    // get most recently added item
    const newItem = document.getElementById("to-do").lastChild;
    // adding delete/complete event listeners
    newItem
        .getElementsByClassName("fa-ban")[0]
        .addEventListener("click", deleteItem);
    newItem
        .getElementsByClassName("fa-check-square")[0]
        .addEventListener("click", completeItem);
}

function addCompletedListeners() {
    // get most recently added item
    const newItem = document.getElementById("completed").lastChild;
    // adding delete/uncheck event listeners
    newItem
        .getElementsByClassName("fa-ban")[0]
        .addEventListener("click", deleteItem);
    newItem
        .getElementsByClassName("fa-undo-alt")[0]
        .addEventListener("click", uncheckItem);
}

/** deletes single item from list */
function deleteItem() {
    // checks which list the item is in so it can be correctly removed from localStorage
    if (
        this.closest(".button-cont").children[0].classList.contains(
            "fa-undo-alt"
        )
    ) {
        // removes from completed list localStorage
        removeLocal(
            this.closest(".to-do-item").children[0].innerHTML,
            "completed"
        );
    } else {
        // removes from toDo list localStorage
        removeLocal(this.closest(".to-do-item").children[0].innerHTML, "todo");
    }

    // remove item from DOM
    this.closest(".to-do-item").remove();
}

/** marks item as completed, moving it over to the completed section */
function completeItem() {
    // move div over from to-do to completed section
    const completedBox = document.getElementById("completed");
    completedBox.appendChild(this.closest(".to-do-item"));

    // change icon from check to undo
    this.classList.remove("fa-check-square");
    this.classList.add("fa-undo-alt");

    // add new event listener to uncheck the item
    this.removeEventListener("click", completeItem);
    this.addEventListener("click", uncheckItem);

    // move item in localStorage from toDo to completed
    const item = this.closest(".to-do-item").children[0].innerHTML;
    removeLocal(item, "todo");
    addToLocalStorage(item, "completed");
}

/** unchecks item, moving it over to the to-do section */
function uncheckItem() {
    // move div over from completed to to-do section
    const toDoBox = document.getElementById("to-do");
    toDoBox.appendChild(this.closest(".to-do-item"));

    // change icon from undo to check
    this.classList.remove("fa-undo-alt");
    this.classList.add("fa-check-square");

    // add new event listener to check item
    this.removeEventListener("click", uncheckItem);
    this.addEventListener("click", completeItem);

    // move item in localStorage from completed to toDo
    const item = this.closest(".to-do-item").children[0].innerHTML;
    removeLocal(item, "completed");
    addToLocalStorage(item, "todo");
}

/** handles removing items from localStorage */
function removeLocal(item, list) {
    // checking which list item is in
    if (list === "todo") {
        const arr = localStorage.toDo.split(",");
        // this check is to avoid an empty string in localStorage if there's only one item
        if (arr.length > 1) {
            arr.splice(arr.indexOf(item), 1);
            localStorage.toDo = arr;
        } else {
            delete localStorage.toDo;
        }
    } else if (list === "completed") {
        const arr = localStorage.completed.split(",");
        // this check is to avoid an empty string in localStorage if there's only one item
        if (arr.length > 1) {
            arr.splice(arr.indexOf(item), 1);
            localStorage.completed = arr;
        } else {
            delete localStorage.completed;
        }
    }
}

/** loads items from toDo localStorage value */
function getToDoLocalStorage() {
    if ("toDo" in localStorage) {
        const arr = localStorage.toDo.split(",");
        const toDoContainer = document.getElementById("to-do");

        for (const note of arr) {
            toDoContainer.appendChild(createNote(note, "todo"));
            addToDoListeners();
        }
    }
}

/** loads items from completed localStorage value */
function getCompletedLocalStorage() {
    if ("completed" in localStorage) {
        const arr = localStorage.completed.split(",");
        const completedContainer = document.getElementById("completed");

        for (const note of arr) {
            completedContainer.appendChild(createNote(note, "completed"));
            addCompletedListeners();
        }
    }
}
