export function updateVarsTable(obj) {
    const tableHeader = document.getElementById("table-header");
    const tableBody = document.getElementById("table-body");

    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    const thKey = document.createElement("th");
    thKey.textContent = "Variables";
    tableHeader.appendChild(thKey);
    const thValue = document.createElement("th");
    thValue.textContent = "Values";
    tableHeader.appendChild(thValue);

    Object.entries(obj).forEach(([key, value]) => {
        const tr = document.createElement("tr");

        const tdKey = document.createElement("td");
        tdKey.textContent = key;
        tr.appendChild(tdKey);

        const tdValue = document.createElement("td");
        tdValue.textContent = value;
        tr.appendChild(tdValue);

        tableBody.appendChild(tr);
    });
}
