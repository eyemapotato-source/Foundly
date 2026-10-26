// ========================================
// FOUNDLY WEBSITE
// JavaScript
// ========================================


// Get the Report Item form
const reportForm = document.getElementById("reportForm");


// Only run this code if we are on report.html
if (reportForm) {

    reportForm.addEventListener("submit", function(event) {

        // Stop the page from refreshing
        event.preventDefault();


        // Get the selected Lost / Found option
        const selectedType =
            document.querySelector(
                'input[name="reportType"]:checked'
            );


        // Get information from the form
        const itemName =
            document.getElementById("itemName").value;

        const category =
            document.getElementById("category").value;

        const description =
            document.getElementById("description").value;

        const location =
            document.getElementById("location").value;

        const date =
            document.getElementById("date").value;

        const contact =
            document.getElementById("contact").value;
	const photoInput =
    document.getElementById("photo");

const photoFile =
    photoInput.files[0];	


        // Make an item object
        // Function that saves the report
function saveReport(photoData) {

    const newItem = {

        id: Date.now(),

        type: selectedType.value,

        name: itemName,

        category: category,

        description: description,

        location: location,

        date: date,

        contact: contact,

        photo: photoData

    };


    let reports =
        JSON.parse(
            localStorage.getItem(
                "foundlyReports"
            )
        ) || [];


    reports.push(newItem);


    try {

        localStorage.setItem(
            "foundlyReports",
            JSON.stringify(reports)
        );


        document.getElementById(
            "successMessage"
        ).style.display = "flex";


        reportForm.reset();

    }

    catch (error) {

        alert(
            "The image is too large. " +
            "Please choose a smaller photo."
        );

    }

}


// If user selected a photo
if (photoFile) {

    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            saveReport(
                event.target.result
            );

        };


    reader.readAsDataURL(photoFile);

}


// If there is no photo
else {

    saveReport("");

}

    });

}



// ========================================
// CLOSE SUCCESS MESSAGE
// ========================================

function closeMessage() {

    document.getElementById(
        "successMessage"
    ).style.display = "none";

}


// ========================================
// SEARCH ITEMS PAGE
// ========================================

const searchItems =
    document.getElementById("searchItems");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");


// Current selected filter
let currentFilter = "All";


// Only run if we are on search.html
if (searchItems) {

    displayReports();

}


// ========================================
// DISPLAY REPORTS
// ========================================

function displayReports() {

    // Get reports saved from Report Item page
    let reports =
        JSON.parse(
            localStorage.getItem("foundlyReports")
        ) || [];


    // Get search text
    let searchText = "";

    if (searchInput) {

        searchText =
            searchInput.value
            .toLowerCase()
            .trim();

    }


    // Filter reports
    let filteredReports =
        reports.filter(function(item) {

            const matchesSearch =

                item.name.toLowerCase()
                    .includes(searchText)

                ||

                item.description.toLowerCase()
                    .includes(searchText)

                ||

                item.category.toLowerCase()
                    .includes(searchText)

                ||

                item.location.toLowerCase()
                    .includes(searchText);


            const matchesFilter =

                currentFilter === "All"

                ||

                item.type === currentFilter;


            return matchesSearch && matchesFilter;

        });


    // Remove old cards
    searchItems.innerHTML = "";


    // Update number of items
    resultCount.textContent =
        filteredReports.length +
        (filteredReports.length === 1
            ? " item"
            : " items");


    // Show "No Items Found"
    if (filteredReports.length === 0) {

        noResults.style.display = "block";

        return;

    }


    // Hide no results message
    noResults.style.display = "none";


    // Create a card for every report
    filteredReports.forEach(
        function(item, index) {


            // Pick an emoji based on category
            let emoji = "📦";


            if (item.category === "Bags") {
                emoji = "🎒";
            }

            else if (
                item.category ===
                "Identification Cards"
            ) {
                emoji = "🪪";
            }

            else if (
                item.category ===
                "Electronics"
            ) {
                emoji = "📱";
            }

            else if (
                item.category ===
                "School Supplies"
            ) {
                emoji = "✏️";
            }

            else if (
                item.category ===
                "Clothing"
            ) {
                emoji = "👕";
            }

            else if (
                item.category ===
                "Accessories"
            ) {
                emoji = "⌚";
            }

            else if (
                item.category ===
                "Keys"
            ) {
                emoji = "🔑";
            }


            // Decide LOST or FOUND tag
            let tagClass =
                item.type === "Lost"
                ? "lost-tag"
                : "found-tag";


            // Create card
            const card =
                document.createElement("div");


            card.className =
                "search-item-card";


            card.innerHTML = `

                <div class="search-item-image">

    ${
        item.photo

        ? `<img
               src="${item.photo}"
               alt="${item.name}"
           >`

        : emoji
    }

</div>	


                <div class="search-item-info">

                    <span class="${tagClass}">
                        ${item.type.toUpperCase()}
                    </span>

			${
    item.status === "Resolved"

    ? `<span class="resolved-tag">
           ✓ RESOLVED
       </span>`

    : ""
}


                    <h3>
                        ${item.name}
                    </h3>


                    <p class="search-description">
                        ${item.description}
                    </p>


                    <div class="item-extra">

                        <p>
                            📍 ${item.location}
                        </p>

                        <p>
                            📅 ${formatDate(item.date)}
                        </p>

                        <p>
                            🏷️ ${item.category}
                        </p>

                    </div>


                    <a
   				href="details.html?id=${item.id}"
			class="view-item-btn"
					>
 			View Item Details
		</a>

                </div>

            `;


            searchItems.appendChild(card);

        }
    );

}



// ========================================
// SEARCH WHILE TYPING
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            displayReports();

        }
    );

}



// ========================================
// LOST / FOUND FILTERS
// ========================================

filterButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {


                // Remove active button
                filterButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // Highlight clicked button
                button.classList.add(
                    "active"
                );


                // Change filter
                currentFilter =
                    button.dataset.filter;


                // Display filtered reports
                displayReports();

            }
        );

    }
);



// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "No date provided";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}



// ========================================
// ITEM DETAILS PAGE
// ========================================

const itemDetails =
    document.getElementById("itemDetails");


// Only run on details.html
if (itemDetails) {

    displayItemDetails();

}


// ========================================
// DISPLAY SELECTED ITEM
// ========================================

function displayItemDetails() {

    // Get ID from the website address
    const parameters =
        new URLSearchParams(
            window.location.search
        );


    const itemId =
        parameters.get("id");


    // Get all saved reports
    const reports =
        JSON.parse(
            localStorage.getItem("foundlyReports")
        ) || [];


    // Find the selected item
    const selectedItem =
        reports.find(
            function(item) {

                return String(item.id) === itemId;

            }
        );


    // If item cannot be found
    if (!selectedItem) {

        itemDetails.innerHTML = `

            <div class="item-not-found">

                <div>🔎</div>

                <h2>Item Not Found</h2>

                <p>
                    This report may no longer
                    be available.
                </p>

                <a href="search.html">
                    Back to Search
                </a>

            </div>

        `;

        return;

    }


    // Choose item emoji
    let emoji = "📦";


    if (selectedItem.category === "Bags") {

        emoji = "🎒";

    }

    else if (
        selectedItem.category ===
        "Identification Cards"
    ) {

        emoji = "🪪";

    }

    else if (
        selectedItem.category ===
        "Electronics"
    ) {

        emoji = "📱";

    }

    else if (
        selectedItem.category ===
        "School Supplies"
    ) {

        emoji = "✏️";

    }

    else if (
        selectedItem.category ===
        "Clothing"
    ) {

        emoji = "👕";

    }

    else if (
        selectedItem.category ===
        "Accessories"
    ) {

        emoji = "⌚";

    }

    else if (
        selectedItem.category ===
        "Keys"
    ) {

        emoji = "🔑";

    }


    // LOST or FOUND style
    const tagClass =
        selectedItem.type === "Lost"
        ? "lost-tag"
        : "found-tag";


    // Put information on the page
    itemDetails.innerHTML = `

    <div class="details-visual">

        ${
            selectedItem.photo

            ? `<img
                   src="${selectedItem.photo}"
                   alt="${selectedItem.name}"
               >`

            : emoji
        }

    </div>


        <div class="details-content">

            <span class="${tagClass}">

                ${selectedItem.type.toUpperCase()}

            </span>
		${
    selectedItem.status === "Resolved"

    ? `<span class="resolved-tag">
           ✓ RESOLVED
       </span>`

    : ""
}


            <h1>
                ${selectedItem.name}
            </h1>


            <span class="details-category">

                ${selectedItem.category}

            </span>


            <p class="details-description">

                ${selectedItem.description}

            </p>


            <div class="details-info">


                <div class="detail-row">

                    <div class="detail-icon">
                        📍
                    </div>

                    <div>

                        <small>
                            Location
                        </small>

                        <p>
                            ${selectedItem.location}
                        </p>

                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-icon">
                        📅
                    </div>

                    <div>

                        <small>
                            Date ${selectedItem.type}
                        </small>

                        <p>
                            ${formatDate(
                                selectedItem.date
                            )}
                        </p>

                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-icon">
                        🏷️
                    </div>

                    <div>

                        <small>
                            Report Type
                        </small>

                        <p>
                            ${selectedItem.type} Item
                        </p>

                    </div>

                </div>


            </div>


            <div class="contact-box">

                <h3>
                    👤 Contact / Claim Information
                </h3>

                <p>
                    Think this item belongs to you
                    or you know who owns it?
                    Use the contact information below.
                </p>

                <div class="contact-information">

                    ${selectedItem.contact}

                </div>

            </div>
		<div class="manage-report">

    <h3>Manage Report</h3>

    <p>
        If the item has already been returned,
        you can mark this report as resolved.
    </p>

    <div class="manage-buttons">

        <button
            class="resolve-btn"
            onclick="resolveReport(${selectedItem.id})"
        >
            ✓ Mark as Resolved
        </button>

        <button
            class="delete-btn"
            onclick="deleteReport(${selectedItem.id})"
        >
            🗑 Delete Report
        </button>

    </div>

</div>


        </div>

    `;

}




// ========================================
// ABOUT US - MESSAGE FORM
// ========================================

const messageForm =
    document.getElementById("messageForm");


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            // Get information from the form
            const name =
                document.getElementById(
                    "messageName"
                ).value;


            const email =
                document.getElementById(
                    "messageEmail"
                ).value;


            const subject =
                document.getElementById(
                    "messageSubject"
                ).value;


            const message =
                document.getElementById(
                    "messageText"
                ).value;


            // Create message object
            const newMessage = {

                id: Date.now(),

                name: name,

                email: email,

                subject: subject,

                message: message,

                date: new Date()
                    .toLocaleString()

            };


            // Get previously saved messages
            let messages =
                JSON.parse(
                    localStorage.getItem(
                        "foundlyMessages"
                    )
                ) || [];


            // Add new message
            messages.push(newMessage);


            // Save messages
            localStorage.setItem(
                "foundlyMessages",
                JSON.stringify(messages)
            );


            // Show popup
            document.getElementById(
                "messageSuccess"
            ).style.display = "flex";


            // Clear form
            messageForm.reset();

        }
    );

}


// ========================================
// CLOSE MESSAGE POPUP
// ========================================

function closeMessageSuccess() {

    document.getElementById(
        "messageSuccess"
    ).style.display = "none";

}



// ========================================
// HOME PAGE - RECENT REPORTS
// ========================================

const homeRecentItems =
    document.getElementById("homeRecentItems");

const homeEmpty =
    document.getElementById("homeEmpty");


if (homeRecentItems) {

    displayHomeReports();

}


function displayHomeReports() {

    // Get saved reports
    let reports =
        JSON.parse(
            localStorage.getItem("foundlyReports")
        ) || [];


    // Only use reports that have an ID
    reports =
        reports.filter(function(item) {

            return item.id;

        });


    // Get the newest 3 reports
    const recentReports =
        reports.slice(-3).reverse();


    // Clear the section
    homeRecentItems.innerHTML = "";


    // If there are no reports
    if (recentReports.length === 0) {

        homeEmpty.style.display = "block";

        return;

    }


    // Hide empty message
    homeEmpty.style.display = "none";


    // Create each item
    recentReports.forEach(
        function(item) {


            let emoji = "📦";


            if (item.category === "Bags") {

                emoji = "🎒";

            }

            else if (
                item.category ===
                "Identification Cards"
            ) {

                emoji = "🪪";

            }

            else if (
                item.category ===
                "Electronics"
            ) {

                emoji = "📱";

            }

            else if (
                item.category ===
                "School Supplies"
            ) {

                emoji = "✏️";

            }

            else if (
                item.category ===
                "Clothing"
            ) {

                emoji = "👕";

            }

            else if (
                item.category ===
                "Accessories"
            ) {

                emoji = "⌚";

            }

            else if (
                item.category ===
                "Keys"
            ) {

                emoji = "🔑";

            }


            const tagClass =
                item.type === "Lost"
                ? "lost-tag"
                : "found-tag";


            const card =
                document.createElement("div");


            card.className =
                "item-card";


            card.innerHTML = `

    <div class="item-image">

        ${
            item.photo

            ? `<img
                   src="${item.photo}"
                   alt="${item.name}"
               >`

            : emoji
        }

    </div>


                <span class="${tagClass}">

                    ${item.type.toUpperCase()}

                </span>
		


                <h3>

                    ${item.name}

                </h3>


                <p>

                    ${item.description}

                </p>


                <small>

                    📍 ${item.location}

                </small>


                <a
                    href="details.html?id=${item.id}"
                    class="home-details-btn"
                >

                    View Details →

                </a>

            `;


            homeRecentItems.appendChild(card);

        }
    );

}



// ========================================
// MANAGE REPORTS
// ========================================


// MARK REPORT AS RESOLVED

function resolveReport(itemId) {

    let reports =
        JSON.parse(
            localStorage.getItem("foundlyReports")
        ) || [];


    const report =
        reports.find(function(item) {

            return item.id === itemId;

        });


    if (!report) {
        return;
    }


    const confirmed =
        confirm(
            "Has this item already been returned or recovered?"
        );


    if (!confirmed) {
        return;
    }


    report.status = "Resolved";


    localStorage.setItem(
        "foundlyReports",
        JSON.stringify(reports)
    );


    alert(
        "This report has been marked as resolved!"
    );


    displayItemDetails();

}



// ========================================
// DELETE REPORT
// ========================================

function deleteReport(itemId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this report?"
        );


    if (!confirmed) {
        return;
    }


    let reports =
        JSON.parse(
            localStorage.getItem("foundlyReports")
        ) || [];


    reports =
        reports.filter(function(item) {

            return item.id !== itemId;

        });


    localStorage.setItem(
        "foundlyReports",
        JSON.stringify(reports)
    );


    alert(
        "Report deleted successfully."
    );


    window.location.href =
        "search.html";

}