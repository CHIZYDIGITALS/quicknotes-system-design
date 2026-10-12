const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

// Reusable async request function
async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

// Task 1: Load Notes (GET)
async function loadNotes() {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading notes...";
  statusEl.className = "status-message";
  notesList.innerHTML = "";

  try {
    const notes = await request(`${API_URL}?_limit=10`);

    if (!notes || notes.length === 0) {
      statusEl.textContent = "No notes available.";
      notesList.innerHTML = "<li>No notes found.</li>";
      return;
    }

    statusEl.textContent = "Loaded 10 notes from the server.";
    statusEl.className = "status-message success";

    notes.forEach((note) => {
      appendNoteToDOM(note);
    });
  } catch (error) {
    statusEl.textContent = "Failed to load notes. Please try again later.";
    statusEl.className = "status-message error";
  } finally {
    loadBtn.disabled = false;
  }
}

// Helper to append a single note to the list with a Delete button
function appendNoteToDOM(note) {
  const li = document.createElement("li");
  li.dataset.id = note.id;

  const h3 = document.createElement("h3");
  h3.textContent = note.title;

  const p = document.createElement("p");
  p.textContent = note.body;

  // Task 3: Delete Button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.style.backgroundColor = "#dc3545";
  deleteBtn.style.marginTop = "10px";

  deleteBtn.addEventListener("click", () => deleteNote(note.id, li));

  li.appendChild(h3);
  li.appendChild(p);
  li.appendChild(deleteBtn);
  notesList.prepend(li);
}

// Task 2: Create Note (POST) with validation
async function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation: Title required and max 100 characters
  if (!title) {
    alert("Title is required.");
    return;
  }
  if (title.length > 100) {
    alert("Title cannot exceed 100 characters.");
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "Creating note...";
  statusEl.className = "status-message";

  try {
    const newNoteData = { title, body, userId: 1 };

    const createdNote = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(newNoteData),
    });

    statusEl.textContent = `Note created successfully! (status 201, id ${createdNote.id || 101})`;
    statusEl.className = "status-message success";

    appendNoteToDOM(createdNote);
    noteForm.reset();
  } catch (error) {
    statusEl.textContent = "Failed to create note. Please try again.";
    statusEl.className = "status-message error";
  } finally {
    submitBtn.disabled = false;
  }
}

// Task 3: Delete Note (DELETE)
async function deleteNote(id, listItemEl) {
  try {
    // Note: JSONPlaceholder is a mock API and does not permanently store created resources.
    // However, it successfully returns a 200 OK response for valid simulated IDs.
    await request(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    listItemEl.remove();
    statusEl.textContent = `Note ${id} deleted successfully.`;
    statusEl.className = "status-message success";
  } catch (error) {
    statusEl.textContent = `Failed to delete note ${id}.`;
    statusEl.className = "status-message error";
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", handleFormSubmit);
