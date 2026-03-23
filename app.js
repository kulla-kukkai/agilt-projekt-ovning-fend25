let teamA = JSON.parse(localStorage.getItem("teamA")) || [];
let teamB = JSON.parse(localStorage.getItem("teamB")) || [];

let teamAName = localStorage.getItem("teamAName") || "Team A";
let teamBName = localStorage.getItem("teamBName") || "Team B";

function save() {
  localStorage.setItem("teamA", JSON.stringify(teamA));
  localStorage.setItem("teamB", JSON.stringify(teamB));

  localStorage.setItem("teamAName", teamAName);
  localStorage.setItem("teamBName", teamBName);
}

function renameTeam(team) {
  if (team === "A") {
    const val = document.getElementById("teamAInput").value;
    if (val) teamAName = val;
  }
  if (team === "B") {
    const val = document.getElementById("teamBInput").value;
    if (val) teamBName = val;
  }
  save();
  renderHome();
}

function movePlayer(fromTeam, username) {
  const toTeam = fromTeam === "A" ? "B" : "A";
  const toArr = toTeam === "A" ? teamA : teamB;

  if (toArr.length >= 7) {
    alert(`${toTeam === "A" ? teamAName : teamBName} is full!`);
    return;
  }

  let player;
  if (fromTeam === "A") {
    player = teamA.find((p) => p.username === username);
    teamA = teamA.filter((p) => p.username !== username);
    teamB.push(player);
  } else {
    player = teamB.find((p) => p.username === username);
    teamB = teamB.filter((p) => p.username !== username);
    teamA.push(player);
  }

  save();
  renderHome();
}

function renderHome() {
  const teamADisplayName = document.getElementById("teamAName");
  teamADisplayName.textContent = teamAName;
  const teamBDisplayName = document.getElementById("teamBName");
  teamBDisplayName.textContent = teamBName;
  const teamACount = ` (${teamA.length} players)`;
  const teamBCount = ` (${teamB.length} players)`;
  const listA = document.getElementById("teamAList");
  const listB = document.getElementById("teamBList");
  listA.innerHTML = "";
  listB.innerHTML = "";

  checkTeamSize(teamA, listA);
  checkTeamSize(teamB, listB);

  teamADisplayName.append(teamACount);
  teamBDisplayName.append(teamBCount);

  teamA.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `

<span onclick="goToPlayer('${p.username}')"> <img src="${p.flag}" width="20px"> ${p.username} (${getRank(p.level)})</span>

<div class="player-actions">
  <button class="move-btn" onclick="movePlayer('A','${p.username}')">Move</button>
  <button onclick="removePlayer('A','${p.username}')">Remove</button>
</div>

`;
    listA.appendChild(li);
  });
  teamB.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `
<span onclick="goToPlayer('${p.username}')"> <img src="${p.flag}" width="20px"> ${p.username} (${getRank(p.level)})</span>
<div class="player-actions">
  <button class="move-btn" onclick="movePlayer('B','${p.username}')">Move</button>
  <button onclick="removePlayer('B','${p.username}')">Remove</button>
</div>

`;
    listB.appendChild(li);
  });

  // Filter players based on search input 
  const searchInput = document.getElementById("searchInput");
  if (searchInput) filterPlayers();

  // Show updated statistics if some players have been added/removed/moved
  const statsDiv = document.getElementById("statistics");
  if (statsDiv && statsDiv.innerHTML !== "") showStatistics();

}

function goToPlayer(username) {
  localStorage.setItem("selectedPlayer", username);
  window.location.href = "playerinfo.html";
}

function removePlayer(team, username) {
  if (team === "A") {
    //needed to save the new mutated array
    teamA = teamA.filter((p) => p.username !== username);
  }
  if (team === "B") {
    teamB = teamB.filter((p) => p.username !== username);
  }
  save();
  renderHome();
}

function usernameExists(username) {
  return (
    teamA.some((p) => p.username === username) ||
    teamB.some((p) => p.username === username)
  );
}

async function renderAddPlayer() {
  //If the edit button is pressed, find it in local storage and use the saved username.
  const editUsername = localStorage.getItem("editPlayer");
  const addBtn = document.getElementById("add-btn");
  const saveEditBtn = document.getElementById("save-edit-btn");
  const teamSelect = document.getElementById("teamSelect");

  await renderCountries();

  if (editUsername) {
    addBtn.style.display = "none";
    saveEditBtn.style.display = "inline-block";
    teamSelect.disabled = true;

    //find the player using the username
    const player =
      teamA.find((p) => p.username === editUsername) ||
      teamB.find((p) => p.username === editUsername);

    //show all the current values
    document.getElementById("username").value = player.username;
    document.getElementById("firstname").value = player.firstname;
    document.getElementById("lastname").value = player.lastname;
    document.getElementById("age").value = player.age;
    document.getElementById("country").value = player.country;
    document.getElementById("ranking").value = player.level;

    saveEditBtn.addEventListener("click", async () => {
      const newUsername = document.getElementById("username").value;

      // Prevent duplicate usernames
      if (usernameExists(newUsername) && newUsername !== editUsername) {
        document.getElementById("error").textContent =
          "Username already exists";
        return;
      }

      //set the new inputs as the new values
      player.username = document.getElementById("username").value;
      player.firstname = document.getElementById("firstname").value;
      player.lastname = document.getElementById("lastname").value;
      player.age = document.getElementById("age").value;
      player.country = document.getElementById("country").value;
      player.level = document.getElementById("ranking").value;

      //update flag url when editing
      const flagUrl = await getFlagUrl(player.country);
      player.flag = flagUrl;

      //save, remove item from local storage and go to main page
      save();
      localStorage.removeItem("editPlayer");
      window.location.href = "index.html";
    });
  }

  teamSelect.innerHTML = `

<option value="A" ${teamA.length >= 7 ? "disabled" : ""}>
${teamA.length >= 7 ? `${teamAName} - ${teamAName} is full` : teamAName}
</option>

<option value="B" ${teamB.length >= 7 ? "disabled" : ""}>
${teamB.length >= 7 ? `${teamBName} - ${teamBName} is full` : teamBName}
</option>

`;

  document
    .getElementById("playerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      //Added extra check so that if the user still wants to keep the same username he wont get an error
      if (usernameExists(username) && username !== editUsername) {
        document.getElementById("error").textContent =
          "Username already exists";
        return;
      }

      //.value was needed to get age and ranking working
      const player = {
        username,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        age: document.getElementById("age").value,
        country: document.getElementById("country").value,
        level: document.getElementById("ranking").value,
      };

      //add flag url to player in local storage
      const flagUrl = await getFlagUrl(player.country);
      player.flag = flagUrl;

      const team = document.getElementById("teamSelect").value;
      if (team === "A") {
        teamA.push(player);
      }
      if (team === "B") {
        teamB.push(player);
      }
      save();
      window.location.href = "index.html";
    });
}

function renderPlayerInfo() {
  const username = localStorage.getItem("selectedPlayer");

  //only team A was being filtered.
  const player =
    teamA.find((p) => p.username === username) ||
    teamB.find((p) => p.username === username);

  const profile = document.getElementById("profile");

  profile.innerHTML = `
<div class="profile">
<h2>${player?.username}</h2>
<p><b>Name:</b> ${player?.firstname} ${player?.lastname}</p>
<p><b>Age:</b> ${player?.age}</p>
<p><b>Country:</b> <span> <img src="${player.flag}" width="20px">  ${player?.country} </span></p>
<p><b>Level:</b> ${player?.level}</p>
<p><b>Rank:</b> ${getRank(player?.level)}</p>
<br>
<button onclick="window.location='index.html'">
Back
</button>
<button onclick="editPlayer('${player.username}')">Edit</button>

</div>

`;
}

//save username in local storage and move to add player page
function editPlayer(username) {
  localStorage.setItem("editPlayer", username);
  window.location.href = "addplayer.html";
}

function getRank(level) {
  level = Number(level) || 0;

  if (level <= 19) return "Iron";
  if (level <= 39) return "Bronze";
  if (level <= 59) return "Silver";
  if (level <= 79) return "Gold";
  return "Diamond";
}

function getTeamStats(team) {
  const count = team.length;

  if (count === 0) {
    return {
      count: 0,
      avgAge: 0,
      avgRank: 0,
    };
  }

  const totalAge = team.reduce((sum, p) => sum + Number(p.age), 0);
  const totalLevel = team.reduce((sum, p) => {
    return sum + Number(p.level);
  }, 0);

  const avgLevel = totalLevel / count;
  const avgRankText = getRank(avgLevel);

  return {
    count,
    avgAge: (totalAge / count).toFixed(1),
    avgRank: avgRankText,
  };
}

function showStatistics() {
  const statsA = getTeamStats(teamA);
  const statsB = getTeamStats(teamB);
  const statsDiv = document.getElementById("statistics");
  statsDiv.innerHTML = `
    <h2>Team statistics</h2>

    <h3>${teamAName}</h3>
    <p>Players: ${statsA.count}</p>
    <p>Average Age: ${statsA.avgAge}</p>
    <p>Average Rank: ${statsA.avgRank}</p>

    <h3>${teamBName}</h3>
    <p>Players: ${statsB.count}</p>
    <p>Average Age: ${statsB.avgAge}</p>
    <p>Average Rank: ${statsB.avgRank}</p>
    `;
}

//Informs user of how many players are needed in DOM
function checkTeamSize(team, list) {
  let message = list.parentNode.querySelector(".min-req-msg");

  // If it doesn't exist, create it once
  if (!message) {
    message = document.createElement("p");
    message.classList.add("min-req-msg");
    list.after(message);
  }

  const count = team.length;

  if (count < 3) {
    message.style.display = "block";
    const remaining = 3 - count;
    message.innerText = `${remaining} more player${remaining === 1 ? "" : "s"} needed.`;
  } else {
    message.style.display = "none";
  }
}

//function to get all country info from api
async function getCountries() {
  const response = await axios.get(
    "https://restcountries.com/v3.1/region/europe",
  );
  const responseData = response.data;
  return responseData;
}

//function to use api to get european countries when adding/editing player
async function renderCountries() {
  const data = await getCountries();

  const countryInput = document.getElementById("country");

  data.forEach((country) => {
    const countryOption = document.createElement("option");
    countryOption.innerText = country.name.common;
    countryOption.value = country.name.common;

    countryInput.append(countryOption);
  });
}

function filterPlayers() {
  const query = document.getElementById("searchInput").value.toLowerCase(); // Get the search query and convert it to lowercase for matching with player usernames.

  function filterList(players, listId, team) {
    const list = document.getElementById(listId);

    list.innerHTML = ""; // Clear the current list of players.

    const filtered = players.filter(p => 
      p.username.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No players found";
      li.style.color = "var(--muted)";
      li.style.padding = "10px";
      li.style.fontSize = "12px";
      list.appendChild(li);
      return; 
    }

    filtered.forEach((player) => {
      const li = document.createElement("li");
      li.className = "player";
      li.innerHTML = `
        <span onclick="goToPlayer('${player.username}')">
          <img src="${player.flag}" width="20px"> ${player.username} (${getRank(player.level)})
        </span>
        <div class="player-actions">
          <button class="move-btn" onclick="movePlayer('${team}', '${player.username}')">Move</button>
          <button onclick="removePlayer('${team}', '${player.username}')">Remove</button>
        </div>
      `;
      list.appendChild(li);
    });
  }

  filterList(teamA, "teamAList", "A");
  filterList(teamB, "teamBList", "B");
}


//function get to get the flag url
async function getFlagUrl(country) {
  const data = await getCountries();

  const flag = data.find((land) => {
    return land.name.common === country;
  });

  return flag.flags.svg;
}
