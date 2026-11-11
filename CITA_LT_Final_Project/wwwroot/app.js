const panelTitle = document.getElementById("panel-title");
const allViews = document.querySelectorAll(".view-panel");

// Function to switch the view
function switchView(title, targetViewId) {
    panelTitle.textContent = title;

    allViews.forEach(view => {
        view.hidden = true;
    });

    document.getElementById(targetViewId).hidden = false;
}

document.querySelector('[data-view="add"]').addEventListener("click", () => {
    switchView("Add Asset", "view-add");
});

document.querySelector('[data-view="list"]').addEventListener("click", () => {
    switchView("View All Assets", "view-list");
});

document.querySelector('[data-view="checkout"]').addEventListener("click", () => {
    switchView("Check Out", "view-checkout");
});

document.querySelector('[data-view="checkin"]').addEventListener("click", () => {
    switchView("Check In", "view-checkin");
});

document.querySelector('[data-view="depreciation"]').addEventListener("click", () => {
    switchView("Depreciation", "view-depreciation");
});

document.querySelector('[data-view="network"]').addEventListener("click", () => {
    switchView("Network Devices", "view-network");
});

document.querySelector('[data-view="checkedout"]').addEventListener("click", () => {
    switchView("Checked-Out Items", "view-checkedout");
});