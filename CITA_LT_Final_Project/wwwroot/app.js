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

document.querySelector('[data-view="add"]').addEventListener("click", () => {
    switchView("Add Asset", "view-add");
});
document.querySelector('[data-view="list"]').addEventListener("click", () => {
    switchView("View All Assets", "view-list"); loadAssets();
});
document.querySelector('[data-view="checkout"]').addEventListener("click", () => {
    switchView("Check Out", "view-checkout"); loadDropdowns(); 
});
document.querySelector('[data-view="checkin"]').addEventListener("click", () => {
    switchView("Check In", "view-checkin"); loadDropdowns();
});
document.querySelector('[data-view="depreciation"]').addEventListener("click", () => { 
    switchView("Depreciation", "view-depreciation"); loadDepreciation();
});
document.querySelector('[data-view="network"]').addEventListener("click", () => {
    switchView("Network Devices", "view-network"); loadNetwork();
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

actionButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
        event.preventDefault();

        if (button.id == "btn-addAsset") {
            const selectedType = typeDropdown.value;
            
            const payload = {
                type: selectedType,
                assetTag: document.getElementById("add-tag").value,
                assetName: document.getElementById("add-name").value,
                purchasePrice: parseFloat(document.getElementById("add-price").value)
            };

            if (selectedType === "WorkStation" || selectedType === "NetworkingHardware") {
                payload.ipAddress = document.getElementById("add-ip").value;
                payload.macAddress = document.getElementById("add-mac").value;
            } else if (selectedType === "SoftwareLicense") {
                payload.remainingMonths = parseInt(document.getElementById("add-months").value) || 12;
            }

            try {
                const response = await fetch(API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(await response.text());
                
                alert("Asset added successfully!");
                document.getElementById("form-add").reset();
                switchView("View All Assets", "view-list");
                loadAssets();
            } catch (error) {
                alert("Error: " + error.message);
            }
        }
        else if (button.id == "btn-checkout") {
            const tag = document.getElementById("checkout-tag").value;
            const borrower = document.getElementById("checkout-borrower").value;
            try {
                const response = await fetch(`${API}/checkout?tag=${encodeURIComponent(tag)}&borrowerId=${encodeURIComponent(borrower)}`, { method: "POST" });
                if (!response.ok) throw new Error(await response.text());
                alert("Checked out successfully!");
                document.getElementById("form-checkout").reset();
            } catch (error) {
                alert("Error: " + error.message);
            }
        }
        else if (button.id == "btn-checkin") {
            const tag = document.getElementById("checkin-tag").value;
            try {
                const response = await fetch(`${API}/checkin?tag=${encodeURIComponent(tag)}`, { method: "POST" });
                if (!response.ok) throw new Error(await response.text());
                alert("Checked in successfully!");
                document.getElementById("form-checkin").reset();
            } catch (error) {
                alert("Error: " + error.message);
            }
        }
    })
});

async function loadAssets() {
    const tbody = document.getElementById("list-body");
    const template = document.getElementById("asset-row-template");
    
    tbody.innerHTML = "<tr><td colspan='6' class='empty'>Loading...</td></tr>";
    
    try {
        const response = await fetch(API);
        const assets = await response.json(); // Local variable instead of global
        
        if (assets.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' class='empty'>No assets yet.</td></tr>";
            return;
        }

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

            const editButton = row.querySelector(".btn-edit");
            editButton.addEventListener("click", () => {
                openEditModal(asset);
            });

            const deleteButton = row.querySelector(".btn-delete");
            deleteButton.addEventListener("click", () => {
                deleteAsset(asset.assetTag);
            });

            tbody.appendChild(row);
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan='6' class='empty'>Error: ${error.message}</td></tr>`;
    }
}

async function loadDepreciation() {
    const element = document.getElementById("depreciation-value");
    element.textContent = "Loading...";
    try {
        const response = await fetch(`${API}/depreciation`);
        const value = await response.json();
        element.textContent = value.toFixed(2);
    } catch (error) {
        element.textContent = "Error";
    }
}

async function loadNetwork() {
    const tbody = document.getElementById("network-body");
    tbody.innerHTML = "<tr><td colspan='3' class='empty'>Loading...</td></tr>";
    try {
        const response = await fetch(API);
        const assets = await response.json();
        
        const devices = assets.filter(asset => asset.type === "WorkStation" || asset.type === "NetworkingHardware");

        if (devices.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3' class='empty'>No network devices.</td></tr>";
            return;
        }

        tbody.innerHTML = devices.map(device => `
            <tr>
                <td>${device.assetTag}</td>
                <td>${device.ipAddress || "-"}</td>
                <td>${device.macAddress || "-"}</td>
            </tr>
        `).join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan='3' class='empty'>Error: ${error.message}</td></tr>`;
    }
}

async function loadDropdowns() {
    try {
        const response = await fetch(API);
        const assets = await response.json();

        const borrowableTypes = ["WorkStation", "Peripheral"];

        const checkoutSelect = document.getElementById("checkout-tag");
        checkoutSelect.innerHTML = '<option value="" disabled selected>-- Select an asset --</option>';
        
        assets.filter(asset => asset.status === "Available" && borrowableTypes.includes(asset.type)).forEach(asset => {
            const option = document.createElement("option");
            option.value = asset.assetTag;
            option.textContent = `${asset.assetTag} (${asset.type})`;
            checkoutSelect.appendChild(option);
        });

        const checkinSelect = document.getElementById("checkin-tag");
        checkinSelect.innerHTML = '<option value="" disabled selected>-- Select an asset --</option>';
        
        assets.filter(asset => asset.status === "CheckedOut").forEach(asset => {
            const option = document.createElement("option");
            option.value = asset.assetTag;
            option.textContent = asset.assetTag;
            checkinSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load dropdowns", error);
    }
}

async function deleteAsset(tag) {
    if (!confirm(`Are you sure you want to delete ${tag}?`)) return;
    
    try {
        const response = await fetch(`${API}/delete?tag=${encodeURIComponent(tag)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await response.text());
        alert("Asset deleted successfully!");
        loadAssets();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

const editModal = document.getElementById("edit-modal");
const formEdit = document.getElementById("form-edit");

function openEditModal(asset) {
    document.getElementById("edit-tag").value = asset.assetTag;
    document.getElementById("edit-name").value = asset.assetName;
    document.getElementById("edit-price").value = asset.purchasePrice;
    document.getElementById("edit-status").value = asset.status;
    
    editModal.style.display = "flex";
}

document.getElementById("btn-cancel-edit").addEventListener("click", () => {
    editModal.style.display = "none";
});

formEdit.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        assetTag: document.getElementById("edit-tag").value,
        assetName: document.getElementById("edit-name").value,
        purchasePrice: parseFloat(document.getElementById("edit-price").value),
        status: document.getElementById("edit-status").value
    };

    try {
        const response = await fetch(`${API}/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await response.text());
        
        alert("Asset updated successfully!");
        editModal.style.display = "none";
        loadAssets();
    } catch (error) {
        alert("Error: " + error.message);
    }
});