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

function renderHome() {
  document.getElementById("teamAName").textContent = teamAName;
  document.getElementById("teamBName").textContent = teamBName;
  const listA = document.getElementById("teamAList");
  const listB = document.getElementById("teamBList");
  listA.innerHTML = "";
  listB.innerHTML = "";

  checkTeamSize(teamA, listA);
  checkTeamSize(teamB, listB);

  teamA.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `

<span onclick="goToPlayer('${p.username}')">${p.username}</span>

<button onclick="removePlayer('A','${p.username}')">
Remove
</button>

`;
    listA.appendChild(li);
  });
  teamB.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `
<span onclick="goToPlayer('${p.username}')">${p.username}</span>
<button onclick="removePlayer('B','${p.username}')">
Remove
</button>

`;
    listB.appendChild(li);
  });
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

function renderAddPlayer() {
  //If the edit button is pressed, find it in local storage and use the saved username.
  const editUsername = localStorage.getItem("editPlayer");
  const addBtn = document.getElementById("add-btn");
  const saveEditBtn = document.getElementById("save-edit-btn");
  const teamSelect = document.getElementById("teamSelect");

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
    document.getElementById("ranking").value = player.ranking;

    saveEditBtn.addEventListener("click", () => {
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
      player.ranking = document.getElementById("ranking").value;

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

  document.getElementById("playerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    //Added extra check so that if the user still wants to keep the same username he wont get an error
    if (usernameExists(username) && username !== editUsername) {
      document.getElementById("error").textContent = "Username already exists";
      return;
    }

    //.value was needed to get age and ranking working
    const player = {
      username,
      firstname: document.getElementById("firstname").value,
      lastname: document.getElementById("lastname").value,
      age: document.getElementById("age").value,
      country: document.getElementById("country").value,
      ranking: document.getElementById("ranking").value,
    };
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
<p><b>Country:</b> ${player?.country}</p>
<p><b>Ranking:</b> ${player?.ranking}</p>
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
const rankValues = {
  iron: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
  diamond: 5,
};

const ranks = ["Iron", "Bronze", "Silver", "Gold", "Diamond"];

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
  const totalRank = team.reduce((sum, p) => {
    return sum + rankValues[p.ranking.toLowerCase()];
  }, 0);

  const avgRankNumber = totalRank / count;
  const avgRankText = ranks[Math.round(avgRankNumber - 1)];

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
    <p>Average Ranking: ${statsA.avgRank}</p>

    <h3>${teamBName}</h3>
    <p>Players: ${statsB.count}</p>
    <p>Average Age: ${statsB.avgAge}</p>
    <p>Average Ranking: ${statsB.avgRank}</p>
    `;
}

function checkTeamSize(team, list) {
  const message = document.createElement("p");
  message.classList.add("min-req-msg");
  list.after(message);

  if (list) {
    const count = team.length;

    if (count < 3) {
      const remaining = 3 - count;
      message.innerText = `${remaining} more player${remaining === 1 ? "" : "s"} needed.`;
    }
  }
}
