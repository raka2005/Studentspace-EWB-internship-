
const API_URL = "/students";

const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const toast = document.getElementById("toast");

let students = [];
let editingId = null;
let searchTimer;

// Escape HTML to safely display student data.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Make requests to the FastAPI backend.
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? {
                "Content-Type": "application/json"
            } : {}),
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { detail: text };
        }
    }

    if (!response.ok) {
        let message = data?.detail || "Something went wrong.";

        if (Array.isArray(message)) {
            message = message.map(item => item.msg).join(", ");
        }

        throw new Error(message);
    }

    return data;
}

// Display success and error messages.
function showToast(message, error = false) {
    toast.textContent = message;
    toast.className = error ? "toast show error" : "toast show";

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.className = "toast";
    }, 3500);
}

// Format date as DD/MM/YYYY.
function formatDate(date) {
    if (!date) return "—";

    const parts = String(date).split("-");

    if (parts.length !== 3) {
        return escapeHTML(date);
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Generate student initials.
function getInitials(name) {
    return String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0] || "")
        .join("")
        .toUpperCase();
}

// Load students from the database through FastAPI.
async function loadStudents() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                Loading student records...
            </td>
        </tr>
    `;

    try {
        const search = searchInput.value.trim();

        const url = search
            ? `${API_URL}?search=${encodeURIComponent(search)}`
            : API_URL;

        const data = await apiRequest(url);

        students = Array.isArray(data) ? data : [];

        renderStudents();
        updateStatistics();

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Could not load students.<br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        updateStatistics([]);
        showToast(error.message, true);
    }
}

// Display all loaded student records.
function renderStudents() {
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No students found. Add a student to get started ✿
                </td>
            </tr>
        `;
        return;
    }

    const avatarColors = ["", "mint", "peach", "rose"];

    tableBody.innerHTML = students.map((student, index) => {
        const color = avatarColors[index % avatarColors.length];
        const contact = student.email || student.phone || "No contact";
        const course = student.course || "Not specified";

        return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <div class="avatar ${color}">
                            ${escapeHTML(getInitials(student.name))}
                        </div>
                        <div>
                            <strong style="color:#454159">
                                ${escapeHTML(student.name)}
                            </strong>
                            <div style="font-size:10px;color:#aaa5b7;margin-top:4px">
                                ${escapeHTML(student.email || "No email")}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="id-pill">
                        STU-${String(student.id).padStart(3, "0")}
                    </span>
                </td>

                <td>${formatDate(student.date_of_birth)}</td>

                <td>
                    <span class="course-pill">
                        ${escapeHTML(course)}
                    </span>
                </td>

                <td>${escapeHTML(contact)}</td>

                <td>
                    <button
                        type="button"
                        data-action="edit"
                        data-id="${Number(student.id)}"
                        aria-label="Edit student"
                    >✎ Edit</button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-id="${Number(student.id)}"
                        aria-label="Delete student"
                    >× Delete</button>
                </td>
            </tr>
        `;
    }).join("");
}

// Update the dashboard summary cards.
function updateStatistics(list = students) {
    document.getElementById("totalStudents").textContent = list.length;

    const courses = new Set(
        list.map(student => (student.course || "").trim())
            .filter(Boolean)
    );

    document.getElementById("totalCourses").textContent = courses.size;

    const contacts = list.filter(
        student => student.email || student.phone
    ).length;

    document.getElementById("contactCount").textContent = contacts;
}

// Open the add/edit form.
function openModal(student = null) {
    editingId = student ? student.id : null;

    studentForm.reset();

    document.getElementById("modalTitle").textContent =
        student ? "Edit Student" : "Add Student";

    document.getElementById("saveBtn").textContent =
        student ? "Save Changes" : "Save Student";

    if (student) {
        document.getElementById("name").value =
            student.name || "";

        document.getElementById("dob").value =
            student.date_of_birth || "";

        document.getElementById("email").value =
            student.email || "";

        document.getElementById("phone").value =
            student.phone || "";

        document.getElementById("course").value =
            student.course || "";

        document.getElementById("address").value =
            student.address || "";
    }

    modal.classList.add("open");
    document.getElementById("name").focus();
}

// Close and reset the form.
function closeModal() {
    modal.classList.remove("open");
    studentForm.reset();
    editingId = null;
}

// Validate form fields and prepare API data.
function getFormData() {
    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const course = document.getElementById("course").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name) {
        throw new Error("Please enter the student's name.");
    }

    if (!dob) {
        throw new Error("Please select the date of birth.");
    }

    // Compare calendar dates rather than UTC timestamps.
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (dob > todayString) {
        throw new Error("Date of birth cannot be in the future.");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address.");
    }

    if (phone && !/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
        throw new Error("Please enter a valid phone number.");
    }

    return {
        name,
        date_of_birth: dob,
        email: email || null,
        phone: phone || null,
        course: course || null,
        address: address || null
    };
}

// Add a new student or update an existing student.
studentForm.addEventListener("submit", async event => {
    event.preventDefault();

    let payload;

    try {
        payload = getFormData();
    } catch (error) {
        showToast(error.message, true);
        return;
    }

    const saveButton = document.getElementById("saveBtn");
    const wasEditing = editingId !== null;
    const originalButtonText = saveButton.textContent;

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        if (wasEditing) {
            await apiRequest(`${API_URL}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            showToast("Student updated successfully ✿");

        } else {
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            showToast("Student added successfully ✿");
        }

        closeModal();
        await loadStudents();

    } catch (error) {
        showToast(error.message, true);

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = originalButtonText;
    }
});

// Delete a student after confirmation.
async function deleteStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
        `Are you sure you want to delete ${student.name}'s record?`
    );

    if (!confirmed) return;

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showToast("Student deleted successfully.");
        await loadStudents();

    } catch (error) {
        showToast(error.message, true);
    }
}

// Export currently displayed student records as CSV.
function exportStudentsCSV() {
    if (students.length === 0) {
        showToast("No student records to export.", true);
        return;
    }

    const columns = [
        ["id", "Student ID"],
        ["name", "Name"],
        ["date_of_birth", "Date of Birth"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["course", "Course"],
        ["address", "Address"]
    ];

    function csvCell(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    const rows = [
        columns.map(column => csvCell(column[1])).join(","),
        ...students.map(student =>
            columns.map(column => csvCell(student[column[0]])).join(",")
        )
    ];

    const csv = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student_records.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke after the browser has had time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast("CSV file downloaded successfully!");
}

// Connect dashboard buttons.
document.getElementById("addStudentBtn")
    .addEventListener("click", () => openModal());

document.getElementById("refreshBtn")
    .addEventListener("click", loadStudents);

document.getElementById("closeModal")
    .addEventListener("click", closeModal);

document.getElementById("cancelBtn")
    .addEventListener("click", closeModal);

// Connect CSV export if the button exists in index.html.
const exportButton = document.getElementById("exportBtn");

if (exportButton) {
    exportButton.addEventListener("click", exportStudentsCSV);
}

// Close the modal when clicking outside it.
modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

// Close the modal with Escape.
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }

    // Ctrl+K or Cmd+K focuses search.
    if ((event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.focus();
    }
});

// Handle Edit and Delete buttons.
tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "edit") {
        const student = students.find(item => item.id === id);

        if (student) {
            openModal(student);
        }

    } else if (button.dataset.action === "delete") {
        deleteStudent(id);
    }
});

// Search students with a short delay while typing.
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadStudents, 250);
});

// Load student records when the page opens.
loadStudents();
