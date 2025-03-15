document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json";
    let heroes = [];
    let filteredHeroes = [];
    let sortColumn = "name";
    let sortOrder = "asc";
    let pageSize = 20;
    let currentPage = 1;

    const tableBody = document.querySelector("#table-body");
    const searchInput = document.querySelector("#search");
    const pageSizeSelect = document.querySelector("#page-size");
    const pagination = document.querySelector("#pagination");
    const detailView = document.querySelector("#detail-view");

    const loadData = (data) => {
        heroes = data;
        filteredHeroes = [...heroes];
        renderTable();
    };

    fetch(API_URL)
        .then(response => response.json())
        .then(loadData);

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(query));
        currentPage = 1;
        renderTable();
    });

    pageSizeSelect.addEventListener("change", () => {
        pageSize = parseInt(pageSizeSelect.value);
        currentPage = 1;
        renderTable();
    });

    function renderTable() {
        tableBody.innerHTML = "";
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const displayedHeroes = filteredHeroes.slice(start, end);

        displayedHeroes.forEach(hero => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
                <td><span class="hero-name" data-id="${hero.id}">${hero.name}</span></td>
                <td>${hero.biography.fullName || "N/A"}</td>
                <td>${Object.values(hero.powerstats).join(" | ")}</td>
                <td>${hero.appearance.race || "Unknown"}</td>
                <td>${hero.appearance.gender}</td>
                <td>${hero.appearance.height[1]}</td>
                <td>${hero.appearance.weight[1]}</td>
                <td>${hero.biography.placeOfBirth || "Unknown"}</td>
                <td>${hero.biography.alignment}</td>
            `;
            tableBody.appendChild(row);
        });

        renderPagination();
        addNameClickEvent();
    }

    function renderPagination() {
        pagination.innerHTML = "";
        const totalPages = Math.ceil(filteredHeroes.length / pageSize);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.classList.add("page-btn");
            if (i === currentPage) button.classList.add("active");
            button.addEventListener("click", () => {
                currentPage = i;
                renderTable();
            });
            pagination.appendChild(button);
        }
    }

    document.querySelectorAll("th").forEach(th => {
        th.addEventListener("click", () => {
            const column = th.dataset.column;
            if (sortColumn === column) {
                sortOrder = sortOrder === "asc" ? "desc" : "asc";
            } else {
                sortColumn = column;
                sortOrder = "asc";
            }
            sortTable();
            renderTable();
        });
    });

    function sortTable() {
        filteredHeroes.sort((a, b) => {
            let valA = getValue(a, sortColumn);
            let valB = getValue(b, sortColumn);
    
            const isMissingA = valA === null || valA === undefined || valA === "" || valA === "-";
            const isMissingB = valB === null || valB === undefined || valB === "" || valB === "-";
    
            if (isMissingA && !isMissingB) return 1;
            if (isMissingB && !isMissingA) return -1;
    
            if (isMissingA && isMissingB) return 0;
    
            if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
                return sortOrder === "asc" ? valA - valB : valB - valA;
            } else {
                return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
        });
    }

    function getValue(hero, column) {
        switch (column) {
            case "name": return hero.name;
            case "fullName": return hero.biography.fullName || "";
            case "race": return hero.appearance.race || "";
            case "gender": return hero.appearance.gender;
            case "height": return parseInt(hero.appearance.height[1]) || 0;
            case "weight": return parseInt(hero.appearance.weight[1]) || 0;
            case "placeOfBirth": return hero.biography.placeOfBirth || "";
            case "alignment": return hero.biography.alignment;
            case "powerstats": return Object.values(hero.powerstats).reduce((a, b) => a + b, 0);
            default: return "";
        }
    }

    function addNameClickEvent() {
        const heroNames = document.querySelectorAll(".hero-name");
        heroNames.forEach(name => {
            name.addEventListener("click", () => {
                const heroId = name.getAttribute("data-id");
                const hero = heroes.find(h => h.id == heroId);
                showHeroDetail(hero);
            });
        });
    }

    function showHeroDetail(hero) {
        detailView.innerHTML = `
            <div id="hero-detail">
                <img src="${hero.images.md}" alt="${hero.name}">
                <div>
                    <h2>${hero.name}</h2>
                    <p><strong>Full Name:</strong> ${hero.biography.fullName || "N/A"}</p>
                    <p><strong>Race:</strong> ${hero.appearance.race || "Unknown"}</p>
                    <p><strong>Gender:</strong> ${hero.appearance.gender}</p>
                    <p><strong>Height:</strong> ${hero.appearance.height[1]}</p>
                    <p><strong>Weight:</strong> ${hero.appearance.weight[1]}</p>
                    <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth || "Unknown"}</p>
                    <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
                    <p><strong>Powerstats:</strong> ${Object.values(hero.powerstats).join(" | ")}</p>
                </div>
                <button class="close-btn" onclick="closeDetailView()">Close</button>
            </div>
        `;
        detailView.style.display = "block";
    }

    window.closeDetailView = function() {
        detailView.style.display = "none";
    }
});
