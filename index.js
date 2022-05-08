const mobNameInput = document.querySelector("#mob-name");
const goAheadBtn = document.querySelector("#go-ahead");
const jumpAheadBtn = document.querySelector("#jump-ahead");
const addMember = document.querySelector("#add-member");
const membersList = document.querySelector("#members-list");
const mobMember = document.querySelector("#mob-member");
const backBtnPage2 = document.querySelector("#back-btn");
const backBtnPage3 = document.querySelector("#back-btn-2");
const backBtnPage4 = document.querySelector("#back-btn-3");
const clockMinusBtn = document.querySelector(".clock-button.minus-button");
const clockPlusBtn = document.querySelector(".clock-button.plus-button");
const timerMinutes = document.querySelector("#minutes");
const jumpToTimerBtn = document.querySelector("#jump-to-timer");
const membersWithTimers = document.querySelector("#members-with-timers");

const page1 = document.querySelector(".page.page-1");
const page2 = document.querySelector(".page.page-2");
const page3 = document.querySelector(".page.page-3");
const page4 = document.querySelector(".page.page-4");

let interval;
let currentTime = 0;
let autoStart = false;
let notify = false;

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
}

function transitionToPage(pageToShow, pageToHide) {
    pageToHide.classList.add('page-prev');
    pageToHide.classList.remove('page-show');
    pageToShow.classList.add('page-show');
    pageToShow.classList.remove('page-prev');
    pageToShow.classList.remove('page-next');
}
function goBackToPage(pageToShow, pageToHide) {
    pageToHide.classList.add('page-next');
    pageToHide.classList.remove('page-show');
    pageToShow.classList.add('page-show');
    pageToShow.classList.remove('page-hide');
}

function getRandomEmoji() {
    const emojiList = ['😇', '😎', '🤓', '🫡', '😏', '😃', '🥸', '🤩', '🥳', '🫠', '🤯', '🤠', '😺'];
    const randomIndex = Math.round(Math.random() * (emojiList.length - 1));
    return emojiList[randomIndex];
}

function compileMembersList() {
    const members = [];
    for (let i = 0; i < membersList.children.length; i++) {
        let child = membersList.children[i];
        members.push(child.innerText.replace('❌', '').trim())
    }
    return members;
}

const getCurrentActiveElement = () => document.querySelector(".member-timer.active");
const getActiveTimerElement = () => document.querySelector(".member-timer.active .timer");
const getActivePauseBtnElement = () => document.querySelector(".member-timer.active .pause-btn");

const playSound = () => {
    new Audio('sound.mp3').play();
}
const sendNotification = (index) => {
    const members = JSON.parse(localStorage.getItem('mob-members'));
    let member;
    if (members.length - 1 === index) {
        member = members[0];
    } else {
        member = members[index + 1];
    }
    new Notification(`It's ${member}s turn!`, {
            body: `${autoStart
                ? ' Timer started automagically!'
                : ' Manually start the timer!'}`,
            icon: 'clock.png',
        })
}

function runTimerAndUpdate(index) {
    const timerElement = getActiveTimerElement();
    let width = '0%';
    const stopTime = parseInt(localStorage.getItem('mob-timer')) * 60000;
    interval = setInterval(() => {
        currentTime += 1000;
        width = `${((currentTime / stopTime) * 100).toFixed(1)}%`;
        timerElement.style.width = width;
        if (currentTime === stopTime && interval) {
            playSound()
            onSkipClick(index);
            if (notify) sendNotification(index);
            if (autoStart) {
                let next = membersWithTimers.children.length - 1 === index ? 0 : index + 1;
                const pauseBtn = getActivePauseBtnElement()
                pauseBtn.innerHTML = 'Pause';
                runTimerAndUpdate(next);
            }
        }
    }, 1000)
}

function onPauseClick(index) {
    const pauseBtn = getActivePauseBtnElement()
    if (pauseBtn.innerHTML === 'Pause') {
        if (interval) clearInterval(interval);
        pauseBtn.innerHTML = 'Start';
    }
    else {
        pauseBtn.innerHTML = 'Pause';
        runTimerAndUpdate(index);
    }
}

function onSkipClick(index) {
    currentTime = 0;
    if (interval) {
        clearInterval(interval);
        const pauseBtn = getActivePauseBtnElement();
        if (pauseBtn.innerHTML === 'Pause') {
            pauseBtn.innerHTML = 'Start';
        }
    }
    const el = getCurrentActiveElement()
    const timerEl = getActiveTimerElement();
    timerEl.style.width = "0%";
    el.classList.remove('active');
    let next = membersWithTimers.children.length - 1 === index ? 0 : index + 1;
    const nextEl = membersWithTimers.children[next];
    nextEl.classList.add('active');
}

function compileMembersListWithTimers() {
    const members = JSON.parse(localStorage.getItem('mob-members'));
    membersWithTimers.innerHTML = "";
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const memberTimerDiv = document.createElement('div');
        memberTimerDiv.innerHTML = `
            <div class="timer"></div>
            <div class="member-wrapper">
                <span class="member-name">${i + 1}. ${member}</span>
                <span>
                    <span class="pause-btn btn" onclick="onPauseClick(${i})">Start</span>
                    <span class="skip-btn btn" onclick="onSkipClick(${i})">Skip</span>
                </span>
            </div>
        `
        memberTimerDiv.classList.add('member-timer')
        if (i === 0) {
            memberTimerDiv.classList.add('active')
        }
        membersWithTimers.append(memberTimerDiv);
    }
}

const removeMember = e => e.target.parentElement.remove()

function addMemberToList() {
    if (!mobMember.value.trim()) return alert("Name can't be empty!");
    const el = document.createElement('h3');
    el.innerHTML = `
        ${capitalize(mobMember.value)} ${getRandomEmoji()} 
        <span class='rm' onclick='removeMember(event)'>❌</span>`;
    membersList.append(el);
    mobMember.value = null;
    mobMember.focus()
}

function checkBox(e) {
    if (e.target.id === 'notify-me') {
        notify = !notify;
        if (notify) {
            e.target.classList.add('selected')
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        }
        else e.target.classList.remove('selected')
    } else {
        autoStart = !autoStart;
        if (autoStart) e.target.classList.add('selected')
        else e.target.classList.remove('selected')
    }
}

const goToSecondPage = () => {
    if (!mobNameInput.value.trim()) return alert('Please enter your mob name!')
    localStorage.setItem('mob-name', capitalize(mobNameInput.value));
    transitionToPage(page2, page1);
    setTimeout(() => mobMember.focus(), 300)
}

goAheadBtn.addEventListener('click', goToSecondPage)
mobNameInput.addEventListener('keypress', (e) => e.key === "Enter" ? goToSecondPage() : null);

jumpAheadBtn.addEventListener('click', () => {
    const members = compileMembersList()
    if (members.length === 0) return alert('Please add mob members before moving forward!');
    localStorage.setItem('mob-members', JSON.stringify(members));
    transitionToPage(page3, page2)
})

jumpToTimerBtn.addEventListener('click', () => {
    localStorage.setItem('mob-timer', parseInt(timerMinutes.innerHTML));
    transitionToPage(page4, page3);
    compileMembersListWithTimers();
    document.querySelector("#mob-name-show").textContent = `Let's do this ${localStorage.getItem('mob-name')} 😍`
})

backBtnPage2.addEventListener('click', () => goBackToPage(page1, page2))
backBtnPage3.addEventListener('click', () => goBackToPage(page2, page3))
backBtnPage4.addEventListener('click', () => goBackToPage(page3, page4))

addMember.addEventListener('click', addMemberToList)
mobMember.addEventListener('keypress', (e) => e.key === 'Enter' ? addMemberToList() : null);

clockMinusBtn.addEventListener('click', () =>
    timerMinutes.innerHTML = Math.max(1, parseInt(timerMinutes.innerHTML) - 1))
clockPlusBtn.addEventListener('click', () =>
    timerMinutes.innerHTML = Math.min(20, parseInt(timerMinutes.innerHTML) + 1))
