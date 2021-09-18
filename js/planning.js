async function getCalendar() {
    var args = {
        reqType: "askSched",
        schedUrl: win.schedUrl,
    };
    var resp = await SAET.emitReqPro("get", "ask_curl.php", args, true);
    return new Promise(async (resolve, reject) => {
        var array = parseCalendar(resp.response);
        resolve(array);
    });
}


function parseCalendar(calendar) {
    const regex = /(?<=BEGIN:VEVENT)(.|[\r\n])+?(?=END:VEVENT)/gm;
    var events = calendar.match(regex);
    var res = {};
    res.events = [];
    events.forEach(event => {
        nev = {};
        nev.start = icsParseDate(icsParseTopic("DTSTART", event));
        nev.end = icsParseDate(icsParseTopic("DTEND", event));
        nev.summary = icsParseTopic("SUMMARY", event);
        nev.location = icsParseTopic("LOCATION", event);
        res.events.push(nev);
    });
    return res;
}

function icsParseTopic(topic, event) {
    const regex = new RegExp('(?<=' + topic + ':).+');
    var matches = event.match(regex);
    var res = "no matches";
    if (matches != null) {
        res = matches[0];
    }
    return res;
}

function icsParseDate(strdate) {
    date = new Date();
    var offset = date.getTimezoneOffset();
    var hof = Math.floor(offset / 60);
    var mof = offset % 60;

    res = {};
    res.day = Math.floor(strdate.substring(6, 8));
    res.hour = Math.floor(strdate.substring(9, 11) - hof);
    res.min = Math.floor(strdate.substring(11, 13) - mof);
    res.month = Math.floor(strdate.substring(4, 6));
    res.year = Math.floor(strdate.substring(0, 4));
    res.sec = Math.floor(strdate.substring(13, 15));
    //console.log(strdate);
    return res;
}


var win = {}


window.onload = () => {
    win.date = new Date();
    
    setInterval(()=>{
        highlightToday();
    },1000);
    
    initCalendar();
    initwin();
    highlightToday();
}

async function initwin() {
    win.model = document.querySelector("model").firstElementChild.cloneNode(true);
    document.querySelector("model").remove();
    win.date = new Date();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    win.schedUrl = urlParams.get('src');
    win.calendar = await getCalendar();
    initCalendar();

    setInterval(async ()=>{
        win.calendar = await getCalendar();
    },60000);
}

function initCalendar() {

    win.month = win.date.getMonth() + 1;
    win.year = win.date.getFullYear();
    win.monday = getMonday(win.date);
    //win.week = getWeek(win.monday.getDate());
    if (window.matchMedia('screen and (max-width:700px)').matches) {
        displayWeekTel();
    } else {
        displayWeek();
    }
}

function getMonday() {
    var current_day = win.date.getDay();
    if (current_day == 0) {
        current_day = 7;
    }
    current_day -= 1;
    return new Date(win.date.getTime() - current_day * 24 * 60 * 60 * 1000);
}

function getDateOfWeek(w, y) {
    var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}


function getWeek(currentdate) {
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
    var result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);

    return result;
}

function highlightToday() {

    document.querySelectorAll(".nowIndicator").forEach(el=>{
        el.remove();
    });

    if (window.matchMedia('screen and (max-width:700px)').matches) {
        var d0 = document.querySelector(".d0");
        var d1 = document.querySelector(".d1");
        var d2 = document.querySelector(".d2");

        var t = win.date;
        var ref = new Date();

        [d0, d1, d2].forEach(el => {
            if (el.classList.contains("higlighted")) {
                el.classList.remove("higlighted");
            };
            if (t.getDate() == ref.getDate() && t.getMonth() == ref.getMonth() && t.getFullYear() == ref.getFullYear()) {
                el.classList.add("higlighted");
                higlightInstant(el);
            }
            t = new Date(t.getTime() + 1 * 24 * 60 * 60 * 1000);
        });

    } else {
        var d0 = document.querySelector(".d0");
        var d1 = document.querySelector(".d1");
        var d2 = document.querySelector(".d2");
        var d3 = document.querySelector(".d3");
        var d4 = document.querySelector(".d4");
        var d5 = document.querySelector(".d5");
        var d6 = document.querySelector(".d6");

        var t = win.monday;
        var ref = new Date();

        [d0, d1, d2, d3, d4, d5, d6].forEach(el => {
            if (el.classList.contains("higlighted")) {
                el.classList.remove("higlighted");
            };
            if (t.getDate() == ref.getDate() && t.getMonth() == ref.getMonth() && t.getFullYear() == ref.getFullYear()) {
                el.classList.add("higlighted");
                higlightInstant(el);
            }
            t = new Date(t.getTime() + 1 * 24 * 60 * 60 * 1000);
        });
    }
}

function higlightInstant(where) {

    var when = new Date();

    var node = win.model.cloneNode(true);

    var r1 = "{min1}";
    var r2 = "{min2}";

    var offset = (when.getHours() - 7) * 60 + when.getMinutes();

    node.classList.remove("event");
    node.classList.remove("ev-m");
    node.classList.add("nowIndicator");

    where.appendChild(node);

    var inter = node.outerHTML;
    inter = inter.replace(r1, offset);
    //node.outerHTML = node.outerHTML.replace(r1, offset);
    node.outerHTML = inter
}

async function displayWeek() {
    var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];

    var current_day = win.date.getDay();
    if (current_day == 0) {
        current_day = 7;
    }
    current_day -= 1;

    document.querySelector("#week").innerHTML = months[win.month - 1] + " " + win.year;// + " - Semaine " + win.week;
    document.querySelector("#lu").innerHTML = "Lun. " + win.monday.getDate();
    document.querySelector("#ma").innerHTML = "Mar. " + (new Date(win.monday.getTime() + 1 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#me").innerHTML = "Mer. " + (new Date(win.monday.getTime() + 2 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#je").innerHTML = "Jeu. " + (new Date(win.monday.getTime() + 3 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#ve").innerHTML = "Ven. " + (new Date(win.monday.getTime() + 4 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#sa").innerHTML = "Sam. " + (new Date(win.monday.getTime() + 5 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#di").innerHTML = "Dim. " + (new Date(win.monday.getTime() + 6 * 24 * 60 * 60 * 1000)).getDate();

    highlightToday();

    document.querySelectorAll(".event").forEach(el => {
        el.remove();
    });

    var cal = win.calendar;

    cal.events.forEach(element => {
        if (element.start.day == win.monday.getDate() && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d0", element);
        }
        if (element.start.day == win.monday.getDate() + 1 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d1", element);
        }
        if (element.start.day == win.monday.getDate() + 2 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d2", element);
        }
        if (element.start.day == win.monday.getDate() + 3 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d3", element);
        }
        if (element.start.day == win.monday.getDate() + 4 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d4", element);
        }
        if (element.start.day == win.monday.getDate() + 5 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d5", element);
        }
        if (element.start.day == win.monday.getDate() + 6 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d6", element);
        }
    });
}


function displayEvent(where, what) {
    //console.log(what);
    var node = win.model.cloneNode(true);
    var r1 = "{min1}";
    var r2 = "{min2}";
    var r3 = "{hm1}";
    var r4 = "{hm2}";
    var r5 = "{summary}";

    var offset = (what.start.hour - 7) * 60 + what.start.min;
    var duration = (what.end.hour - 7) * 60 + what.end.min - offset;

    /*
    what.start.hour + ":" + what.start.min
    what.end.hour + ":" + what.end.min
    what.summary
    */
    //console.log(node.outerHTML);
    document.querySelector("." + where).appendChild(node);

    node.innerHTML = node.innerHTML.replace(r3, (("00" + what.start.hour).slice(-2)) + ":" + ("00" + what.start.min).slice(-2));
    node.innerHTML = node.innerHTML.replace(r4, (("00" + what.end.hour).slice(-2)) + ":" + ("00" + what.end.min).slice(-2));
    node.innerHTML = node.innerHTML.replace(r5, what.summary.replace("\\", ""));

    var inter = node.outerHTML;
    inter = inter.replace(r1, offset);
    inter = inter.replace(r2, duration);
    //node.outerHTML = node.outerHTML.replace(r1, offset);
    node.outerHTML = inter
}

function nextWeek() {
    win.date = new Date(win.date.getTime() + 7 * 24 * 60 * 60 * 1000);
    initCalendar(win.date);
}

function prevWeek() {
    win.date = new Date(win.date.getTime() - 7 * 24 * 60 * 60 * 1000);
    initCalendar();
}

function nextDays() {
    win.date = new Date(win.date.getTime() + 2 * 24 * 60 * 60 * 1000);
    initCalendar(win.date);
}

function prevDays() {
    win.date = new Date(win.date.getTime() - 2 * 24 * 60 * 60 * 1000);
    initCalendar();
}

const mql = window.matchMedia('screen and (max-width:700px)');

mql.addEventListener("change", () => {
    console.log("mensonge et désilusion");
    win.date = new Date();
    initCalendar();
});

async function displayWeekTel() {

    document.querySelectorAll(".event").forEach(el => {
        el.remove();
    });

    var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
    var days = ["Lun.", "Mar.", "Mer.", "Jeu.", "Vend.", "Sam.", "Dim."];

    var current_day = win.date.getDay();
    if (current_day == 0) {
        current_day = 7;
    }
    current_day -= 1;

    document.querySelector("#week").innerHTML = months[win.month - 1] + " " + win.year;// + " - Semaine " + win.week;

    document.querySelector("#lu").innerHTML = days[current_day] + " " + win.date.getDate();
    document.querySelector("#ma").innerHTML = days[(current_day + 1) % 7] + " " + (new Date(win.date.getTime() + 1 * 24 * 60 * 60 * 1000)).getDate();
    document.querySelector("#me").innerHTML = days[(current_day + 2) % 7] + " " + (new Date(win.date.getTime() + 2 * 24 * 60 * 60 * 1000)).getDate();

    var cal = win.calendar;

    cal.events.forEach(element => {
        if (element.start.day == win.date.getDate() && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d0", element);
        }
        if (element.start.day == win.date.getDate() + 1 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d1", element);
        }
        if (element.start.day == win.date.getDate() + 2 && element.start.year == win.year && element.start.month == win.month) {
            displayEvent("d2", element);
        }
    });

    highlightToday();
}