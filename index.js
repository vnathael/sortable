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
    
            const isMissingA = valA === null || valA === undefined || valA === "" || valA === "-" || valA === "Unknown" || valA === 0 || valA === "Place of birth unknown";
            const isMissingB = valB === null || valB === undefined || valB === "" || valB === "-" || valB === "Unknown" || valB === 0 || valB === "Place of birth unknown";
    
            if (isMissingA && !isMissingB) return 1;
            if (isMissingB && !isMissingA) return -1;
    
            if (isMissingA && isMissingB) return 0;
    
            const isNotLetterA = !/^[a-zA-Z]/.test(valA);
            const isNotLetterB = !/^[a-zA-Z]/.test(valB);
    
            if (isNotLetterA && !isNotLetterB) return 1;
            if (!isNotLetterA && isNotLetterB) return -1;
    
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
            case "height": return parseHeight(hero.appearance.height[1]);
            case "weight": return parseWeight(hero.appearance.weight[1]);
            case "placeOfBirth": return hero.biography.placeOfBirth || "";
            case "alignment": return hero.biography.alignment;
            case "powerstats": return Object.values(hero.powerstats).reduce((a, b) => a + b, 0);
            default: return "";
        }
    }

    function parseHeight(height) {
        if (!height) return 0;
    
        const cleanedHeight = height.replace(",", "").toLowerCase();
    
        if (cleanedHeight.includes("meters")) {
            const value = parseFloat(cleanedHeight);
            return value * 100;
        } else if (cleanedHeight.includes("cm")) {
            return parseFloat(cleanedHeight);
        }
    
        return 0;
    }

    function parseWeight(weight) {
        if (!weight) return 0;
    
        const cleanedWeight = weight.replace(",", "").toLowerCase();
    
        if (cleanedWeight.includes("ton")) {
            const value = parseFloat(cleanedWeight);
            return value * 1000;
        } else if (cleanedWeight.includes("kg")) {
            return parseFloat(cleanedWeight);
        }
    
        return 0;
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
        document.getElementById("detail-icon").src = hero.images.md;
        document.getElementById("detail-icon").alt = hero.name;
        document.getElementById("detail-name").textContent = hero.name;
    
        document.getElementById("detail-fullName").textContent = hero.biography.fullName || "N/A";
        document.getElementById("detail-alterEgos").textContent = hero.biography.alterEgos || "N/A";
        document.getElementById("detail-aliases").textContent = hero.biography.aliases.join(", ") || "N/A";
        document.getElementById("detail-firstAppearance").textContent = hero.biography.firstAppearance || "N/A";
        document.getElementById("detail-publisher").textContent = hero.biography.publisher || "N/A";
        document.getElementById("detail-alignment").textContent = hero.biography.alignment;
    
        document.getElementById("detail-gender").textContent = hero.appearance.gender;
        document.getElementById("detail-race").textContent = hero.appearance.race || "Unknown";
        document.getElementById("detail-height").textContent = hero.appearance.height[1];
        document.getElementById("detail-weight").textContent = hero.appearance.weight[1];
        document.getElementById("detail-eyeColor").textContent = hero.appearance.eyeColor;
        document.getElementById("detail-hairColor").textContent = hero.appearance.hairColor;
    
        document.getElementById("detail-intelligence").textContent = hero.powerstats.intelligence;
        document.getElementById("detail-strength").textContent = hero.powerstats.strength;
        document.getElementById("detail-speed").textContent = hero.powerstats.speed;
        document.getElementById("detail-durability").textContent = hero.powerstats.durability;
        document.getElementById("detail-power").textContent = hero.powerstats.power;
        document.getElementById("detail-combat").textContent = hero.powerstats.combat;
    
        document.getElementById("detail-occupation").textContent = hero.work.occupation || "N/A";
        document.getElementById("detail-base").textContent = hero.work.base || "N/A";
    
        document.getElementById("detail-groupAffiliation").textContent = hero.connections.groupAffiliation || "N/A";
        document.getElementById("detail-relatives").textContent = hero.connections.relatives || "N/A";
    
        document.getElementById("detail-view").style.display = "block";
    }

    window.closeDetailView = function() {
        detailView.style.display = "none";
    }

    document.addEventListener("keydown", (event) => {
        const totalPages = Math.ceil(filteredHeroes.length / pageSize);
    
        if (event.key === "ArrowRight" && currentPage < totalPages) {
            currentPage++;
            renderTable();
        } else if (event.key === "ArrowLeft" && currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
});
