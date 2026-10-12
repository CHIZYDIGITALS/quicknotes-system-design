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

    statusEl.textContent = `Loaded ${notes.length} notes from the server.`;
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

// Helper to append a single note to the list
function appendNoteToDOM(note) {
  const li = document.createElement("li");

  const h3 = document.createElement("h3");
  h3.textContent = note.title;

  const p = document.createElement("p");
  p.textContent = note.body;

  li.appendChild(h3);
  li.appendChild(p);
  notesList.prepend(li); // Prepend so new notes appear at the top
}

// Task 2: Create Note (POST)
async function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    alert("Title is required");
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "Creating note...";
  statusEl.className = "status-message";

  try {
    const newNoteData = {
      title: title,
      body: body,
      userId: 1,
    };

    const createdNote = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(newNoteData),
    });

    statusEl.textContent = "Note created successfully!";
    statusEl.className = "status-message success";

    // Add the new note to the top of the list view
    appendNoteToDOM(createdNote);

    // Reset the form inputs
    noteForm.reset();
  } catch (error) {
    statusEl.textContent = "Failed to create note. Please try again.";
    statusEl.className = "status-message error";
  } finally {
    submitBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", handleFormSubmit);
