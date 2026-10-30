(function () {

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
            "td[class*='current-']"
        )
        .forEach(cell => {

            const clockIn =
                cell.querySelector(
                    ".clock-in .tooltip"
                )
                ?.textContent
                ?.trim();

            const clockOut =
                cell.querySelector(
                    ".clock-out .tooltip"
                )
                ?.textContent
                ?.trim();

            const status =
                cell.querySelector(
                    ".status .tooltip"
                )
                ?.textContent
                ?.trim();

            const dateText =
                cell.querySelector(
                    ".date .tooltip"
                )
                ?.textContent
                ?.trim();

            if (!dateText) return;

            entries.push({
                date:
                    parseInt(
                        dateText,
                        10
                    ),
                clockIn,
                clockOut,
                status,
                cellClass:
                    cell.className
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

    const todayDay =
        new Date()
            .getDate();

    const todayEntry =
        entries.find(
            e =>
                e.date ===
                todayDay
        );

    let todayClockIn =
        "--";

    let expectedClockOut =
        "--";

    let earliestClockOut =
        "--";

    if (todayEntry) {

        if (
            !todayEntry.clockIn
        ) {

            todayClockIn =
                todayEntry.status ||
                "--";

        } else {

            const inMin =
                timeToMinutes(
                    todayEntry.clockIn
                );

            todayClockIn =
                format12Hour(
                    inMin
                );

            const expectedMinutes =
                Math.max(
                    inMin +
                        540,
                    17 * 60
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
            top:80px;
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
                background:#1f4e79;
                color:white;
                padding:12px 16px;
                font-weight:bold;
                display:flex;
                justify-content:space-between;
            ">
                <span>
                    Buffer Dashboard
                </span>

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
            background:#1f4e79;
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
        <span>Buffer Used:</span>
        <strong>${bufferCountUsed} days</strong>
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
        <span>Expected Clock-Out:</span>
        <strong>${expectedClockOut}</strong>
    </div>

    <div style="display:flex;justify-content:space-between;">
        <span>Earliest Clock-Out:</span>
        <strong>${earliestClockOut}</strong>
    </div>

</div>

        </div>
    `;

    document.body.appendChild(card);
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

})();
