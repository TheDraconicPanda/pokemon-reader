const LOCATIONS = Object.freeze([
  { name: "New Bark Town", type: "town", region: "Johto", details: "Starting town; home of Professor Elm's laboratory." },
  { name: "Cherrygrove City", type: "town", region: "Johto", details: "Coastal town reached by Route 29." },
  { name: "Violet City", type: "town", region: "Johto", details: "Home of the Violet Gym and Sprout Tower." },
  { name: "Azalea Town", type: "town", region: "Johto", details: "Home of the Azalea Gym and Slowpoke Well." },
  { name: "Goldenrod City", type: "town", region: "Johto", details: "Large city with the Goldenrod Gym, Department Store, and Radio Tower." },
  { name: "Ecruteak City", type: "town", region: "Johto", details: "Home of the Ecruteak Gym and the towers tied to Johto's legends." },
  { name: "Olivine City", type: "town", region: "Johto", details: "Port city with a lighthouse and the Olivine Gym." },
  { name: "Cianwood City", type: "town", region: "Johto", details: "Coastal town reached by crossing the sea west of Olivine." },
  { name: "Mahogany Town", type: "town", region: "Johto", details: "Small town near the Lake of Rage." },
  { name: "Blackthorn City", type: "town", region: "Johto", details: "Northern Johto city with the Blackthorn Gym and Dragon's Den." },
  { name: "Route 29", type: "route", region: "Johto", details: "Connects New Bark Town and Cherrygrove City." },
  { name: "Route 30", type: "route", region: "Johto", details: "North of Cherrygrove City; leads toward Mr. Pokémon's house." },
  { name: "Route 31", type: "route", region: "Johto", details: "Connects Route 30 with Violet City." },
  { name: "Route 32", type: "route", region: "Johto", details: "Runs south from Violet City toward Union Cave." },
  { name: "Route 33", type: "route", region: "Johto", details: "Short route connecting Union Cave and Azalea Town." },
  { name: "Route 34", type: "route", region: "Johto", details: "South of Goldenrod City; the Day Care is along this route." },
  { name: "Route 35", type: "route", region: "Johto", details: "North of Goldenrod City, leading toward the National Park area." },
  { name: "Route 36", type: "route", region: "Johto", details: "Connects the Violet City area with the National Park and Route 37." },
  { name: "Route 37", type: "route", region: "Johto", details: "Wooded route south of Ecruteak City." },
  { name: "Route 38", type: "route", region: "Johto", details: "Connects Ecruteak City and the Olivine area." },
  { name: "Route 39", type: "route", region: "Johto", details: "Runs south toward Olivine City and MooMoo Farm." },
  { name: "Route 40", type: "route", region: "Johto", details: "Sea route west of Olivine City toward Route 41." },
  { name: "Route 41", type: "route", region: "Johto", details: "Sea route surrounding the Whirl Islands." },
  { name: "Route 42", type: "route", region: "Johto", details: "Connects Ecruteak City, Mt. Mortar, and the Mahogany area." },
  { name: "Route 43", type: "route", region: "Johto", details: "Route north from Mahogany Town to the Lake of Rage." },
  { name: "Route 44", type: "route", region: "Johto", details: "Eastern route from Mahogany Town toward Ice Path." },
  { name: "Route 45", type: "route", region: "Johto", details: "Mountain route south of Blackthorn City." },
  { name: "Route 46", type: "route", region: "Johto", details: "Mountain route connecting the Route 29 side of Johto with Route 45." },
  { name: "Route 47", type: "route", region: "Johto", details: "Route added in HeartGold and SoulSilver, leading toward the Safari Zone." },
  { name: "Route 48", type: "route", region: "Johto", details: "Connects Route 47 with the Safari Zone Gate." },
  { name: "Dark Cave", type: "landmark", region: "Johto", details: "Cave system with entrances near Routes 31, 45, and 46." },
  { name: "Sprout Tower", type: "landmark", region: "Johto", details: "Multi-floor tower in Violet City." },
  { name: "Ruins of Alph", type: "landmark", region: "Johto", details: "Ancient ruins with puzzles and Unown." },
  { name: "Union Cave", type: "landmark", region: "Johto", details: "Cave between Route 32 and Route 33." },
  { name: "Slowpoke Well", type: "landmark", region: "Johto", details: "Well in Azalea Town with multiple levels." },
  { name: "Ilex Forest", type: "landmark", region: "Johto", details: "Forest south of Azalea Town." },
  { name: "National Park", type: "landmark", region: "Johto", details: "Park between Routes 35 and 36; hosts the Bug-Catching Contest." },
  { name: "Burned Tower", type: "landmark", region: "Johto", details: "Ruined tower in Ecruteak City." },
  { name: "Bell Tower", type: "landmark", region: "Johto", details: "Tower in Ecruteak City associated with Ho-Oh." },
  { name: "Mt. Mortar", type: "landmark", region: "Johto", details: "Large cave system along Route 42." },
  { name: "Whirl Islands", type: "landmark", region: "Johto", details: "Four islands reached from Route 41." },
  { name: "Lake of Rage", type: "landmark", region: "Johto", details: "Lake north of Mahogany Town." },
  { name: "Ice Path", type: "landmark", region: "Johto", details: "Icy cave route leading to Blackthorn City." },
  { name: "Dragon's Den", type: "landmark", region: "Johto", details: "Sacred dragon location behind Blackthorn City." },
  { name: "Safari Zone", type: "facility", region: "Johto", details: "Safari area west of Cianwood, reached through Routes 47 and 48." },
  { name: "Pokéathlon Dome", type: "facility", region: "Johto", details: "Pokéathlon venue west of the National Park." },
  { name: "Goldenrod Department Store", type: "facility", region: "Johto", details: "Multi-floor shop in Goldenrod City." },
  { name: "Goldenrod Radio Tower", type: "facility", region: "Johto", details: "Broadcasting tower in Goldenrod City." },
  { name: "Olivine Lighthouse", type: "facility", region: "Johto", details: "Lighthouse overlooking Olivine City." },
  { name: "Pokémon Day Care", type: "facility", region: "Johto", details: "Located on Route 34, south of Goldenrod City." },
  { name: "S.S. Aqua", type: "facility", region: "Johto / Kanto connection", details: "Ship connecting Olivine City and Vermilion City after the Johto League." },
  { name: "Victory Road", type: "landmark", region: "Kanto border", details: "Final route through the caves before the Indigo Plateau." },
  { name: "Indigo Plateau", type: "facility", region: "Kanto border", details: "Pokémon League headquarters." },
  { name: "Mt. Silver", type: "landmark", region: "Kanto border", details: "Postgame mountain area west of the Pokémon League." }
]);


const CONNECTIONS = Object.freeze({
  "New Bark Town": ["Route 29"],
  "Cherrygrove City": ["Route 29", "Route 30"],
  "Violet City": ["Route 31", "Route 32", "Route 36"],
  "Azalea Town": ["Route 33", "Ilex Forest", "Slowpoke Well"],
  "Goldenrod City": ["Route 34", "Route 35", "Goldenrod Department Store", "Goldenrod Radio Tower"],
  "Ecruteak City": ["Route 37", "Route 38", "Route 42", "Burned Tower", "Bell Tower"],
  "Olivine City": ["Route 39", "Route 40", "Olivine Lighthouse", "S.S. Aqua"],
  "Cianwood City": ["Route 41", "Route 47"],
  "Mahogany Town": ["Route 42", "Route 43", "Route 44"],
  "Blackthorn City": ["Route 45", "Ice Path", "Dragon's Den"],
  "Route 29": ["New Bark Town", "Cherrygrove City", "Route 46"],
  "Route 30": ["Cherrygrove City", "Route 31", "Ruins of Alph"],
  "Route 31": ["Route 30", "Violet City", "Dark Cave"],
  "Route 32": ["Violet City", "Union Cave", "Ruins of Alph"],
  "Route 33": ["Union Cave", "Azalea Town"],
  "Route 34": ["Goldenrod City", "Pokémon Day Care"],
  "Route 35": ["Goldenrod City", "National Park", "Pokéathlon Dome"],
  "Route 36": ["Violet City", "National Park", "Route 37"],
  "Route 37": ["Route 36", "Ecruteak City"],
  "Route 38": ["Ecruteak City", "Route 39"],
  "Route 39": ["Route 38", "Olivine City"],
  "Route 40": ["Olivine City", "Route 41"],
  "Route 41": ["Route 40", "Whirl Islands", "Cianwood City"],
  "Route 42": ["Ecruteak City", "Mt. Mortar", "Mahogany Town"],
  "Route 43": ["Mahogany Town", "Lake of Rage"],
  "Route 44": ["Mahogany Town", "Ice Path"],
  "Route 45": ["Blackthorn City", "Dark Cave", "Route 46"],
  "Route 46": ["Route 29", "Route 45", "Dark Cave"],
  "Route 47": ["Cianwood City", "Route 48", "Safari Zone"],
  "Route 48": ["Route 47", "Safari Zone"],
  "Dark Cave": ["Route 31", "Route 45", "Route 46"],
  "Sprout Tower": ["Violet City"],
  "Ruins of Alph": ["Route 30", "Route 32"],
  "Union Cave": ["Route 32", "Route 33"],
  "Slowpoke Well": ["Azalea Town"],
  "Ilex Forest": ["Azalea Town"],
  "National Park": ["Route 35", "Route 36", "Pokéathlon Dome"],
  "Burned Tower": ["Ecruteak City"],
  "Bell Tower": ["Ecruteak City"],
  "Mt. Mortar": ["Route 42"],
  "Whirl Islands": ["Route 41"],
  "Lake of Rage": ["Route 43"],
  "Ice Path": ["Route 44", "Blackthorn City"],
  "Dragon's Den": ["Blackthorn City"],
  "Safari Zone": ["Route 47", "Route 48"],
  "Pokéathlon Dome": ["National Park", "Route 35"],
  "Goldenrod Department Store": ["Goldenrod City"],
  "Goldenrod Radio Tower": ["Goldenrod City"],
  "Olivine Lighthouse": ["Olivine City"],
  "Pokémon Day Care": ["Route 34", "Goldenrod City"],
  "S.S. Aqua": ["Olivine City"],
  "Victory Road": ["Indigo Plateau"],
  "Indigo Plateau": ["Victory Road"],
  "Mt. Silver": ["Indigo Plateau"]
});

const searchInput = document.querySelector("#location-search");
const typeSelect = document.querySelector("#location-type");
const countLabel = document.querySelector("#location-count");
const list = document.querySelector("#location-list");
const emptyMessage = document.querySelector("#empty-message");

const TYPE_LABELS = Object.freeze({
  town: "Town / city",
  route: "Route",
  landmark: "Landmark",
  facility: "Facility"
});

function renderLocations() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeSelect.value;
  const matches = LOCATIONS.filter((location) => {
    const matchesType = selectedType === "all" || location.type === selectedType;
    const searchable = `${location.name} ${location.region} ${location.details} ${TYPE_LABELS[location.type]}`.toLowerCase();
    return matchesType && searchable.includes(query);
  });

  countLabel.textContent = `${matches.length} of ${LOCATIONS.length} locations`;
  list.replaceChildren();

  for (const location of matches) {
    const card = document.createElement("article");
    card.className = "location-card";

    const text = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = location.name;
    const details = document.createElement("p");
    details.textContent = `${location.region} · ${location.details}`;
    text.append(heading, details);

    const badge = document.createElement("span");
    badge.className = "location-type";
    badge.textContent = TYPE_LABELS[location.type];

    card.append(text, badge);

    const connectedNames = (CONNECTIONS[location.name] || []).filter((name) =>
      LOCATIONS.some((candidate) => candidate.name === name)
    );
    if (connectedNames.length) {
      const connections = document.createElement("div");
      connections.className = "location-connections";
      const label = document.createElement("strong");
      label.textContent = "Connected locations";
      const links = document.createElement("div");
      links.className = "connection-links";
      for (const name of connectedNames) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "connection-link";
        link.textContent = name;
        link.addEventListener("click", () => {
          searchInput.value = name;
          typeSelect.value = "all";
          renderLocations();
        });
        links.append(link);
      }
      connections.append(label, links);
      card.append(connections);
    }

    list.append(card);
  }

  emptyMessage.hidden = matches.length !== 0;
}

searchInput.addEventListener("input", renderLocations);
typeSelect.addEventListener("change", renderLocations);
renderLocations();
