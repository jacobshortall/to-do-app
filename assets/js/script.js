/* eslint-disable comma-dangle */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */

/** This function is responsible for adding event listeners to elements
 * that are present on page load, and loading previously added items
 * from localStorage
 */
function initialiseApp() {
    const addNoteButton = document.getElementsByClassName("fa-plus")[0];
    addNoteButton.addEventListener("click", showModal);

    const clearButtons = document.getElementsByClassName("fa-trash");
    for (const button of clearButtons) {
        button.addEventListener("click", clearAll);
    }

    const modalCross = document.getElementsByClassName("fa-times")[0];
    modalCross.addEventListener("click", closeModal);

    const confNote = document.getElementById("add-conf");
    confNote.addEventListener("click", addNote);

    const textArea = document.getElementById("note-input");
    textArea.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addNote();
        } else if (event.key === "Escape") {
            closeModal();
        }
    });

    getToDoLocalStorage();
    getCompletedLocalStorage();
}

/** Darkens background, displays modal for user to enter text, and
 * sets focus upon displaying.
 */
function showModal() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    const modal = document.getElementById("modal");
    modal.style.display = "flex";

    document.getElementById("note-input").focus();
}

/** Removes darkened background and closes modal */
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";

    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
}

/** This function handles the adding of a note. It checks that the
 * user has entered some text, adds the text to the to-do list and
 * localStorage, and add necessary event listeners.
 */
function addNote() {
    const textArea = document.getElementById("note-input");
    const toDoContainer = document.getElementById("to-do");

    if (textArea.value) {
        toDoContainer.appendChild(createNote(textArea.value, "todo"));

        addToLocalStorage(textArea.value, "todo");

        addToDoListeners();

        textArea.value = "";
        textArea.focus();
    } else {
        alert("Please enter some text.");
    }
}

/** creates note element from given user input and returns it
 * to be used by other functions
 */
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

/** Adds user input to localStorage so it's saved on reload */
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

/** Clears all items from either the to-do or completed list */
function clearAll() {
    // check which list to clear by grabbing class attribute
    if (this.classList.contains("to-do-clear")) {
        document.getElementById("to-do").innerHTML = "";
        delete localStorage.toDo;
    } else {
        document.getElementById("completed").innerHTML = "";
        delete localStorage.completed;
    }
}

/** Adds event listeners to each button when new item is added to to-do list */
function addToDoListeners() {
    const newItem = document.getElementById("to-do").lastChild;
    newItem
        .getElementsByClassName("fa-ban")[0]
        .addEventListener("click", deleteItem);
    newItem
        .getElementsByClassName("fa-check-square")[0]
        .addEventListener("click", completeItem);
}

/** Adds event listeners to each button when new item is added to completed list */
function addCompletedListeners() {
    const newItem = document.getElementById("completed").lastChild;
    newItem
        .getElementsByClassName("fa-ban")[0]
        .addEventListener("click", deleteItem);
    newItem
        .getElementsByClassName("fa-undo-alt")[0]
        .addEventListener("click", uncheckItem);
}

/** Deletes single item from list */
function deleteItem() {
    // checks which list the item is in so it can be correctly removed from localStorage
    if (
        this.closest(".button-cont").children[0].classList.contains(
            "fa-undo-alt"
        )
    ) {
        removeLocal(
            this.closest(".to-do-item").children[0].innerHTML,
            "completed"
        );
    } else {
        removeLocal(this.closest(".to-do-item").children[0].innerHTML, "todo");
    }

    this.closest(".to-do-item").remove();
}

/** Marks item as completed, moving it over to the completed section,
 * handling localStorage movement and adding appropriate event listener
 */
function completeItem() {
    const completedBox = document.getElementById("completed");
    completedBox.appendChild(this.closest(".to-do-item"));

    this.classList.remove("fa-check-square");
    this.classList.add("fa-undo-alt");

    this.removeEventListener("click", completeItem);
    this.addEventListener("click", uncheckItem);

    const item = this.closest(".to-do-item").children[0].innerHTML;
    removeLocal(item, "todo");
    addToLocalStorage(item, "completed");
}

/** Marks item as incomplete, moving it over to the to-do section,
 * handling localStorage movement and adding appropriate event listener
 */
function uncheckItem() {
    const toDoBox = document.getElementById("to-do");
    toDoBox.appendChild(this.closest(".to-do-item"));

    this.classList.remove("fa-undo-alt");
    this.classList.add("fa-check-square");

    this.removeEventListener("click", uncheckItem);
    this.addEventListener("click", completeItem);

    const item = this.closest(".to-do-item").children[0].innerHTML;
    removeLocal(item, "completed");
    addToLocalStorage(item, "todo");
}

/** Removes a single item from localStorage, given the item's text
 * and list type as parameters. If there is only one item in the
 * value for the respective localStorage, it will be deleted to
 * avoid an empty string.
 */
function removeLocal(item, list) {
    if (list === "todo") {
        const arr = localStorage.toDo.split(",");
        if (arr.length > 1) {
            arr.splice(arr.indexOf(item), 1);
            localStorage.toDo = arr;
        } else {
            delete localStorage.toDo;
        }
    } else if (list === "completed") {
        const arr = localStorage.completed.split(",");
        if (arr.length > 1) {
            arr.splice(arr.indexOf(item), 1);
            localStorage.completed = arr;
        } else {
            delete localStorage.completed;
        }
    }
}

/** Loads items from toDo localStorage value */
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

/** Loads items from completed localStorage value */
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

// calls function to initialise app when DOM content is loaded
document.addEventListener("DOMContentLoaded", initialiseApp);
