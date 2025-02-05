import * as Util from './utilities.js';

init();

async function init() {
    let msgs = ["Hello, welcome to my portfolio...\0",
                "My projects are located under my introduction...\0",
                "I recommend beginning with my portfolio website...\0",
                "My second reading recommendation is my transcript project...",
                "\0"];
    messageDisplay(msgs);
    setVersion()
    returnHome();
    copyGmail();


    let icns = ["java-icon.png", "python-icon.png", "c-icon.png",
                "cplusplus-icon.png", "haskell-icon.png", "javascript-icon.png"];
    iconLoad(icns, 'qualification', 'skill-container');

    let imgs = ["profile-picture.jpg", "ucsd-library.jpg", "chess-king.png"];
    iconLoad(imgs, 'about-me', 'about-me-container');

    let projects = await Util.getJSON('./scripts/database/projects.json');
    let projectNums = [0, 1, 2];
    searchItem(projects);
    populateProjects(projects, projectNums);
    menuShift(projects, projectNums);
    projectSelect(projectNums);
    projectShadows();
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

async function setVersion() {
    const versionTextRef = document.getElementById('version');
    const readMe = await fetch("./README.md"), readMeText = (await readMe.text()).split('\n');

    versionTextRef.textContent = readMeText[readMeText.length - 1];
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

function iconLoad(iconNames, divRef, containerRef) {
    const skillRef = document.getElementById(divRef);
    const skillContainerRef = document.getElementById(containerRef);
    let len = iconNames.length, n = 0.5;

    skillRef.addEventListener('click', function() {
        if (skillContainerRef.children.length == 2) {
            for (let i = 0; i < len; i++) {
                // Create a new icon and set the following properties.
                const newIcon = document.createElement('img');
                newIcon.setAttribute('class', 'icon-load');
                newIcon.src = "./media/images/about-me/"+ iconNames[i];
                newIcon.style.width = "35px";
                newIcon.style.marginBottom = "5px";
        
                // Set animation delays to create a fade-in illusion.
                newIcon.style.animationDelay = (n * i) + "s";
                newIcon.addEventListener('animationend', function() {
                    newIcon.style.visibility = "visible";
                });
                skillContainerRef.appendChild(newIcon);
            }
        }
    });
}

function shadowShift(n, idx, isDec) {
    const shadowRefs = document.getElementsByClassName('project-shadow');

    // Shifts the shadow and stops under/over flow.
    if (isDec) {
        if (n[idx] < 150) return;
        shadowRefs[idx / 3].style.width = n[idx]-- + "px";
    } else {
        if (n[idx] > 250) return;
        shadowRefs[idx / 3].style.width = n[idx]++ + "px";
    }
}

function searchItem(projects) {
    const searchIconRef = document.getElementById('search-icon');
    const searchBarRef = document.getElementById('search-bar');
    const searchBarList = document.getElementById('project-names');
    let projectMapping = {};

    for (const p of projects) {
        let newOption = document.createElement('option');

        projectMapping[p.title] = p.number - 1;
        newOption.textContent = p.title;
        searchBarList.appendChild(newOption);
    }

    searchIconRef.addEventListener('click', function() {
        if (searchBarRef.value in projectMapping) {
            localStorage.setItem('project-idx', projectMapping[searchBarRef.value]);
            window.location = "./pages/project.html";
        } else {
            alert("Sorry, but this project name doesn't exist!");
        }
    });

    searchBarRef.addEventListener('keypress', function(e) {
        if (e.key === "Enter") {
            if (searchBarRef.value in projectMapping) {
                localStorage.setItem('project-idx', projectMapping[searchBarRef.value]);
                window.location = "./pages/project.html";
            } else {
                alert("Sorry, but this project name doesn't exist!");
            }
        }
    });
}

function populateProjects(projects, projectNums) {
    const projectNumberRef = document.getElementsByClassName('project-number');
    const projectTypeRef = document.getElementsByClassName('project-development-type');
    const projectImagesRef = document.getElementsByClassName('project-image');
    const projectStarRatingRef = document.getElementsByClassName('star-difficulty-container');
    const projectTitlesRef = document.getElementsByClassName('project-title');
    const projectTextsRef = document.getElementsByClassName('project-text');

    // Take properties from the database entry and populate them on the project divs.
    for (let i = 0; i < 3; i++) {
        let starCnt = projects[projectNums[i]].stars;
        projectStarRatingRef[i].innerHTML = "Difficulty:&nbsp";
        for (let j = 0; j < 5; j++) {
            let stars = new Image();
            stars.src = './media/images/misc/star-on.png';

            if (j == Math.floor(starCnt) && Math.ceil(starCnt) > starCnt) stars.src = './media/images/misc/star-half.png';
            else if (j >= Math.floor(starCnt)) stars.src = './media/images/misc/star-off.png';

            stars.style.width = "25px";
            projectStarRatingRef[i].appendChild(stars);
        }

        projectNumberRef[i].textContent = projects[projectNums[i]].number;
        projectTypeRef[i].textContent = projects[projectNums[i]].type;
        projectImagesRef[i].src = projects[projectNums[i]].image;
        projectTitlesRef[i].textContent = projects[projectNums[i]].title;
        projectTextsRef[i].innerHTML = projects[projectNums[i]].abstract;
    }
}

function menuShift(projects, projectNums) {
    const leftButtonRef = document.getElementById('left-button-border');
    const rightButtonRef = document.getElementById('right-button-border');
    const curtainsRef = document.getElementsByClassName('blank-curtain');
    const buttonSound = new Audio('./media/audios/menu-shift.mp3');
    buttonSound.volume = 0.3;

    // On left button press, shift projects to the left.
    leftButtonRef.addEventListener('click', function() {
        for (let i = 0; i < 3; i++) {
            // Play a cloud animation and move project indices by -1.
            curtainsRef[i].animate([ {visibility: "visible"}, {backgroundColor: "rgb(200, 200, 200)", offset: 0} ], { duration: 1500, iterations: 1 });
            projectNums[i] = projectNums[i] - 1 != -1 ? projectNums[i] - 1 : projects.length - 1;
        }

        // Play a button sound and repopulate the project divs.
        buttonSound.play();
        buttonSound.currentTime = 0;
        populateProjects(projects, projectNums);
    });

    // On right button press, shift projects to the right.
    rightButtonRef.addEventListener('click', function() {
        for (let i = 0; i < 3; i++) {
            // Play a cloud animation and move project indices by 1.
            curtainsRef[i].animate([ {visibility: "visible"}, {backgroundColor: "rgb(200, 200, 200)", offset: 0} ], { duration: 1500, iterations: 1 });
            projectNums[i] = projectNums[i] + 1 != projects.length ? projectNums[i] + 1 : 0;
        }

        // Play a button sound and repopulate the project divs.
        buttonSound.play();
        buttonSound.currentTime = 0;
        populateProjects(projects, projectNums);
    });
}

function projectSelect(projectNums) {
    let projectLinksRef = document.getElementsByClassName('project-link'), n = projectLinksRef.length;

    for (let i = 0; i < n; i++) {
        projectLinksRef[i].addEventListener('click', function() {
            localStorage.setItem('project-idx', projectNums[i]);
        });
    }
}

function projectShadows() {
    /*
     * leftProjectShift = n[0]; The size of the shadow from the left project.
     * leftShadowInc = n[1]; The increase shadow object from the left project.
     * leftShadowDec = n[2]; The decrease shadow object from the left project.
     * middleProjectShift = n[3]; The size of the shadow from the middle project.
     * middleShadowInc = n[4]; The increase shadow object from the middle project.
     * middleShadowDec = n[5]; The decrease shadow object from the middle project.
     * rightProjectShift = n[6]; The size of the shadow from the right project.
     * rightShadowInc = n[7]; The increase shadow object from the right project.
     * rightShadowDec = n[8]; The decrease shadow object from the right project.
     */
    let n = [250, null, null, 250, null, null, 250, null, null];
    const projectRefs = document.getElementsByClassName('project-box')
    const boxRefs = [projectRefs[0], projectRefs[1], projectRefs[2]];

    // Cast shadows on projects that are hovered.
    for (let i = 0; i < 3; i++) {
        boxRefs[i].addEventListener('mouseover', function() {
            // Stop increasing and begin to decrease.
            clearInterval(n[3 * i + 1]);
            n[3 * i + 2] = setInterval(shadowShift, 3, n, 3 * i, true);
        });

        boxRefs[i].addEventListener('mouseout', function() {
            // Stop decreasing and begin to increase.
            clearInterval(n[3 * i + 2]);
            n[3 * i + 1] = setInterval(shadowShift, 15, n, 3 * i, false);
        });
    }
}