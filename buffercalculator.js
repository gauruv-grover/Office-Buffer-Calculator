(function () {

    const existing = document.getElementById("buffer-dashboard");

    if (existing) existing.remove();

    function timeToMinutes(time) {

        if (!time) return null;

        const [h, m] = time.split(":");

        return parseInt(h, 10) * 60 +
               parseInt(m, 10);
    }

    function format12Hour(minutes) {

        const h24 = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;

        const ampm =
            h24 >= 12 ? "PM" : "AM";

        let h12 =
            h24 % 12;

        if (h12 === 0) h12 = 12;

        return (
            h12 +
            ":" +
            String(mins).padStart(2, "0") +
            " " +
            ampm
        );
    }

    const entries = [];

    document
        .querySelectorAll(
            "td.current-p, td.current-lv"
        )
        .forEach(cell => {

            const clockIn =
                cell.querySelector(
                    ".clock-in .tooltip"
                )?.textContent?.trim();

            const clockOut =
                cell.querySelector(
                    ".clock-out .tooltip"
                )?.textContent?.trim();

            const status =
                cell.querySelector(
                    ".status .tooltip"
                )?.textContent?.trim();

            const dateText =
                cell.querySelector(
                    ".date .tooltip"
                )?.textContent?.trim();

            if (!clockIn || !clockOut)
                return;

            entries.push({
                date: parseInt(dateText, 10),
                clockIn,
                clockOut,
                status
            });
        });

    let totalDeviation = 0;
    let bufferCountUsed = 0;
    let maxBufferTaken = 0;

    entries.forEach(day => {

        let inMin =
            timeToMinutes(
                day.clockIn
            );

        let outMin =
            timeToMinutes(
                day.clockOut
            );

        if (
            inMin === null ||
            outMin === null
        ) {
            return;
        }

        if (outMin < inMin) {
            outMin += 1440;
        }

        const duration =
            (outMin - inMin) / 60;

        let deviation = 0;

        if (
            duration < 9 &&
            duration >= 8.5
        ) {
            deviation =
                (9 - duration) * 60;

            totalDeviation += deviation;
            bufferCountUsed++;

            if (
                deviation >
                maxBufferTaken
            ) {
                maxBufferTaken =
                    deviation;
            }
        }
    });

    totalDeviation =
        Math.round(totalDeviation);

    maxBufferTaken =
        Math.round(maxBufferTaken);

    const remainingBuffer =
        Math.max(
            0,
            90 - totalDeviation
        );

    const bufferRemaining =
        Math.max(
            0,
            10 - bufferCountUsed
        );

    const today =
        new Date();

    let todayClockIn = "--";
    let expectedClockOut = "--";
    let earliestClockOut = "--";

    const todayEntry =
        entries.find(
            e =>
                e.date ===
                today.getDate()
        );

    if (todayEntry) {

        const inMin =
            timeToMinutes(
                todayEntry.clockIn
            );

        todayClockIn =
            format12Hour(inMin);

        const expectedMinutes =
            Math.max(
                inMin + 540,
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

    const lastDayOfMonth =
        new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );

    const bufferResetDays =
        Math.ceil(
            (
                lastDayOfMonth -
                today
            ) /
            (1000 * 60 * 60 * 24)
        );

    const card =
        document.createElement("div");

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
                <span>Buffer Dashboard</span>

                <span
                    style="cursor:pointer;"
                    onclick="
                        document
                        .getElementById(
                         'buffer-dashboard'
                        )
                        .remove();
                    ">
                    ✕
                </span>
            </div>

            <div style="
                padding:16px;
                line-height:1.9;
            ">

                Today's Clock-In:
                <strong>${todayClockIn}</strong>
                <br>

                Expected Clock-Out:
                <strong>${expectedClockOut}</strong>
                <br>

                Earliest Clock-Out:
                <strong>${earliestClockOut}</strong>
                <br>

                Total Deviation:
                <strong>${totalDeviation} min</strong>
                <br>

                Remaining Buffer:
                <strong>${remainingBuffer} min</strong>
                <br>

                Buffer Used:
                <strong>${bufferCountUsed} days</strong>
                <br>

                Buffer Remaining:
                <strong>${bufferRemaining} days</strong>
                <br>

                Buffer Resets In:
                <strong>${bufferResetDays} day${bufferResetDays !== 1 ? "s" : ""}</strong>

            </div>
        </div>
    `;

    document.body.appendChild(card);

})();
