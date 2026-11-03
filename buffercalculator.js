(function () {

const calendarIcon =
    document.querySelector(
        '[data-testid="CalendarMonthIcon"]'
    );

if (!calendarIcon) {

    alert(
        "Please go to WelPro Home Page and try again"
    );

    return;
}

calendarIcon.dispatchEvent(
    new MouseEvent(
        "click",
        {
            bubbles: true,
            cancelable: true,
            view: window
        }
    )
);

const waitForCalendar = setInterval(() => {

    const calendar =
        document.querySelector(
            ".react-calendar"
        );

    if (calendar) {

        clearInterval(
            waitForCalendar
        );

        // extract calendar data



const monthLabel =
    document
        .querySelector(
            ".react-calendar__navigation__label__labelText"
        )
        ?.textContent
        ?.trim();
    const existing =
        document.getElementById(
            "buffer-dashboard"
        );

    if (existing) {
        existing.remove();
    }

    function timeToMinutes(time) {

        if (!time) return null;

        const [h, m] =
            time.split(":");

        return (
            parseInt(h, 10) * 60 +
            parseInt(m, 10)
        );
    }

function startCountdown(expectedMinutes) {

    const updateCountdown = () => {

        const now = new Date();

        const currentSeconds =
            (now.getHours() * 3600) +
            (now.getMinutes() * 60) +
            now.getSeconds();

        const expectedSeconds =
            expectedMinutes * 60;

        const remaining =
            expectedSeconds -
            currentSeconds;

        const el =
            document.getElementById(
                "countdownTimer"
            );

        if (!el) return;

        if (remaining <= 0) {
el.style.color = "#16a34a"; // green
    const overtime =
        Math.abs(remaining);

    const hrs =
        Math.floor(overtime / 3600);

    const mins =
        Math.floor(
            (overtime % 3600) / 60
        );

    const secs =
        overtime % 60;

    el.textContent =
        `+${hrs}h ${mins}m ${secs}s`;

    return;
}

        const hrs =
            Math.floor(
                remaining / 3600
            );

        const mins =
            Math.floor(
                (remaining % 3600) / 60
            );

        const secs =
            remaining % 60;

        el.textContent =
            `${hrs}h ${mins}m ${secs}s`;
    };

    updateCountdown();

    return setInterval(
        updateCountdown,
        1000
    );
}

    function format12Hour(minutes) {

        const h24 =
            Math.floor(minutes / 60) % 24;

        const mins =
            minutes % 60;

        const ampm =
            h24 >= 12
                ? "PM"
                : "AM";

        let h12 =
            h24 % 12;

        if (h12 === 0) {
            h12 = 12;
        }

        return (
            h12 +
            ":" +
            String(mins)
                .padStart(2, "0") +
            " " +
            ampm
        );
    }

    const entries = [];

    document
    .querySelectorAll(
        ".react-calendar__month-view__days .react-calendar__tile"
    )
        .forEach(tile => {

    const date =
        parseInt(
            tile
                .querySelector("abbr")
                ?.textContent
                ?.trim(),
            10
        );

    const clockIn =
        tile
            .querySelector(".checkInTime")
            ?.textContent
            ?.trim();

    const clockOut =
        tile
            .querySelector(".checkOutTime")
            ?.textContent
            ?.trim();

    const status =
        tile
            .querySelector(".status")
            ?.textContent
            ?.trim();

    const hoursWorked =
        tile
            .querySelector(".dayHours")
            ?.textContent
            ?.trim();

    entries.push({
        date,
        clockIn,
        clockOut,
        status,
        hoursWorked,
        tileClass:
            tile.className,
        isToday:
            tile.classList.contains(
                "react-calendar__tile--now"
            )
    });
});

    const attendanceEntries =
        entries.filter(
            e =>
                e.clockIn &&
                e.clockOut
        );

    let totalDeviation = 0;
    let bufferCountUsed = 0;
    let maxBufferTaken = 0;

    attendanceEntries.forEach(
        day => {

            const inMin =
                timeToMinutes(
                    day.clockIn
                );

            const outMin =
                timeToMinutes(
                    day.clockOut
                );

            if (
                inMin === null ||
                outMin === null
            ) {
                return;
            }

            let adjustedOut =
                outMin;

            if (
                adjustedOut <
                inMin
            ) {
                adjustedOut +=
                    1440;
            }

            const duration =
                (
                    adjustedOut -
                    inMin
                ) / 60;

            let deviation = 0;

            if (
                duration < 9 &&
                duration >= 8.5
            ) {
                deviation =
                    (9 -
                        duration) *
                    60;

                totalDeviation +=
                    deviation;

                bufferCountUsed++;

                if (
                    deviation >
                    maxBufferTaken
                ) {
                    maxBufferTaken =
                        deviation;
                }
            }
        }
    );

    totalDeviation =
        Math.round(
            totalDeviation
        );

    maxBufferTaken =
        Math.round(
            maxBufferTaken
        );

    const remainingBuffer =
        Math.max(
            0,
            90 -
                totalDeviation
        );

    const bufferRemaining =
        Math.max(
            0,
            10 -
                bufferCountUsed
        );

    const currentMonthYear =
    new Date()
        .toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

const calendarMatchesCurrentMonth =
    monthLabel &&
    monthLabel === currentMonthYear;

const historicalMonthMessage =
    calendarMatchesCurrentMonth
        ? ""
        : `
            <div style="
                text-align:center;
            ">
                ${monthLabel}
            </div>
          `;

let todayEntry = null;

if (calendarMatchesCurrentMonth) {

    todayEntry =
    entries.find(
        e => e.isToday
    );
}

           
    let todayClockIn =
        "--";

    let expectedClockOut =
        "--";

    let earliestClockOut =
        "--";

let expectedMinutes = null;

let halfDayClockOut = "--";

let todayClockOut = "--";

    if (todayEntry) {

        if (!todayEntry.clockIn) {

            todayClockIn =
                todayEntry.status ||
                "--";

        } else {

            const inMin =
                timeToMinutes(
                    todayEntry.clockIn
                );
const effectiveClockIn =
    Math.max(
        inMin,
        8 * 60
    );

halfDayClockOut =
    format12Hour(
        effectiveClockIn + 270
    );

            todayClockIn =
                format12Hour(
                    inMin
                );

const actualClockOutMin =
    timeToMinutes(
        todayEntry.clockOut
    );

if (
    actualClockOutMin !== null
) {

    let adjustedOut =
        actualClockOutMin;

    if (
        adjustedOut < inMin
    ) {
        adjustedOut += 1440;
    }

    const workedHours =
        (
            adjustedOut -
            inMin
        ) / 60;

    if (
        workedHours >= 8.5
    ) {

        todayClockOut =
            format12Hour(
                actualClockOutMin
            );

        expectedClockOut = "--";
        earliestClockOut = "--";
        halfDayClockOut = "--";
        expectedMinutes = null;

    } else {

        // Still working
        todayClockOut = "--";
    }
}
            

if (todayClockOut === "--") {

    expectedMinutes =
        Math.max(
            inMin + 540,
            17 * 60
        );

    halfDayClockOut =
        format12Hour(
            effectiveClockIn + 270
        );

    expectedClockOut =
        format12Hour(
            expectedMinutes
        );

    const usableBuffer =
        Math.min(
            remainingBuffer,
            30
        );

    earliestClockOut =
        format12Hour(
            expectedMinutes -
            usableBuffer
        );
}
        }
    }

    const today =
        new Date();

    const lastDayOfMonth =
        new Date(
            today.getFullYear(),
            today.getMonth() +
                1,
            0
        );

    const bufferResetDays =
        Math.ceil(
            (
                lastDayOfMonth -
                today
            ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
        );

    const card =
        document.createElement(
            "div"
        );

    card.id =
        "buffer-dashboard";

    card.innerHTML = `
        <div style="
            position:fixed;
            top:70px;
            right:20px;
            width:360px;
            background:white;
            border-radius:12px;
            box-shadow:0 8px 24px rgba(0,0,0,.25);
            z-index:999999;
            font-family:'Segoe UI';
            overflow:hidden;
        ">
            <div style="
                background:#160b8b;
                color:white;
                padding:12px 16px;
                font-weight:bold;
                display:flex;
                justify-content:space-between;
            ">
                <span>
                    Buffer Dashboard
                </span>
${historicalMonthMessage}
                <span
                    style="
                        cursor:pointer
                    "
                    onclick="
                        document
                        .getElementById(
                        'buffer-dashboard'
                        )
                        .remove();
                    "
                >
                    ✕
                </span>
            </div>

<div style="padding:12px;">
    <button id="downloadBufferDashboard"
        style="
            width:100%;
            background:#160b8b;
            color:white;
            border:none;
            padding:10px;
            border-radius:6px;
            cursor:pointer;
            font-size:14px;
            font-weight:600;
        ">
        Download Dashboard
    </button>
</div>

            <div style="
    padding:16px;
">

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Total Deviation:</span>
        <strong>${totalDeviation} min</strong>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Remaining Buffer:</span>
        <strong>${remainingBuffer} min</strong>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Buffer Events Used:</span>
        <strong>${bufferCountUsed} days</strong>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Buffer Events Remaining:</span>
        <strong>${bufferRemaining} days</strong>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Buffer Resets In:</span>
        <strong>${bufferResetDays} day${bufferResetDays !== 1 ? "s" : ""}</strong>
    </div>

    <div style="
        border-top:1px solid #ddd;
        margin:12px 0;
    "></div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Today's Clock-In:</span>
        <strong>${todayClockIn}</strong>
    </div>
<div style="display:flex;justify-content:space-between;margin-bottom:10px;">
    <span>Today's Clock-Out:</span>
    <strong>${todayClockOut}</strong>
</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Half-Day Clock-Out:</span>
        <strong>${halfDayClockOut}</strong>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Earliest Clock-Out:</span>
        <strong>${earliestClockOut}</strong>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>Expected Clock-Out:</span>
        <strong>${expectedClockOut}</strong>
    </div>

<div style="display:flex;justify-content:space-between;">
    <span>Time Until Expected Out:</span>
    <strong id="countdownTimer">--</strong>
</div>



    

</div>

        </div>
    `;

    document.body.appendChild(card);
if (
    expectedMinutes !== null &&
    calendarMatchesCurrentMonth
) {
    window.bufferCountdown =
    startCountdown(
        expectedMinutes
    );
}
document
    .getElementById("downloadBufferDashboard")
    .addEventListener("click", () => {

        const content = `
BUFFER DASHBOARD
================

Total Deviation       : ${totalDeviation} min
Remaining Buffer      : ${remainingBuffer} min

Buffer Events Used    : ${bufferCountUsed} days
Buffer Events Remaining : ${bufferRemaining} days

Buffer Resets In      : ${bufferResetDays} day${bufferResetDays !== 1 ? "s" : ""}

Today's Clock-In      : ${todayClockIn}
Expected Clock-Out    : ${expectedClockOut}
Earliest Clock-Out    : ${earliestClockOut}
Half-Day Clock-Out    : ${halfDayClockOut}
`.trim();

        const blob = new Blob(
            [content],
            { type: "text/plain" }
        );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        const today =
            new Date();

        const dateString =
            today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0");

        a.href = url;

        a.download =
            `BufferDashboard-${dateString}.txt`;

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);
    });

}
}, 100);

setTimeout(() => {

    const closeButton =
        document.querySelector(
            '[data-testid="CloseIcon"]'
        );

    if (closeButton) {

        closeButton.dispatchEvent(
            new MouseEvent(
                "click",
                {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }
            )
        );
    }

}, 1000);


})();
