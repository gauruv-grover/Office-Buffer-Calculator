(function () {

    const existing = document.getElementById("buffer-dashboard");

    if (existing) {
        existing.remove();
    }

    const rows = [...document.querySelectorAll("table tr")];

    const data = [];
    let employeeName = "";

    rows.slice(1).forEach(row => {

        const cols = [...row.querySelectorAll("td")];

        if (cols.length < 8) return;

        if (!employeeName) {
            employeeName = cols[2]?.innerText?.trim();
        }

        data.push({
            date: cols[3]?.innerText?.trim(),
            clockIn: cols[6]?.innerText?.trim(),
            clockOut: cols[7]?.innerText?.trim()
        });
    });

    function timeToMinutes(time) {

        if (!time) return null;

        const parts = time.split(":");

        if (parts.length < 2) return null;

        return (
            parseInt(parts[0], 10) * 60 +
            parseInt(parts[1], 10)
        );
    }

    function format12Hour(minutes) {

        const hour24 =
            Math.floor(minutes / 60) % 24;

        const mins =
            minutes % 60;

        const ampm =
            hour24 >= 12 ? "PM" : "AM";

        let hour12 =
            hour24 % 12;

        if (hour12 === 0) {
            hour12 = 12;
        }

        return (
            hour12 +
            ":" +
            String(mins).padStart(2, "0") +
            " " +
            ampm
        );
    }

    let totalDeviation = 0;
    let bufferCountUsed = 0;
    let maxBufferTaken = 0;

    data.forEach(row => {

        const inMin =
            timeToMinutes(row.clockIn);

        const outMin =
            timeToMinutes(row.clockOut);

        if (
            inMin === null ||
            outMin === null
        ) {
            return;
        }

        let adjustedOut =
            outMin;

        if (adjustedOut < inMin) {
            adjustedOut += 1440;
        }

        const duration =
            (adjustedOut - inMin) / 60;

        let deviation = 0;

        if (
            duration < 9 &&
            duration >= 8.5
        ) {
            deviation =
                (9 - duration) * 60;
        }

        totalDeviation += deviation;

        if (deviation > 0) {
            bufferCountUsed++;
        }

        if (deviation > maxBufferTaken) {
            maxBufferTaken = deviation;
        }
    });

    totalDeviation =
        Math.round(totalDeviation);

    maxBufferTaken =
        Math.round(maxBufferTaken);

    const remainingBufferTime =
        Math.max(
            0,
            90 - totalDeviation
        );

    const remainingBufferCount =
        Math.max(
            0,
            10 - bufferCountUsed
        );

    const today =
        new Date();

    let todayClockIn = "--";
    let expectedClockOut = "--";
    let earliestClockOut = "--";

    data.forEach(row => {

        if (!row.date) return;

        const rowDate =
            new Date(
                row.date.replace(/-/g, " ")
            );

        if (
            rowDate.getDate() === today.getDate() &&
            rowDate.getMonth() === today.getMonth() &&
            rowDate.getFullYear() === today.getFullYear()
        ) {

            const inMin =
                timeToMinutes(
                    row.clockIn
                );

            if (inMin !== null) {

                todayClockIn =
                    format12Hour(
                        inMin
                    );

                const expectedClockOutMinutes =
                    Math.max(
                        inMin + 540,
                        17 * 60
                    );

                expectedClockOut =
                    format12Hour(
                        expectedClockOutMinutes
                    );

                const usableBufferToday =
                    Math.min(
                        remainingBufferTime,
                        30
                    );

                earliestClockOut =
                    format12Hour(
                        expectedClockOutMinutes -
                        usableBufferToday
                    );
            }
        }
    });

    const card =
        document.createElement("div");

    card.id =
        "buffer-dashboard";

    card.innerHTML = `
        <div style="
            position:fixed;
            top:90px;
            right:20px;
            width:340px;
            background:white;
            border-radius:12px;
            box-shadow:0 4px 20px rgba(0,0,0,.25);
            z-index:999999;
            font-family:Segoe UI;
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
                    style="cursor:pointer"
                    onclick="
                        document
                        .getElementById('buffer-dashboard')
                        .remove();
                    ">
                    ✕
                </span>
            </div>

            <div style="padding:15px">

                <div style="
                    margin-bottom:12px;
                    font-weight:bold;
                    font-size:15px;
                ">
                    ${employeeName}
                </div>

                <div>
                    Today's Clock-In:
                    <b>${todayClockIn}</b>
                </div>

                <div>
                    Expected Clock-Out:
                    <b>${expectedClockOut}</b>
                </div>

                <div>
                    Earliest Clock-Out:
                    <b>${earliestClockOut}</b>
                </div>

                <hr>

                <div>
                    Total Deviation:
                    <b>${totalDeviation} min</b>
                </div>

                <div>
                    Remaining Buffer:
                    <b>${remainingBufferTime} min</b>
                </div>

                <div>
                    Buffer Used:
                    <b>${bufferCountUsed} days</b>
                </div>

                <div>
                    Buffer Remaining:
                    <b>${remainingBufferCount} days</b>
                </div>

                <div>
                    Max Buffer:
                    <b>${maxBufferTaken} min</b>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(card);

})();