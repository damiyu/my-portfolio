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
     */
    let n = [-5, -5, -5, false, false, false];
    setInterval(toolBarStripes, 5, n);
    returnHome();
    copyGmail();
    emojiDelay();
    iconLoad();
    projectShadows();

    let projects = await Util.getJSON('../database/projects.json');
    let projectNums = [0, 1, 2];
    populateProjects(projects, projectNums);
    menuShit(projects, projectNums);
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

function emojiDelay() {
    const emojiRef = document.getElementsByClassName('emoji-animated'), emojis = [];
    let len = emojiRef.length, n = 0, k = 0;

    for (let i = 0; i < len; i++) {
        // Store emoji for replacement later on.
        emojis.push(emojiRef[i].textContent);

        // Add animation to each emoji with an increasing amount of delay.
        emojiRef[i].style.animation = "descent 2s forwards";
        emojiRef[i].style.animationDelay = n + "s";
        n += 1.5;

        // Once a emoji has 'descented,' start the sliding animation will with displacement.
        emojiRef[i].addEventListener('animationend', function() {
            emojiRef[i].style.top = "23.25vh";
            emojiRef[i].style.animation = "slide" + (i + 1) + " " + (2 - k) + "s forwards";
            k += 0.25;
        });
    }

    // Start emoji replacement when the final animation is finished.
    emojiRef[len - 1].addEventListener('animationend', function() {
        const stillRef = document.getElementsByClassName('emoji-still');

        // Hide old emoji span and show the new emoji span.
        for (let i = 0; i < len; i++) emojiRef[i].style.visibility = "hidden";
        for (let i = 0; i < len; i++) {
            stillRef[i].style.visibility = "visible";
            stillRef[i].textContent = emojis[len - 1 - i];
        }
    });
}

function iconLoad() {
    const skillContainerRef = document.getElementById('skill-container');
    const iconNames = ["java-icon","python-icon","c-icon","cplusplus-icon","javascript-icon","html-icon","css-icon"];
    let len = iconNames.length, n = 0.5;

    for (let i = 0; i < len; i++) {
        // Create a new icon and set the following properties.
        const newIcon = document.createElement('img');
        newIcon.setAttribute('class', 'icon-load');
        newIcon.src = "../media/images/about-me/"+ iconNames[i] + ".png";
        newIcon.style.width = "50px";

        // Set animation delays to create a fade-in illusion.
        newIcon.style.animationDelay = n++ + "s";
        newIcon.addEventListener('animationend', function() {
            newIcon.style.visibility = "visible";
        });
        skillContainerRef.appendChild(newIcon);
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
        boxRefs[i].addEventListener('mouseenter', function() {
            // Stop increasing and begin to decrease.
            clearInterval(n[3 * i + 1]);
            n[3 * i + 2] = setInterval(shadowShift, 3, n, 3 * i, true);
        });

        boxRefs[i].addEventListener('mouseleave', function() {
            // Stop decreasing and begin to increase.
            clearInterval(n[3 * i + 2]);
            n[3 * i + 1] = setInterval(shadowShift, 15, n, 3 * i, false);
        });
    }
}

function shadowShift(n, idx, isDec) {
    const shadowRefs = document.getElementsByClassName('project-shadow');

    // Shifts the shadow and stops under/over flow.
    if (isDec) {
        if (n[idx] < 100) return;
        shadowRefs[idx / 3].style.width = n[idx]-- + "px";
    } else {
        if (n[idx] > 250) return;
        shadowRefs[idx / 3].style.width = n[idx]++ + "px";
    }
}

function populateProjects(projects, projectNums) {
    const projectImagesRef = document.getElementsByClassName('project-image');
    const projectTitlesRef = document.getElementsByClassName('project-title');
    const projectTextsRef = document.getElementsByClassName('project-text');

    // Take properties from the database entry and populate them on the project divs.
    for (let i = 0; i < 3; i++) {
        projectImagesRef[i].src = projects[projectNums[i]].image;
        projectTitlesRef[i].textContent = projects[projectNums[i]].title;
        projectTextsRef[i].innerHTML = projects[projectNums[i]].abstract;
    }
}

function menuShit(projects, projectNums) {
    const leftButtonRef = document.getElementById('left-button-border');
    const rightButtonRef = document.getElementById('right-button-border');
    const curtainsRef = document.getElementsByClassName('blank-curtain');
    const buttonSound = new Audio('../media/audios/menu-shift.mp3');
    buttonSound.volume = 0.3;

    // On left button press, shift projects to the left.
    leftButtonRef.addEventListener('click', function() {
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

    // On right button press, shift projects to the right.
    rightButtonRef.addEventListener('click', function() {
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
}