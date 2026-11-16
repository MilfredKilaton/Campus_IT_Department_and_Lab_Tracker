const API = "/api/asset";
const panelTitle = document.getElementById("panel-title");
const allViews = document.querySelectorAll(".view-panel");
const actionButtons = document.querySelectorAll(".action-btn");
const typeDropdown = document.getElementById("add-type");
const rowNetwork = document.getElementById("row-network");
const rowLicense = document.getElementById("row-license");

function switchView(title, targetViewId) {
    panelTitle.textContent = title;
    allViews.forEach(view => view.hidden = true);
    document.getElementById(targetViewId).hidden = false;
}

// Helper to show message and turn input box red
function showError(elementId, message, inputElement = null) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.hidden = false;
        el.classList.remove("success", "error");
        el.classList.add("error");
    }
    if (inputElement) {
        inputElement.classList.add("input-error");
        inputElement.focus();
    }
}

function clearErrors() {
    document.querySelectorAll(".input-error").forEach(input => input.classList.remove("input-error"));
    document.querySelectorAll(".message").forEach(msg => msg.hidden = true);
}

// Sidebar Navigation (Adds the active state)
document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener("click", (e) => {
        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        // Add active class to clicked one
        e.currentTarget.classList.add('active');

        const view = e.currentTarget.getAttribute('data-view');
        clearErrors();

        if (view === "add") switchView("New Asset", "view-add");
        if (view === "list") { switchView("View All Assets", "view-list"); loadAssets(); }
        if (view === "checkout") { switchView("Check Out", "view-checkout"); loadDropdowns(); }
        if (view === "checkin") { switchView("Check In", "view-checkin"); loadDropdowns(); }
        if (view === "depreciation") { switchView("Depreciation", "view-depreciation"); loadDepreciation(); }
        if (view === "network") { switchView("Network Devices", "view-network"); loadNetwork(); }
    });
});

typeDropdown.addEventListener("change", () => {
    const selectedType = typeDropdown.value;
    if (selectedType === "SoftwareLicense") {
        rowNetwork.style.display = "none";
        rowLicense.style.display = "grid";
    }
    else if (selectedType === "Peripheral") {
        rowNetwork.style.display = "none";
        rowLicense.style.display = "none";
    }
    else {
        rowNetwork.style.display = "grid";
        rowLicense.style.display = "none";
    }
});

// Clear red borders on input
document.getElementById("form-add").addEventListener("input", clearErrors);
document.getElementById("form-edit").addEventListener("input", clearErrors);

actionButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
        event.preventDefault();
        if (button.id !== "btn-addAsset") return;

        const selectedType = typeDropdown.value;
        clearErrors();

        const tagEl = document.getElementById("add-tag");
        const nameEl = document.getElementById("add-name");
        const priceEl = document.getElementById("add-price");

        const tag = tagEl.value.trim();
        const name = nameEl.value.trim();
        const price = parseFloat(priceEl.value);

        if (!tag) return showError("add-result", "Asset Tag is required.", tagEl);
        if (tag.length > 20) return showError("add-result", "Asset Tag must be 20 characters or fewer.", tagEl);
        if (!name) return showError("add-result", "Asset Name is required.", nameEl);
        if (isNaN(price) || price <= 0) return showError("add-result", "Purchase Price must be greater than zero.", priceEl);

        const payload = { type: selectedType, assetTag: tag, assetName: name, purchasePrice: price };

        if (selectedType === "WorkStation" || selectedType === "NetworkingHardware") {
            const ipEl = document.getElementById("add-ip");
            const macEl = document.getElementById("add-mac");
            const ip = ipEl.value.trim();
            const mac = macEl.value.trim();

            if (ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip))
                return showError("add-result", "Invalid IP address.", ipEl);
            if (ip) {
                const octets = ip.split(".").map(Number);
                if (octets.some(o => o > 255))
                    return showError("add-result", "IP octets must be 0-255.", ipEl);
            }
            if (mac && !/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac))
                return showError("add-result", "Invalid MAC address.", macEl);

            payload.ipAddress = ip;
            payload.macAddress = mac;
        } else if (selectedType === "SoftwareLicense") {
            const monthsEl = document.getElementById("add-months");
            const months = parseInt(monthsEl.value);
            if (isNaN(months) || months < 0) return showError("add-result", "Months must be 0 or more.", monthsEl);
            payload.remainingMonths = months;
        }

        try {
            const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(await response.text());

            document.getElementById("form-add").reset();
            document.getElementById("row-license").style.display = "none";
            document.getElementById("row-network").style.display = "grid";

            const el = document.getElementById("add-result");
            el.textContent = `Asset "${tag}" added successfully.`;
            el.hidden = false;
            el.className = "message success";
        } catch (error) {
            showError("add-result", error.message, tagEl);
        }
    });
});

// --- EDIT MODAL VALIDATION ---
const formEdit = document.getElementById("form-edit");
const editModal = document.getElementById("edit-modal");

document.getElementById("btn-cancel-edit").addEventListener("click", () => {
    editModal.style.display = "none";
});

formEdit.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const nameEl = document.getElementById("edit-name");
    const priceEl = document.getElementById("edit-price");

    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);

    if (!name) return showError("edit-result", "Asset Name is required.", nameEl);
    if (isNaN(price) || price <= 0) return showError("edit-result", "Price must be greater than zero.", priceEl);

    const payload = {
        assetTag: document.getElementById("edit-tag").value,
        assetName: name,
        purchasePrice: price,
        status: document.getElementById("edit-status").value
    };

    try {
        const response = await fetch(`${API}/update`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(await response.text());
        alert("Asset updated successfully!");
        editModal.style.display = "none";
        loadAssets();
    } catch (error) {
        showError("edit-result", error.message);
    }
});

function openEditModal(asset) {
    clearErrors();
    document.getElementById("edit-tag").value = asset.assetTag;
    document.getElementById("edit-name").value = asset.assetName;
    document.getElementById("edit-price").value = asset.purchasePrice;
    document.getElementById("edit-status").value = asset.status;
    editModal.style.display = "flex";
}

// --- FETCH FUNCTIONS ---
async function loadAssets() {
    const tbody = document.getElementById("list-body");
    const template = document.getElementById("asset-row-template");
    tbody.innerHTML = "<tr><td colspan='6' class='empty'>Loading...</td></tr>";

    try {
        const response = await fetch(API);
        const assets = await response.json();
        if (assets.length === 0) { tbody.innerHTML = "<tr><td colspan='6' class='empty'>No assets yet.</td></tr>"; return; }
        tbody.innerHTML = "";
        assets.forEach(asset => {
            const row = template.content.cloneNode(true);
            row.querySelector(".cell-tag").textContent = asset.assetTag;
            row.querySelector(".cell-name").textContent = asset.assetName;
            row.querySelector(".cell-type").textContent = asset.type;
            row.querySelector(".cell-price").textContent = asset.purchasePrice.toFixed(2);
            const statusBadge = row.querySelector(".cell-status");
            statusBadge.textContent = asset.status;
            statusBadge.classList.add(asset.status.toLowerCase());
            row.querySelector(".btn-edit").addEventListener("click", () => openEditModal(asset));
            row.querySelector(".btn-delete").addEventListener("click", () => deleteAsset(asset.assetTag));
            tbody.appendChild(row);
        });
    } catch (error) { tbody.innerHTML = `<tr><td colspan='6' class='empty'>Error: ${error.message}</td></tr>`; }
}

async function loadDepreciation() {
    const element = document.getElementById("depreciation-value");
    element.textContent = "Loading...";
    try {
        const [depResp, assetsResp] = await Promise.all([fetch(`${API}/depreciation`), fetch(API)]);
        const value = await depResp.json();
        const assets = await assetsResp.json();
        element.textContent = (!assets || assets.length === 0) ? "" : value.toFixed(2);
    } catch (error) { element.textContent = "Error"; }
}

async function loadNetwork() {
    const tbody = document.getElementById("network-body");
    tbody.innerHTML = "<tr><td colspan='3' class='empty'>Loading...</td></tr>";
    try {
        const response = await fetch(API);
        const assets = await response.json();
        const devices = assets.filter(a => a.type === "WorkStation" || a.type === "NetworkingHardware");
        if (devices.length === 0) { tbody.innerHTML = "<tr><td colspan='3' class='empty'>No network devices.</td></tr>"; return; }
        tbody.innerHTML = devices.map(d => `<tr><td>${d.assetTag}</td><td>${d.ipAddress || "-"}</td><td>${d.macAddress || "-"}</td></tr>`).join("");
    } catch (error) { tbody.innerHTML = `<tr><td colspan='3' class='empty'>Error: ${error.message}</td></tr>`; }
}

async function loadDropdowns() {
    try {
        const response = await fetch(API);
        const assets = await response.json();
        const borrowable = ["WorkStation", "Peripheral"];

        const outSelect = document.getElementById("checkout-tag");
        outSelect.innerHTML = '<option value="" disabled selected>-- Select an asset --</option>';
        assets.filter(a => a.status === "Available" && borrowable.includes(a.type)).forEach(a => {
            outSelect.innerHTML += `<option value="${a.assetTag}">${a.assetTag} (${a.type})</option>`;
        });

        const inSelect = document.getElementById("checkin-tag");
        inSelect.innerHTML = '<option value="" disabled selected>-- Select an asset --</option>';
        assets.filter(a => a.status === "CheckedOut").forEach(a => {
            inSelect.innerHTML += `<option value="${a.assetTag}">${a.assetTag}</option>`;
        });
    } catch (error) { console.error("Error loading dropdowns", error); }
}

async function deleteAsset(tag) {
    if (!confirm(`Are you sure you want to delete ${tag}?`)) return;
    try {
        const res = await fetch(`${API}/delete?tag=${encodeURIComponent(tag)}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        alert("Asset deleted!"); loadAssets();
    } catch (error) { alert("Error: " + error.message); }
}

// Checkout and Checkin Actions
document.getElementById("btn-checkout").addEventListener("click", async (e) => {
    e.preventDefault();
    const tag = document.getElementById("checkout-tag").value;
    const borrower = document.getElementById("checkout-borrower").value;
    try {
        const response = await fetch(`${API}/checkout?tag=${encodeURIComponent(tag)}&borrowerId=${encodeURIComponent(borrower)}`, { method: "POST" });
        if (!response.ok) throw new Error(await response.text());
        alert("Checked out successfully!");
        document.getElementById("form-checkout").reset();
    } catch (error) { alert("Error: " + error.message); }
});

document.getElementById("btn-checkin").addEventListener("click", async (e) => {
    e.preventDefault();
    const tag = document.getElementById("checkin-tag").value;
    try {
        const response = await fetch(`${API}/checkin?tag=${encodeURIComponent(tag)}`, { method: "POST" });
        if (!response.ok) throw new Error(await response.text());
        alert("Checked in successfully!");
        document.getElementById("form-checkin").reset();
    } catch (error) { alert("Error: " + error.message); }
});