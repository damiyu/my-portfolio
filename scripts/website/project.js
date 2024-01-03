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
    setInterval(toolBarStripes, 10, n);

    let projects = await Util.getJSON('../database/projects.json'), selectProject = projects[localStorage.getItem('project-idx')];
    selectProject = selectProject != null ? selectProject : projects[0];
    let msgs = ["Loading...\0", selectProject.title + "...\0"];
    messageDisplay(msgs);
    returnHome();
    copyGmail();
    projectFill(selectProject);

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

function messageDisplay(msgs) {
    let messageDisplayRef = document.getElementById('message-display');
    let n = msgs.length, fstMsgLen = n > 0 ? msgs[0].length : 0, fstMsgDone = false;

    for (let i = 0; i < n; i++) {
        let msg = msgs[i], msgLen = msg.length, s = 0, newBox = null;

        // Create a box for every character and create a blink animation.
        for (let j = 0; j < msgLen; j++) {
            newBox = document.createElement('div')
            if (messageDisplayRef.children.length > fstMsgLen) fstMsgDone = true;
            if (fstMsgDone) newBox.style.display = "none";
            newBox.setAttribute('class', 'box-blink');
            newBox.style.animation = msgs[i][j] != '\0' ? "blink-show 1s 1 forwards" : "blink-hover 1s 3 forwards";
            if (msgs[i][j] == '\0' && i == n - 1) newBox.style.animation = "blink-hover 1s infinite forwards";
            newBox.style.animationDelay = s + "s";
            s += 0.05;

            let newChar = document.createElement('span');
            newChar.setAttribute('class', 'box-char');
            newChar.textContent = msgs[i][j];
            newBox.appendChild(newChar);
            messageDisplayRef.appendChild(newBox);
        }

        // Remove the old message and display the next message after the hover animation.
        if (i < n - 1) {
            newBox.addEventListener('animationend', function() {
                for (let k = 0; k < msgLen; k++) messageDisplayRef.removeChild(messageDisplayRef.children[1]);
                let nextMsgLen = i + 1 < n ? msgs[i + 1].length + 1 : messageDisplayRef.children.length;
                for (let k = 0; k < nextMsgLen; k++) messageDisplayRef.children[k].style.display = "flex";
            });
        }
    }
}

function returnHome() {
    const homeTitleRef = document.getElementById('title-border');

    homeTitleRef.addEventListener('click', function() {
        window.location = '../index.html';
    });
}

function copyGmail() {
    const gmailLinkRef = document.getElementById('gmail-icon-link');

    gmailLinkRef.addEventListener('click', function() {
        navigator.clipboard.writeText("darrenyu2003@gmail.com");
        alert("Gmail Copied to Clipboard");
    });
}

async function projectFill(project) {
    const projectTitleRef = document.getElementById('project-title');
    const projectSkillsRef = document.getElementById('project-skills');
    const projectTableOfContentsRef = document.getElementById('project-tof');
    const projectTextRef = document.getElementById('project-text');
    const projectContent = await fetch(project.text);
    const projectText = (await projectContent.text()).split('\n');
    let n = projectText.length, skills = project.skill;

    projectTitleRef.textContent = project.title;
    for (const [k, v] of Object.entries(skills)) {
        let newRow = document.createElement('tr');
        let newItemOne = document.createElement('td'), newItemTwo = document.createElement('td');

        newItemOne.textContent = k;
        newItemTwo.textContent = v
        newRow.appendChild(newItemOne);
        newRow.appendChild(newItemTwo);
        projectSkillsRef.appendChild(newRow);
    }

    let chapters = [];
    for (let i = 0; i < n; i++) {
        let newLine = document.createElement('div');

        // Checks for lines for media requests.
        if (projectText[i].charCodeAt(0) == 96) {
            let snip = mediaBuilder(projectText, i);
            projectTextRef.appendChild(snip[0]);
            i = snip[1];
        } else {
            // Creating a new chapter and store chapter components for the TOF.
            if (projectText[i].charCodeAt(0) == 35) {
                let chapterInfo = ['c', "", 0], title = projectText[i++].split(" ");
                newLine.setAttribute('class', 'chapter-title');
                if (title.shift().length > 1) {
                    chapterInfo[0] = 's';
                    newLine.setAttribute('class', 'sub-chapter-title');
                }
                newLine.textContent = title.join(" ");
                projectTextRef.appendChild(newLine);

                chapterInfo[1] = title.join(" ");
                chapterInfo[2] = newLine;
                chapters.push(chapterInfo);
                newLine = document.createElement('div');
            }

            // Traverse the chapter content and stop when media or a new chapter is detected.
            newLine.setAttribute('class', 'chapter-content');
            while (i < n) {
                if (projectText[i].charCodeAt(0) != 96 && projectText[i].charCodeAt(0) != 35) {
                    newLine.textContent += projectText[i++] + " ";
                } else {
                    i--;
                    break;
                }
            }
            
            if (newLine.textContent.length == 0) continue;
            projectTextRef.appendChild(newLine);
        }
    }

    // Set up the TOF with jumps to each chapter.
    for (let i = 0; i < chapters.length; i++) {
        let newChapter = document.createElement('div'), chapterLink = document.createElement('a');

        if (chapters[i][0] == 'c') {
            newChapter.textContent = "• ";
            chapterLink.textContent = chapters[i][1];
            newChapter.setAttribute('class', 'tof-chapter');
            chapterLink.setAttribute('class', 'tof-chapter-link');
        } else {
            newChapter.textContent = "- ";
            chapterLink.textContent = chapters[i][1];
            newChapter.setAttribute('class', 'tof-sub-chapter');
            chapterLink.setAttribute('class', 'tof-sub-chapter-link');
        }

        chapterLink.addEventListener('click', function() {
            window.scrollTo(0, chapters[i][2].offsetTop - document.getElementById('tool-bar').offsetHeight);
        });
        newChapter.appendChild(chapterLink);
        projectTableOfContentsRef.appendChild(newChapter);
    }
}

function mediaBuilder(projectText, idx) {
    let newSnip = document.createElement('div'), request = projectText[idx], n = 1;
    const mediaType = request.slice(3);

    // Valid media tags are links, images, and code snippets.
    if (mediaType.localeCompare("Link") == 0 || mediaType.localeCompare("Link\r") == 0) {
        let newLink = document.createElement('a'), line = (projectText[idx + n++]).split(" ");
        newLink.textContent = line.pop();
        newLink.href = projectText[idx + n++];
        newLink.target = "_blank";
        newLink.setAttribute('class', 'link-display-link');

        newSnip.textContent = line.join(" ") + " ";
        newSnip.appendChild(newLink);
        newSnip.setAttribute('class', 'link-display-text');
    } else if (mediaType.localeCompare("Image") == 0 || mediaType.localeCompare("Image\r") == 0) {
        let newImage = new Image(), sizeChart = {"Small\r": "20%", "Medium\r": "50%", "Large\r": "70%"}
        newImage.src = projectText[idx + n++];

        // Look for size statement or default a size.
        if (sizeChart.hasOwnProperty(projectText[idx + n])) newImage.style.width = sizeChart[projectText[idx + n]];
        else newImage.style.width = sizeChart["Medium\r"];
        newSnip.appendChild(newImage);
        newSnip.setAttribute('class', 'center-image');
    } else if (mediaType.localeCompare("Code") == 0 || mediaType.localeCompare("Code\r") == 0) {
        newSnip.setAttribute('class', 'code-snippet');

        while (projectText[idx + n].charCodeAt(0) != 96) {
            let newLine = document.createElement('div');
    
            // Add tab characters to code snippets.
            for (let t = 0; projectText[idx + n].charCodeAt(t) == 32; t++) newLine.innerHTML += '&nbsp;';
            newLine.textContent += projectText[idx + n++];
            newSnip.appendChild(newLine);
        }
    }

    // Remove excess media content or ignore invalid media types.
    while (projectText[idx + n].charCodeAt(0) != 96) n++;
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