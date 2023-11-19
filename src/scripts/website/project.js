import * as Util from './utilities.js';

init();

async function init() {
    /*
     * leftStripePos = n[0]; The position of the left-most stripe.
     * middleStripePos = n[1]; The position of the center stripe.
     * rightStripePos = n[2]; The position of the right-most stripe.
     * isLeftReverse = n[3]; A boolean to check when it's time to reverse the left stripe.
     * isMiddleReverse = n[4]; A boolean to check when it's time to reverse the middle stripe.
     * isRightReverse = n[5]; A boolean to check when it's time to reverse the right stripe.
     * bounceCnt = n[6]; The number of times the loading bubbles have bounced.
     */
    let n = [-5, -5, -5, false, false, false, 0];
    setInterval(toolBarStripes, 5, n);
    returnHome();
    copyGmail();

    let projects = await Util.getJSON('../database/projects.json');
    projectFill(projects);

    // Apply a loading screen so the shadow DOM can completely loaded before viewing.
    loadingScreen(n);
    loading.addEventListener('animationend', function() {
        loading.style.visibility = "hidden";
        loading.style.opacity = 0;
        window.scrollTo(0, 0);
    });
}

function toolBarStripes(n) {
    const stripesRef = document.getElementsByClassName('stripes');

    for (let i = 0; i < stripesRef.length; i++) {
        if (n[5]) {
            stripesRef[i].style.backgroundImage = "linear-gradient(100deg, rgb(0, 0, 0, 0%) 0% 25%, rgb(355, 255, 0, 40%)" +
                                                    " 27% 73%, rgb(0, 0, 0, 0%) 75% 100%)";
        } else if (!n[3]) {
            stripesRef[i].style.backgroundImage = "linear-gradient(-100deg, rgb(0, 0, 0, 0%) 0% 25%, rgb(255, 255, 255, 40%)" +
                                                    " 27% 73%, rgb(0, 0, 0, 0%) 75% 100%)";
        }

        stripesRef[i].style.left = n[i] + "vw";
    }

    // Determine when the stripes are reversing.
    if (n[0] >= 100) n[3] = true;
    else if (n[3] && n[2] <= -5) n[3] = false;
    if (n[1] >= 100) n[4] = true;
    else if (n[4] && n[1] <= -5) n[4] = false;
    if (n[2] >= 100) n[5] = true;
    else if (n[5] && n[0] <= -5) n[5] = false;

    // Update the positions of the stripes.
    if (!n[3] && !n[4] && !n[5]) n[0] += 0.1;
    else if (n[5]) n[0] -= 0.1;
    if (!n[4] && !n[5] && n[0] > 0) n[1] += 0.1;
    else if (n[4] && n[0] <= 95) n[1] -= 0.1;
    if (!n[5] && n[1] > 0) n[2] += 0.1;
    else if (n[3] && n[1] <= 95) n[2] -= 0.1;
}

function returnHome() {
    const homeTitleRef = document.getElementById('title-border');

    homeTitleRef.addEventListener('click', function() {
        window.location = './index.html';
    });
}

function copyGmail() {
    const gmailLinkRef = document.getElementById('gmail-icon-link');

    gmailLinkRef.addEventListener('click', function() {
        navigator.clipboard.writeText("darrenyu2003@gmail.com");
        alert("Gmail Copied to Clipboard");
    });
}

async function projectFill(projects) {
    const projectTitleRef = document.getElementById('project-title');
    const projectSkillsRef = document.getElementById('project-skills');
    const projectSummaryRef = document.getElementById('project-summary-text');
    const projectTextRef = document.getElementById('project-text');
    const projectContent = await fetch(projects[0].text);
    const projectText = (await projectContent.text()).split('\n');
    let n = projectText.length;

    projectTitleRef.textContent = projects[0].title;

    let skills = projects[0].skill, s = skills.length;
    for (let i = 0; i < s; i += 2) {
        let newRow = document.createElement('tr');
        let newItemOne = document.createElement('td'), newItemTwo = document.createElement('td');

        newItemOne.textContent = skills[i];
        newItemTwo.textContent = skills[i + 1];
        newRow.appendChild(newItemOne);
        newRow.appendChild(newItemTwo);
        projectSkillsRef.appendChild(newRow);
    }

    for (let i = 0; i < n; i++) {
        let newLine = document.createElement('div');

        // Checks for lines for media requests.
        if (projectText[i].charCodeAt(0) == 96) {
            let snip = mediaBuilder(projectText, i);
            projectTextRef.appendChild(snip[0]);
            i = snip[1];
        } else {
            // Creating a new chapter and store the content before appending.
            if (projectText[i].charCodeAt(0) == 35) {
                newLine.setAttribute('class', 'chapter-title');
                let title = projectText[i++].split(" ");
                title.shift();
                newLine.textContent = title.join(" ");
                projectTextRef.appendChild(newLine);
                newLine = document.createElement('div');
            }

            newLine.setAttribute('class', 'chapter-content');
            while (i + 1 < n && projectText[i + 1].charCodeAt(0) != 96 && projectText[i + 1].charCodeAt(0) != 35) {
                newLine.textContent += projectText[i++];
            }
            newLine.textContent += projectText[i];
            projectTextRef.appendChild(newLine);
        }
    }
}

function mediaBuilder(projectText, idx) {
    let newSnip = document.createElement('div'), request = projectText[idx], n = 1;
    const mediaType = request.slice(3);

    // Valid media tags are links, images, and code snippets.
    if (mediaType.localeCompare("Link\r") == 0) {
        let newLink = document.createElement('a'), line = (projectText[idx + n++]).split(" ");
        newLink.textContent = line.pop();
        newLink.href = projectText[idx + n++];
        newLink.target = "_blank";
        newLink.setAttribute('class', 'link-display-link');

        newSnip.textContent = line.join(" ") + " ";
        newSnip.appendChild(newLink);
        newSnip.setAttribute('class', 'link-display-text');
    } else if (mediaType.localeCompare("Image\r") == 0) {
        let newImage = new Image(), sizeChart = {"Small\r": "20%", "Medium\r": "50%", "Large\r": "70%"}
        newImage.src = projectText[idx + n++];

        // Look for size statement or default a size.
        if (sizeChart.hasOwnProperty(projectText[idx + n])) newImage.style.width = sizeChart[projectText[idx + n]];
        else newImage.style.width = sizeChart["Medium\r"];
        newSnip.appendChild(newImage);
        newSnip.setAttribute('class', 'center-image');
    } else if (mediaType.localeCompare("Code\r") == 0) {
        newSnip.setAttribute('class', 'code-snippet');

        while (projectText[idx + n].charCodeAt(0) != 96) {
            let newLine = document.createElement('div');
    
            // Add tab characters to code snippets.
            for (let t = 0; projectText[idx + n].charCodeAt(t) == 32; t++) newLine.innerHTML += '&nbsp';
            newLine.textContent += projectText[idx + n++];
            newSnip.appendChild(newLine);
        }
    }

    // Remove excess media content or ignore invalid media types.
    while (projectText[idx + n].charCodeAt(0) != 96) n++
    return [newSnip, idx + n];
}

function loadingScreen(n) {
    // Perform three bubble bounces (1 second apart) before stopping and revealing the project contents.
    if (n[6]++ < 3) {
        bubbleBounce();
        setTimeout(loadingScreen, 1000, n);
    }
}

function bubbleBounce() {
    const bubblesRef = document.getElementsByClassName('bubble');
    let s = 47.5, n = 200;

    for (let i = 0; i < 3; i++) {
        bubblesRef[i].style.left = s + "vw";
        bubblesRef[i].style.visibility = "visible";
        bubblesRef[i].animate([ {transform: "translateY(-150%)"} ], { delay: n, duration: 500, iterations: 1 });
        bubblesRef[i].animate([ {transform: "translateY(0%)"} ], { delay: n, duration: 500, iterations: 1 });
        s += 2;
        n += 200;
    }
}