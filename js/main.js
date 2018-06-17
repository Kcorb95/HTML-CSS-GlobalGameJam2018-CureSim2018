VERSION = 0.1;
BETA = 0;
let Game = {};

Game.launch = function () {
    Game.version = VERSION;
    Game.beta = BETA;

    if (window.location.href.indexOf('/beta') > -1) Game.beta = 1;

    Game.ready = false;

    Game.init = function () {
        Game.credits = {
            name: 'credits',
            total: 0,
            increment: 1
        };
        Game.pills = {
            name: 'pills',
            total: 0,
            increment: 1
        };
        Game.team = {
            size: 0,
            unassigned: 0,
            scientists: 0,
            doctors: 0
        };
        Game.centrifuges = {
            name: 'centrifuges',
            total: 0,
            require: {
                credits: 10,
                pills: 0,
                scientists: 1,
                doctors: 0
            }
        };
        Game.ready = true;
    }
};

function updateResourceTotals() {
    document.getElementById('credits').innerHTML = Math.floor(Game.credits.total).toString();
    document.getElementById('pills').innerHTML = Math.floor(Game.pills.total).toString();

    let netCredits = Game.team.size > 0 ? -Game.team.size : 0;
    let netPills = -1;

    if (Game.team.doctors > 0 && (Game.pills.total + Game.centrifuges.total) > 0) { // Can we sell pills now?
        if (Game.team.doctors >= (Game.pills.total + Game.centrifuges.total)) { // If we have more doctors than pills, Sell all of our pills
            netCredits = ((Game.pills.total + Game.centrifuges.total) * 2) - Game.team.size;
        } else if ((Game.pills.total + Game.centrifuges.total) >= Game.team.doctors) { // If we have more pills than doctors, Sell as many pills as we have doctors
            netCredits = (Game.team.doctors * 2) - Game.team.size;
        }
    }
    if (Game.centrifuges.total <= Game.team.scientists)
        netPills = Game.centrifuges.total - Game.team.doctors - 1;
    else
        netPills = Game.team.scientists - 1;

    document.getElementById('netCredits').innerHTML = Math.floor(netCredits).toString();

    document.getElementById('netPills').innerHTML = Math.floor(netPills).toString();
}

function updateEquipmentTotals() {
    document.getElementById('centrifuges').innerHTML = Math.floor(Game.centrifuges.total).toString();
}

function updateTeam() {
    document.getElementById('teamCurrent').innerHTML = Math.floor(Game.team.size).toString();
    updateHireButtons();
    document.getElementById('workerCost').innerHTML = calcCost(1).toString();
    updateJobs();
}

function updateHireButtons() {
    if (Game.credits.total >= calcCost(1))
        document.getElementById('hireWorker').disabled = false;
    else
        document.getElementById('hireWorker').disabled = true;
}

function updateJobs() {
    document.getElementById('unassigned').innerHTML = Math.floor(Game.team.unassigned).toString();
    document.getElementById('scientists').innerHTML = Math.floor(Game.team.scientists).toString();
    updateJobButtons('scientists', 'scientist', false);
    document.getElementById('doctors').innerHTML = Math.floor(Game.team.doctors).toString();
    updateJobButtons('doctors', 'doctor', false);

}

function updateJobButtons(job, name) {
    document.getElementById(`${name}Group`).children[0].children[0].disabled = Game.team[job] < 1;
    document.getElementById(`${name}Group`).children[3].children[0].disabled = Game.team.unassigned === 0;
}

function updateEquipmentButtons() {
    updateEquipmentRow('centrifuges', 'buyCentrifuge');
}

function updateEquipmentRow(equipment, name) {
    if (Game.credits.total >= Game[equipment].require.credits && Game.pills.total >= Game[equipment].require.pills && Game.team.scientists >= Game[equipment].require.scientists) {
        document.getElementById(name).disabled = false;
    } else {
        document.getElementById(name).disabled = true;
    }
}

function updateReqs(equipment) {
    if (equipment === 'centrifuges') {
        Game[equipment].require.credits += 5;
        document.getElementById('centrifugeCost').innerHTML = Math.floor(Game[equipment].require.credits).toString();
    }
}

function increment(item) {
    Game[item].total += Game[item].increment;
    updateResourceTotals();
}

function buyEquipment(equipment, number) {
    if (Game.credits.total >= (Game[equipment].require.credits * number) && Game.pills.total >= (Game[equipment].require.pills * number) && Game.team.scientists >= (Game[equipment].require.scientists * number)) {
        Game.credits.total -= Game[equipment].require.credits * number;
        Game.pills.total -= Game[equipment].require.pills * number;
        Game.centrifuges.total += 1 * number;
    }
    updateEquipmentButtons();
    updateReqs(equipment);
    updateResourceTotals();
    updateEquipmentTotals();
    updateJobs();
}

function hire(number) {
    let totalCost = calcCost(number);
    if (Game.credits.total >= totalCost) {
        Game.team.size += number;
        Game.team.unassigned += number;
        Game.credits.total -= totalCost;
        updateResourceTotals();
        updateTeam();
    }
}

function assign(job, number) {
    if (job === 'scientists' && Game.team.unassigned >= number) {
        Game.team.scientists += number;
        Game.team.unassigned -= number;
    } else if (job === 'doctors' && Game.team.unassigned >= number) {
        Game.team.doctors += number;
        Game.team.unassigned -= number;
    }
    updateJobs();
}

function unassign(job, number) {
    if (job === 'scientists' && Game.team.scientists >= number) {
        Game.team.scientists -= number;
        Game.team.unassigned += number;
    }
    else if (job === 'doctors' && Game.team.doctors >= number) {
        Game.team.doctors -= number;
        Game.team.unassigned += number;
    }
    updateJobs();
}

function calcCost(number) {
    let aggCost = 0;
    let currentPrice = 0;
    let teamSizeTemp = Game.team.size;
    for (let i = 0; i < number; i++) {
        currentPrice = 10 + Math.floor(teamSizeTemp / 100); // Current Credit Cost for Employees
        aggCost += currentPrice;
        teamSizeTemp += 1;
    }
    return aggCost;
}

Game.launch();

window.onload = function () {
    if (!Game.ready) {
        Game.init();
        console.log('Game Launched');
        let cureName = prompt('What name would you like to use for this cure?', '');
        document.getElementById('cureName').innerHTML = cureName;
        if (cureName.toLowerCase() === 'dog' || cureName.toLowerCase() === 'wisdom')
            window.location.href = "https://www.youtube.com/watch?v=D-UmfqFjpl0";
    }
};

window.setInterval(function () {
    let netCredits = Game.team.size > 0 ? -Game.team.size : 0;
    let netPills = -1;

    if (Game.team.doctors > 0 && (Game.pills.total + Game.centrifuges.total) > 0) { // Can we sell pills now?
        if (Game.team.doctors >= (Game.pills.total + Game.centrifuges.total)) { // If we have more doctors than pills, Sell all of our pills
            netCredits = ((Game.pills.total + Game.centrifuges.total) * 2) - Game.team.size;
        } else if ((Game.pills.total + Game.centrifuges.total) >= Game.team.doctors) { // If we have more pills than doctors, Sell as many pills as we have doctors
            netCredits = (Game.team.doctors * 2) - Game.team.size;
        }
    }
    if (Game.centrifuges.total <= Game.team.scientists)
        netPills = Game.centrifuges.total - Game.team.doctors - 1;
    else
        netPills = Game.team.scientists - 1;

    if (Game.credits.total + netCredits < 0)
        Game.credits.total = 0;
    else
        Game.credits.total += netCredits;

    if (Game.pills.total + netPills < 0)
        Game.pills.total = 0;
    else
        Game.pills.total += netPills;

    updateResourceTotals();
    updateEquipmentButtons();
    updateJobs();
    updateHireButtons();
}, 1000);
