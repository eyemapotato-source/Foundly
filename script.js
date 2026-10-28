
 // ========================================
 // FOUNDLY - SHARED DATABASE VERSION
 // ========================================

const FOUNDLY_SUPABASE_URL = "https://ddyttnlpdsyakneiqjpe.supabase.co";
const FOUNDLY_SUPABASE_KEY = "sb_publishable_qPiS7OGskIoN33_dMEa_Ag_v0xUinoZ";

let foundlyDb = null;

if (window.supabase && typeof window.supabase.createClient === "function") {
    foundlyDb = window.supabase.createClient(
        FOUNDLY_SUPABASE_URL,
        FOUNDLY_SUPABASE_KEY
    );
} else {
    console.error("FOUNDLY: Supabase library is missing. Add the Supabase CDN script before script.js on every page.");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

function formatDate(dateString) {
    if (!dateString) return "No date provided";

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) return escapeHTML(dateString);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function categoryEmoji(category) {
    const emojis = {
        "Bags": "🎒",
        "Identification Cards": "🪪",
        "Electronics": "📱",
        "School Supplies": "✏️",
        "Clothing": "👕",
        "Accessories": "⌚",
        "Keys": "🔑"
    };

    return emojis[category] || "📦";
}

// Convert Supabase records to the format used by FOUNDLY.
function normalizeReport(row) {
    return {
        id: row.id,
        type: row.report_type,
        name: row.item_name,
        category: row.category || "Others",
        description: row.description || "",
        location: row.location || "",
        date: row.item_date || "",
        contact: row.contact || "",
        photo: row.photo_url || "",
        status: row.status || "active",
        created_at: row.created_at
    };
}

// ========================================
// LOAD SHARED REPORTS
// ========================================

async function getReports() {
    if (!foundlyDb) return [];

    const { data, error } = await foundlyDb
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("FOUNDLY database error:", error);
        alert("Could not load reports. Please check your internet connection and Supabase settings.");
        return [];
    }

    return (data || []).map(normalizeReport);
}

// ========================================
// REPORT ITEM FORM
// ========================================

const reportForm = document.getElementById("reportForm");

if (reportForm) {
    reportForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!foundlyDb) {
            alert("The database connection is not ready. Please refresh the page.");
            return;
        }

        const submitButton = reportForm.querySelector('button[type="submit"]');
        const selectedType = document.querySelector(
            'input[name="reportType"]:checked'
        );

        const photoInput = document.getElementById("photo");
        const photoFile = photoInput && photoInput.files
            ? photoInput.files[0]
            : null;

        if (!selectedType) {
            alert("Please choose Lost Item or Found Item.");
            return;
        }

        if (photoFile && photoFile.size > 700 * 1024) {
            alert("Please choose a photo smaller than 700 KB for now.");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const photoData = photoFile
                ? await readFileAsDataURL(photoFile)
                : "";

            const newReport = {
                report_type: selectedType.value,
                item_name: document.getElementById("itemName").value.trim(),
                category: document.getElementById("category").value,
                description: document.getElementById("description").value.trim(),
                location: document.getElementById("location").value.trim(),
                item_date: document.getElementById("date").value || null,
                contact: document.getElementById("contact").value.trim(),
                photo_url: photoData,
                status: "active"
            };

            const { error } = await foundlyDb
                .from("reports")
                .insert([newReport]);

            if (error) throw error;

            const successMessage = document.getElementById("successMessage");

            if (successMessage) {
                successMessage.style.display = "flex";
            }

            reportForm.reset();

        } catch (error) {
            console.error("FOUNDLY submit error:", error);
            alert("Your report could not be saved. Please check your Supabase setup and try again.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Report";
            }
        }
    });
}

function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(new Error("Could not read the selected photo."));
        };

        reader.readAsDataURL(file);
    });
}

function closeMessage() {
    const successMessage = document.getElementById("successMessage");

    if (successMessage) {
        successMessage.style.display = "none";
    }
}

// ========================================
// SEARCH ITEMS PAGE
// ========================================

const searchItems = document.getElementById("searchItems");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const resultCount = document.getElementById("resultCount");
const noResults = document.getElementById("noResults");

let currentFilter = "All";

if (searchItems) {
    loadAndDisplayReports();

    if (searchInput) {
        searchInput.addEventListener("input", loadAndDisplayReports);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            currentFilter = button.dataset.filter || "All";

            loadAndDisplayReports();
        });
    });
}

async function loadAndDisplayReports() {
    if (!searchItems) return;

    const reports = await getReports();
    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredReports = reports.filter(function (item) {
        const matchesSearch = [
            item.name,
            item.description,
            item.category,
            item.location
        ].some(function (value) {
            return String(value || "").toLowerCase().includes(searchText);
        });

        const matchesFilter =
            currentFilter === "All" || item.type === currentFilter;

        return matchesSearch && matchesFilter;
    });

    searchItems.innerHTML = "";

    if (resultCount) {
        resultCount.textContent =
            filteredReports.length +
            (filteredReports.length === 1 ? " item" : " items");
    }

    if (noResults) {
        noResults.style.display = filteredReports.length ? "none" : "block";
    }

    filteredReports.forEach(function (item) {
        const tagClass = item.type === "Lost" ? "lost-tag" : "found-tag";

        const photoMarkup = item.photo
            ? `<img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.name)}">`
            : categoryEmoji(item.category);

        const card = document.createElement("div");
        card.className = "search-item-card";

        card.innerHTML = `
            <div class="search-item-image">${photoMarkup}</div>
            <div class="search-item-info">
                <span class="${tagClass}">${escapeHTML(item.type.toUpperCase())}</span>
                ${String(item.status).toLowerCase() === "resolved"
                    ? '<span class="resolved-tag">✓ RESOLVED</span>'
                    : ""}
                <h3>${escapeHTML(item.name)}</h3>
                <p class="search-description">${escapeHTML(item.description)}</p>
                <div class="item-extra">
                    <p>📍 ${escapeHTML(item.location)}</p>
                    <p>📅 ${escapeHTML(formatDate(item.date))}</p>
                    <p>🏷️ ${escapeHTML(item.category)}</p>
                </div>
                <a href="details.html?id=${encodeURIComponent(item.id)}"
                   class="view-item-btn">View Item Details</a>
            </div>
        `;

        searchItems.appendChild(card);
    });
}

// ========================================
// ITEM DETAILS PAGE
// ========================================

const itemDetails = document.getElementById("itemDetails");

if (itemDetails) {
    displayItemDetails();
}

async function displayItemDetails() {
    if (!itemDetails) return;

    const itemId = new URLSearchParams(window.location.search).get("id");
    const reports = await getReports();

    const selectedItem = reports.find(function (item) {
        return String(item.id) === String(itemId);
    });

    if (!selectedItem) {
        itemDetails.innerHTML = `
            <div class="item-not-found">
                <div>🔎</div>
                <h2>Item Not Found</h2>
                <p>This report may no longer be available.</p>
                <a href="search.html">Back to Search</a>
            </div>
        `;
        return;
    }

    const tagClass = selectedItem.type === "Lost" ? "lost-tag" : "found-tag";

    const photoMarkup = selectedItem.photo
        ? `<img src="${escapeHTML(selectedItem.photo)}" alt="${escapeHTML(selectedItem.name)}">`
        : categoryEmoji(selectedItem.category);

    itemDetails.innerHTML = `
        <div class="details-visual">${photoMarkup}</div>
        <div class="details-content">
            <span class="${tagClass}">${escapeHTML(selectedItem.type.toUpperCase())}</span>
            ${String(selectedItem.status).toLowerCase() === "resolved"
                ? '<span class="resolved-tag">✓ RESOLVED</span>'
                : ""}
            <h1>${escapeHTML(selectedItem.name)}</h1>
            <span class="details-category">${escapeHTML(selectedItem.category)}</span>
            <p class="details-description">${escapeHTML(selectedItem.description)}</p>
            <div class="details-info">
                <div class="detail-row">
                    <div class="detail-icon">📍</div>
                    <div><small>Location</small><p>${escapeHTML(selectedItem.location)}</p></div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon">📅</div>
                    <div><small>Date ${escapeHTML(selectedItem.type)}</small><p>${escapeHTML(formatDate(selectedItem.date))}</p></div>
                </div>
                <div class="detail-row">
                    <div class="detail-icon">🏷️</div>
                    <div><small>Report Type</small><p>${escapeHTML(selectedItem.type)} Item</p></div>
                </div>
            </div>
            <div class="contact-box">
                <h3>👤 Contact / Claim Information</h3>
                <p>Think this item belongs to you or you know who owns it? Use the contact information below.</p>
                <div class="contact-information">${escapeHTML(selectedItem.contact)}</div>
            </div>
            <p class="form-note">Report editing and deletion are disabled until owner/admin access is set up.</p>
        </div>
    `;
}

// ========================================
// ABOUT US - CONTACT MESSAGE FORM
// Messages still use localStorage for now.
// ========================================

const messageForm = document.getElementById("messageForm");

if (messageForm) {
    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newMessage = {
            id: Date.now(),
            name: document.getElementById("messageName").value,
            email: document.getElementById("messageEmail").value,
            subject: document.getElementById("messageSubject").value,
            message: document.getElementById("messageText").value,
            date: new Date().toLocaleString()
        };

        const messages = JSON.parse(
            localStorage.getItem("foundlyMessages") || "[]"
        );

        messages.push(newMessage);

        localStorage.setItem("foundlyMessages", JSON.stringify(messages));

        const success = document.getElementById("messageSuccess");

        if (success) {
            success.style.display = "flex";
        }

        messageForm.reset();
    });
}

function closeMessageSuccess() {
    const success = document.getElementById("messageSuccess");

    if (success) {
        success.style.display = "none";
    }
}

// ========================================
// HOME PAGE - RECENT REPORTS
// ========================================

const homeRecentItems = document.getElementById("homeRecentItems");
const homeEmpty = document.getElementById("homeEmpty");

if (homeRecentItems) {
    displayHomeReports();
}

async function displayHomeReports() {
    if (!homeRecentItems) return;

    const reports = await getReports();
    const recentReports = reports.slice(0, 3);

    homeRecentItems.innerHTML = "";

    if (!recentReports.length) {
        if (homeEmpty) homeEmpty.style.display = "block";
        return;
    }

    if (homeEmpty) homeEmpty.style.display = "none";

    recentReports.forEach(function (item) {
        const tagClass = item.type === "Lost" ? "lost-tag" : "found-tag";

        const photoMarkup = item.photo
            ? `<img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.name)}">`
            : categoryEmoji(item.category);

        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <div class="item-image">${photoMarkup}</div>
            <span class="${tagClass}">${escapeHTML(item.type.toUpperCase())}</span>
            <h3>${escapeHTML(item.name)}</h3>
            <p>${escapeHTML(item.description)}</p>
            <small>📍 ${escapeHTML(item.location)}</small>
            <a href="details.html?id=${encodeURIComponent(item.id)}"
               class="home-details-btn">View Details →</a>
        `;

        homeRecentItems.appendChild(card);
    });
}
