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


var win;


window.onload = () => {


    win = {
        date: new Date(),
        model: document.querySelector("model").firstElementChild.cloneNode(true),
    };
    document.querySelector("model").remove();

    initCalendar();
    initwin();
}

async function initwin() {

    highlightToday();
    setInterval(() => {
        highlightToday();
    }, 1000);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    win.schedUrl = urlParams.get('src');
    win.calendar = await getCalendar();
    initCalendar();

    setInterval(async () => {
        win.calendar = await getCalendar();
        initCalendar();
    }, 15*60000);

    setInterval(async () => {
        win.date = new Date();
        initCalendar();
    }, 60*60000);
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

    document.querySelectorAll(".nowIndicator").forEach(el => {
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

    var d0 = win.monday;
    var d1 = (new Date(win.monday.getTime() + 1 * 24 * 60 * 60 * 1000));
    var d2 = (new Date(win.monday.getTime() + 2 * 24 * 60 * 60 * 1000));
    var d3 = (new Date(win.monday.getTime() + 3 * 24 * 60 * 60 * 1000));
    var d4 = (new Date(win.monday.getTime() + 4 * 24 * 60 * 60 * 1000));
    var d5 = (new Date(win.monday.getTime() + 5 * 24 * 60 * 60 * 1000));
    var d6 = (new Date(win.monday.getTime() + 6 * 24 * 60 * 60 * 1000));

    document.querySelector("#week").innerHTML = months[win.month - 1] + " " + win.year;// + " - Semaine " + win.week;
    document.querySelector("#lu").innerHTML = "Lun. " + d0.getDate();
    document.querySelector("#ma").innerHTML = "Mar. " + d1.getDate();
    document.querySelector("#me").innerHTML = "Mer. " + d2.getDate();
    document.querySelector("#je").innerHTML = "Jeu. " + d3.getDate();
    document.querySelector("#ve").innerHTML = "Ven. " + d4.getDate();
    document.querySelector("#sa").innerHTML = "Sam. " + d5.getDate();
    document.querySelector("#di").innerHTML = "Dim. " + d6.getDate();

    highlightToday();

    document.querySelectorAll(".event").forEach(el => {
        el.remove();
    });

    var cal = win.calendar;
    if (cal) {
        cal.events.forEach(element => {
            //console.log("el : " + element.start.day + "/" + element.start.month + "/" + element.start.year);
            //console.log("d0 : " + d0.getDate() + "/" + d0.getMonth() + "/" + d0.getFullYear());
            if (element.start.day == d0.getDate() && element.start.year == d0.getFullYear() && element.start.month == d0.getMonth() + 1) {
                displayEvent("d0", element);
            }
            if (element.start.day == d1.getDate() && element.start.year == d1.getFullYear() && element.start.month == d1.getMonth() + 1) {
                displayEvent("d1", element);
            }
            if (element.start.day == d2.getDate() && element.start.year == d2.getFullYear() && element.start.month == d2.getMonth() + 1) {
                displayEvent("d2", element);
            }
            if (element.start.day == d3.getDate() && element.start.year == d3.getFullYear() && element.start.month == d3.getMonth() + 1) {
                displayEvent("d3", element);
            }
            if (element.start.day == d4.getDate() && element.start.year == d4.getFullYear() && element.start.month == d4.getMonth() + 1) {
                displayEvent("d4", element);
            }
            if (element.start.day == d5.getDate() && element.start.year == d5.getFullYear() && element.start.month == d5.getMonth() + 1) {
                displayEvent("d5", element);
            }
            if (element.start.day == d6.getDate() && element.start.year == d6.getFullYear() && element.start.month == d6.getMonth() + 1) {
                displayEvent("d6", element);
            }
        });
    }
}


function displayEvent(where, what) {
    //console.log(what);
    var node = win.model.cloneNode(true);
    var r1 = /{min1}/ig;
    var r2 = /{min2}/ig;
    var r3 = /{hm1}/ig;
    var r4 = /{hm2}/ig;
    var r5 = /{summary}/ig;

    var offset = (what.start.hour - 7) * 60 + what.start.min;
    var duration = (what.end.hour - 7) * 60 + what.end.min - offset;

    /*
    what.start.hour + ":" + what.start.min
    what.end.hour + ":" + what.end.min
    what.summary
    */
    //console.log(node.outerHTML);
    document.querySelector("." + where).appendChild(node);

    node.innerHTML = node.innerHTML.replaceAll(r3, (("00" + what.start.hour).slice(-2)) + ":" + ("00" + what.start.min).slice(-2));
    node.innerHTML = node.innerHTML.replaceAll(r4, (("00" + what.end.hour).slice(-2)) + ":" + ("00" + what.end.min).slice(-2));
    node.innerHTML = node.innerHTML.replaceAll(r5, what.summary.replaceAll(/\\/ig, ""));

    var inter = node.outerHTML;
    inter = inter.replaceAll(r1, offset);
    inter = inter.replaceAll(r2, duration);
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

    var d0 = win.date;
    var d1 = (new Date(win.date.getTime() + 1 * 24 * 60 * 60 * 1000));
    var d2 = (new Date(win.date.getTime() + 2 * 24 * 60 * 60 * 1000));

    document.querySelector("#week").innerHTML = months[win.month - 1] + " " + win.year;// + " - Semaine " + win.week;

    document.querySelector("#lu").innerHTML = days[current_day] + " " + d0.getDate();
    document.querySelector("#ma").innerHTML = days[(current_day + 1) % 7] + " " + d1.getDate();
    document.querySelector("#me").innerHTML = days[(current_day + 2) % 7] + " " + d2.getDate();

    var cal = win.calendar;
    if (cal) {
        cal.events.forEach(element => {
            if (element.start.day == d0.getDate() && element.start.year == d0.getFullYear() && element.start.month == d0.getMonth() + 1) {
                displayEvent("d0", element);
            }
            if (element.start.day == d1.getDate() && element.start.year == d1.getFullYear() && element.start.month == d1.getMonth() + 1) {
                displayEvent("d1", element);
            }
            if (element.start.day == d2.getDate() && element.start.year == d2.getFullYear() && element.start.month == d2.getMonth() + 1) {
                displayEvent("d2", element);
            }
        });
    }

    highlightToday();
}