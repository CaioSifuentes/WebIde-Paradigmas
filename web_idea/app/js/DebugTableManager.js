export function updateVarsTable(obj) {
    const tableHeader = document.getElementById("table-header");
    const tableBody = document.getElementById("table-body");

    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    const keys = Object.keys(obj);
    keys.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key;
        tableHeader.appendChild(th);
    });

    const tr = document.createElement("tr");
    keys.forEach(key => {
        const td = document.createElement("td");
        td.textContent = obj[key];
        tr.appendChild(td);
    });

    tableBody.appendChild(tr);
}
