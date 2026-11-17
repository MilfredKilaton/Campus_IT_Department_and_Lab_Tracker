const API = "/api/asset";
const panelTitle = document.getElementById("panel-title");
const allViews = document.querySelectorAll(".view-panel");
const typeDropdown = document.getElementById("add-type");
const rowNetwork = document.getElementById("row-network");
const rowLicense = document.getElementById("row-license");
const editModal = document.getElementById("edit-modal");
const networkModal = document.getElementById("network-modal");

let currentEditingTag = null;

function switchView(title, targetViewId) {
    panelTitle.textContent = title;
    allViews.forEach(view => view.hidden = true);
    document.getElementById(targetViewId).hidden = false;
}

function clearErrors() {
    document.querySelectorAll(".input-error").forEach(input => input.classList.remove("input-error"));
}

document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const view = e.currentTarget.getAttribute('data-view');
        clearErrors();

        if (view === "add") switchView("New Asset", "view-add");
        if (view === "list") { switchView("View All Assets", "view-list"); loadAssets(); }
        if (view === "checkout") { switchView("Check Out", "view-checkout"); loadSelectionTables(); }
        if (view === "checkin") { switchView("Check In", "view-checkin"); loadSelectionTables(); }
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

document.getElementById("form-add").addEventListener("input", clearErrors);

document.getElementById("btn-addAsset").addEventListener("click", async (event) => {
    event.preventDefault();
    const selectedType = typeDropdown.value;
    clearErrors();

    const tagEl = document.getElementById("add-tag");
    const nameEl = document.getElementById("add-name");
    const priceEl = document.getElementById("add-price");

    const tag = tagEl.value.trim();
    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);

    if (!tag) { tagEl.classList.add("input-error"); return alert("Asset Tag is required."); }
    if (!name) { nameEl.classList.add("input-error"); return alert("Asset Name is required."); }
    if (isNaN(price) || price <= 0) { priceEl.classList.add("input-error"); return alert("Purchase Price must be greater than zero."); }

    const payload = { type: selectedType, assetTag: tag, assetName: name, purchasePrice: price };

    if (selectedType === "WorkStation" || selectedType === "NetworkingHardware") {
        const ipEl = document.getElementById("add-ip");
        const macEl = document.getElementById("add-mac");
        const ip = ipEl.value.trim();
        const mac = macEl.value.trim();
        if (ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) { ipEl.classList.add("input-error"); return alert("Invalid IP."); }
        if (mac && !/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac)) { macEl.classList.add("input-error"); return alert("Invalid MAC."); }
        payload.ipAddress = ip;
        payload.macAddress = mac;
    } else if (selectedType === "SoftwareLicense") {
        const monthsEl = document.getElementById("add-months");
        const months = parseInt(monthsEl.value);
        if (isNaN(months) || months < 0) { monthsEl.classList.add("input-error"); return alert("Months must be 0+."); }
        payload.remainingMonths = months;
    }

    try {
        const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(await response.text());

        document.getElementById("form-add").reset();
        document.getElementById("row-license").style.display = "none";
        document.getElementById("row-network").style.display = "grid";

        alert(`Asset "${tag}" added successfully.`);
    } catch (error) {
        tagEl.classList.add("input-error");
        alert(error.message);
    }
});

// --- EDIT MODAL (GENERAL) ---
document.getElementById("btn-cancel-edit").addEventListener("click", () => editModal.style.display = "none");

document.getElementById("form-edit").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    const nameEl = document.getElementById("edit-name");
    const priceEl = document.getElementById("edit-price");
    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);

    if (!name) { nameEl.classList.add("input-error"); return alert("Asset Name is required."); }
    if (isNaN(price) || price <= 0) { priceEl.classList.add("input-error"); return alert("Price must be greater than zero."); }

    const payload = {
        assetTag: document.getElementById("edit-tag").value,
        assetName: name,
        purchasePrice: price,
        status: document.getElementById("edit-status").value
    };

    try {
        const response = await fetch(`${API}/update`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(await response.text());
        editModal.style.display = "none";
        loadAssets();
        alert("Asset updated successfully!");
    } catch (error) { alert(error.message); }
});

document.getElementById("btn-delete-modal").addEventListener("click", () => {
    if (currentEditingTag) deleteAsset(currentEditingTag);
});

function openEditModal(asset) {
    clearErrors();
    currentEditingTag = asset.assetTag;
    document.getElementById("edit-tag").value = asset.assetTag;
    document.getElementById("edit-name").value = asset.assetName;
    document.getElementById("edit-price").value = asset.purchasePrice;
    document.getElementById("edit-status").value = asset.status;
    editModal.style.display = "flex";
}

// --- NETWORK EDIT MODAL ---
document.getElementById("btn-cancel-network").addEventListener("click", () => networkModal.style.display = "none");

document.getElementById("form-network-edit").addEventListener("submit", async (event) => {
    event.preventDefault();
    const tag = document.getElementById("network-edit-tag").value;
    const ip = document.getElementById("network-edit-ip").value.trim();
    const mac = document.getElementById("network-edit-mac").value.trim();

    const payload = { assetTag: tag, ipAddress: ip, macAddress: mac };

    try {
        const response = await fetch(`${API}/network/update`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(await response.text());
        networkModal.style.display = "none";
        loadNetwork();
        alert("Network info updated successfully!");
    } catch (error) { alert(error.message); }
});

function openNetworkModal(tag, ip, mac) {
    document.getElementById("network-edit-tag").value = tag;
    document.getElementById("network-edit-ip").value = ip || "";
    document.getElementById("network-edit-mac").value = mac || "";
    networkModal.style.display = "flex";
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
            
            row.querySelector(".btn-edit").addEventListener("click", (e) => { e.stopPropagation(); openEditModal(asset); });
            tbody.appendChild(row);
        });
    } catch (error) { tbody.innerHTML = `<tr><td colspan='6' class='empty'>Error: ${error.message}</td></tr>`; }
}

async function loadSelectionTables() {
    const checkoutTbody = document.getElementById("checkout-table-body");
    const checkinTbody = document.getElementById("checkin-table-body");
    checkoutTbody.innerHTML = "<tr><td colspan='3' class='empty'>Loading...</td></tr>";
    checkinTbody.innerHTML = "<tr><td colspan='3' class='empty'>Loading...</td></tr>";

    try {
        const response = await fetch(API);
        const assets = await response.json();
        
        const borrowable = ["WorkStation", "Peripheral"];
        const available = assets.filter(a => a.status === "Available" && borrowable.includes(a.type));
        
        if (available.length === 0) {
            checkoutTbody.innerHTML = "<tr><td colspan='3' class='empty'>No available assets to check out.</td></tr>";
        } else {
            checkoutTbody.innerHTML = available.map(a => `
                <tr onclick="selectRow(this, 'checkout-selected-tag', '${a.assetTag}')">
                    <td>${a.assetTag}</td>
                    <td>${a.assetName}</td>
                    <td>${a.type}</td>
                </tr>
            `).join("");
        }

        const checkedOut = assets.filter(a => a.status === "CheckedOut");
        if (checkedOut.length === 0) {
            checkinTbody.innerHTML = "<tr><td colspan='3' class='empty'>No assets to check in.</td></tr>";
        } else {
            checkinTbody.innerHTML = checkedOut.map(a => `
                <tr onclick="selectRow(this, 'checkin-selected-tag', '${a.assetTag}')">
                    <td>${a.assetTag}</td>
                    <td>${a.assetName}</td>
                    <td>${a.type}</td>
                </tr>
            `).join("");
        }

    } catch (error) {
        checkoutTbody.innerHTML = `<tr><td colspan='3' class='empty'>Error: ${error.message}</td></tr>`;
        checkinTbody.innerHTML = `<tr><td colspan='3' class='empty'>Error: ${error.message}</td></tr>`;
    }
}

function selectRow(rowElement, hiddenInputId, tag) {
    const parentTable = rowElement.parentElement;
    Array.from(parentTable.children).forEach(tr => tr.classList.remove("row-selected"));
    rowElement.classList.add("row-selected");
    document.getElementById(hiddenInputId).value = tag;
}

async function loadDepreciation() {
    const tbody = document.getElementById("depreciation-body");
    const totalEl = document.getElementById("depreciation-total");
    tbody.innerHTML = "<tr><td colspan='4' class='empty'>Loading...</td></tr>";
    totalEl.textContent = "0.00";

    try {
        const response = await fetch(API);
        const assets = await response.json();
        if (assets.length === 0) { tbody.innerHTML = "<tr><td colspan='4' class='empty'>No assets to calculate.</td></tr>"; return; }

        let total = 0;
        tbody.innerHTML = "";

        assets.forEach(asset => {
            let depValue = 0;
            if (asset.type === "WorkStation") depValue = asset.purchasePrice / 5;
            else if (asset.type === "NetworkingHardware") depValue = asset.purchasePrice / 7;
            else if (asset.type === "Peripheral") depValue = asset.purchasePrice / 3;
            else if (asset.type === "SoftwareLicense") depValue = asset.purchasePrice * ((asset.remainingMonths || 0) / 12);

            total += depValue;

            const row = document.createElement("tr");
            row.innerHTML = `<td>${asset.assetTag}</td><td>${asset.assetName}</td><td>${asset.type}</td><td>${depValue.toFixed(2)}</td>`;
            tbody.appendChild(row);
        });

        totalEl.textContent = total.toFixed(2);
    } catch (error) { tbody.innerHTML = `<tr><td colspan='4' class='empty'>Error: ${error.message}</td></tr>`; }
}

// --- NETWORK TABLE (With Double Click Edit) ---
async function loadNetwork() {
    const tbody = document.getElementById("network-body");
    tbody.innerHTML = "<tr><td colspan='5' class='empty'>Loading...</td></tr>";
    try {
        const response = await fetch(API);
        const assets = await response.json();
        const devices = assets.filter(a => a.type === "WorkStation" || a.type === "NetworkingHardware");
        
        if (devices.length === 0) { tbody.innerHTML = "<tr><td colspan='5' class='empty'>No network devices.</td></tr>"; return; }
        
        tbody.innerHTML = devices.map(d => `
            <tr class="network-row">
                <td>${d.assetTag}</td>
                <td>${d.assetName}</td>
                <td>${d.ipAddress || "-"}</td>
                <td>${d.macAddress || "-"}</td>
                <td><button class="btn-edit">Edit</button></td>
            </tr>
        `).join("");

        // Attach listeners to the newly created buttons and rows
        document.querySelectorAll("#network-body .network-row").forEach((row, index) => {
            const device = devices[index];
            
            // Click the edit button
            row.querySelector(".btn-edit").addEventListener("click", (e) => {
                e.stopPropagation();
                openNetworkModal(device.assetTag, device.ipAddress, device.macAddress);
            });

            // Double click the row
            row.addEventListener("dblclick", () => {
                openNetworkModal(device.assetTag, device.ipAddress, device.macAddress);
            });
        });

    } catch (error) { tbody.innerHTML = `<tr><td colspan='5' class='empty'>Error: ${error.message}</td></tr>`; }
}

async function deleteAsset(tag) {
    if (!confirm(`Are you sure you want to delete ${tag}?`)) return;
    try {
        const res = await fetch(`${API}/delete?tag=${encodeURIComponent(tag)}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        editModal.style.display = "none";
        loadAssets();
        alert(`Asset "${tag}" deleted successfully!`);
    } catch (error) { alert("Error: " + error.message); }
}

// --- SUBMIT CHECKOUT / CHECKIN ---
document.getElementById("form-checkout").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tag = document.getElementById("checkout-selected-tag").value;
    const borrower = document.getElementById("checkout-borrower").value;
    if (!tag) return alert("Please select an asset from the table first.");

    try {
        const response = await fetch(`${API}/checkout?tag=${encodeURIComponent(tag)}&borrowerId=${encodeURIComponent(borrower)}`, { method: "POST" });
        if (!response.ok) throw new Error(await response.text());
        document.getElementById("form-checkout").reset();
        document.getElementById("checkout-selected-tag").value = "";
        alert("Checked out successfully!");
        loadSelectionTables();
    } catch (error) { alert("Error: " + error.message); }
});

document.getElementById("form-checkin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tag = document.getElementById("checkin-selected-tag").value;
    if (!tag) return alert("Please select an asset from the table first.");

    try {
        const response = await fetch(`${API}/checkin?tag=${encodeURIComponent(tag)}`, { method: "POST" });
        if (!response.ok) throw new Error(await response.text());
        document.getElementById("form-checkin").reset();
        document.getElementById("checkin-selected-tag").value = "";
        alert("Checked in successfully!");
        loadSelectionTables();
    } catch (error) { alert("Error: " + error.message); }
});