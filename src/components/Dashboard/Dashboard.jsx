import React, { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const today = new Date();
  const currentDateStr = today.toLocaleDateString("en-CA");

  const [selectedDate, setSelectedDate] = useState(currentDateStr);
  const [isToday, setIsToday] = useState(true);

  const day = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });

  const savings = ["Stocks", "Mutual Funds", "IPO's"];

  const daySchedule = [
    { task: "Wake up", timing: "5:30 am" },
    { task: "Check mails", timing: "6:00 am - 7:00 am" },
    { task: "Check today schedule", timing: "7:00 am - 7:30 am" },
    { task: "Job portal", timing: "7:30 am - 8:30 pm" },
    { task: "Brush & tea break", timing: "8:30 am - 9:30 am" },
    { task: "Internship", timing: "9:30 am - 1:00 pm" },
    { task: "Lunch", timing: "1:00 pm - 2:00 pm" },
    { task: "Skills", timing: "2:00 pm - 4:30 pm" },
    { task: "Break", timing: "4:30 pm - 5:30 pm" },
    { task: "Job application", timing: "5:30 pm - 7:30 pm" },
    { task: "Dinner", timing: "7:30 pm - 8:30 pm" },
    { task: "Revision", timing: "8:30 pm - 10:30 pm" },
    { task: "Sleep", timing: "10:30 pm" },
  ];

  const dailyTasks = [
    "Attend interview (1)",
    "Apply jobs (10)",
    "Apply IPO (id's)",
    "Learn new skill (topic)",
    "Revision (subject)",
    "Reduce screen time (2hr)",
  ];

  const emptyTableData = {
    Stocks: { invested: "", profit: "", netProfit: "", goal: "" },
    "Mutual Funds": { invested: "", profit: "", netProfit: "", goal: "" },
    "IPO's": { invested: "", profit: "", netProfit: "", goal: "" },
  };

  const [tableData, setTableData] = useState(emptyTableData);
  const [dayStatus, setDayStatus] = useState(daySchedule.map(() => false));
  const [dailyStatus, setDailyStatus] = useState(
    dailyTasks.map(() => [false, false, false, false, false])
  );
  const [scheduleData, setScheduleData] = useState(
    Array.from({ length: 5 }, () => ({
      task: "",
      startTime: "",
      description: "",
      endTime: "",
      status: "Pending",
    }))
  );

  const [existingRecord, setExistingRecord] = useState(null);

  const fetchData = async (dateToFetch) => {
    try {
      const res = await fetch(
        `https://sheetdb.io/api/v1/nipv43e33g4tr/search?date=${encodeURIComponent(dateToFetch)}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const row = data[0];
        setExistingRecord(row);

        // Parse JSON fields - using correct column names
        let parsedDayStatus = daySchedule.map(() => false);
        let parsedDailyStatus = dailyTasks.map(() => [false, false, false, false, false]);
        let parsedSchedule = Array.from({ length: 5 }, () => ({
          task: "",
          startTime: "",
          description: "",
          endTime: "",
          status: "Pending",
        }));

        if (row.daySchedule) {
          try {
            const ds = JSON.parse(row.daySchedule);
            if (Array.isArray(ds)) parsedDayStatus = ds;
          } catch (e) { console.warn("Failed to parse daySchedule", e); }
        }

        if (row.dailyTasks) {
          try {
            const dt = JSON.parse(row.dailyTasks);
            if (Array.isArray(dt)) parsedDailyStatus = dt;
          } catch (e) { console.warn("Failed to parse dailyTasks", e); }
        }

        if (row.today_schedule) {
          try {
            const ts = JSON.parse(row.today_schedule);
            if (Array.isArray(ts)) parsedSchedule = ts;
          } catch (e) { console.warn("Failed to parse today_schedule", e); }
        }

        setTableData({
          Stocks: {
            invested: row.stock_invested || "",
            profit: row.stock_profit || "",
            netProfit: row.stock_net_profit || "",
            goal: row.stock_goal || "",
          },
          "Mutual Funds": {
            invested: row.mf_invested || "",
            profit: row.mf_profits || "",
            netProfit: row.mf_net_profit || "",
            goal: row.mf_goal || "",
          },
          "IPO's": {
            invested: row.ipo_invested || "",
            profit: row.ipo_profit || "",
            netProfit: row.ipo_net_profit || "",
            goal: row.ipo_goal || "",
          },
        });

        setDayStatus(parsedDayStatus);
        setDailyStatus(parsedDailyStatus);
        setScheduleData(parsedSchedule);
      } else {
        setExistingRecord(null);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      resetForm();
    }
  };

  const resetForm = () => {
    setTableData(emptyTableData);
    setDayStatus(daySchedule.map(() => false));
    setDailyStatus(dailyTasks.map(() => [false, false, false, false, false]));
    setScheduleData(
      Array.from({ length: 5 }, () => ({
        task: "",
        startTime: "",
        description: "",
        endTime: "",
        status: "Pending",
      }))
    );
  };

  // Fetch when selected date changes
  useEffect(() => {
    fetchData(selectedDate);
    setIsToday(selectedDate === currentDateStr);
  }, [selectedDate]);

  const handleChange = (type, field, value) => {
    setTableData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setScheduleData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleDayCheckbox = (index, checked) => {
    setDayStatus((prev) => prev.map((val, i) => (i === index ? checked : val)));
  };

  const handleDailyCheckbox = (taskIndex, levelIndex, checked) => {
    setDailyStatus((prev) =>
      prev.map((levels, i) =>
        i === taskIndex
          ? levels.map((val, j) => (j === levelIndex ? checked : val))
          : levels
      )
    );
  };

  const update = async () => {
    if (!isToday) {
      alert("You can only save data for today. Please select today's date.");
      setSelectedDate(currentDateStr);
      return;
    }

    const confirmSave = window.confirm(
      existingRecord
        ? "Previous data found for today. Do you want to update it?"
        : "Save new record for today?"
    );

    if (!confirmSave) return;

    const payload = {
      date: selectedDate,
      stock_invested: tableData["Stocks"].invested,
      stock_profit: tableData["Stocks"].profit,
      stock_net_profit: tableData["Stocks"].netProfit,
      stock_goal: tableData["Stocks"].goal,
      mf_invested: tableData["Mutual Funds"].invested,
      mf_profits: tableData["Mutual Funds"].profit,
      mf_net_profit: tableData["Mutual Funds"].netProfit,
      mf_goal: tableData["Mutual Funds"].goal,
      ipo_invested: tableData["IPO's"].invested,
      ipo_profit: tableData["IPO's"].profit,
      ipo_net_profit: tableData["IPO's"].netProfit,
      ipo_goal: tableData["IPO's"].goal,

      // ✅ Correct column names matching Google Sheet
      daySchedule: JSON.stringify(dayStatus),
      dailyTasks: JSON.stringify(dailyStatus),
      today_schedule: JSON.stringify(scheduleData),
    };

    try {
      const check = await fetch(
        `https://sheetdb.io/api/v1/nipv43e33g4tr/search?date=${encodeURIComponent(selectedDate)}`
      );
      const existing = await check.json();

      if (existing.length > 0) {
        await fetch(
          `https://sheetdb.io/api/v1/nipv43e33g4tr/date/${encodeURIComponent(selectedDate)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: payload }),
          }
        );
        alert("✅ Record updated successfully!");
      } else {
        await fetch("https://sheetdb.io/api/v1/nipv43e33g4tr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: [payload] }),
        });
        alert("✅ New record created successfully!");
      }

      fetchData(selectedDate); // Refresh
    } catch (err) {
      console.error(err);
      alert("❌ Error saving data. Check console.");
    }
  };

  return (
    <div className="planner">
      {/* Date Selector */}
      <div className="top-section" style={{ marginBottom: "20px" }}>
        <div>
          <label>Date :</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div>
          <label>Day :</label>
          <input type="text" value={day} readOnly />
        </div>
        {isToday && <small style={{ color: "green" }}>✅ Today - Editable</small>}
        {!isToday && <small style={{ color: "orange" }}>📅 Viewing Previous Day (Read Only)</small>}
      </div>

      {/* Saving and Investment */}
      <h3>Saving and Investment</h3>
      <table>
        <thead>
          <tr>
            <th>Type of Savings</th>
            <th>Invested</th>
            <th>Profit</th>
            <th>Net Profit</th>
            <th>Goal</th>
          </tr>
        </thead>
        <tbody>
          {savings.map((item) => (
            <tr key={item}>
              <td>{item}</td>
              <td>
                <input
                  value={tableData[item].invested}
                  onChange={(e) => handleChange(item, "invested", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={tableData[item].profit}
                  onChange={(e) => handleChange(item, "profit", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={tableData[item].netProfit}
                  onChange={(e) => handleChange(item, "netProfit", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={tableData[item].goal}
                  onChange={(e) => handleChange(item, "goal", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Day Schedule */}
      <h3>Day Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Timings</th>
            <th>Fulfilled</th>
          </tr>
        </thead>
        <tbody>
          {daySchedule.map((item, index) => (
            <tr key={index}>
              <td>{item.task}</td>
              <td>{item.timing}</td>
              <td>
                <input
                  type="checkbox"
                  checked={dayStatus[index] || false}
                  onChange={(e) => handleDayCheckbox(index, e.target.checked)}
                  disabled={!isToday}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Daily Tasks */}
      <h3>Daily Task</h3>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 4</th>
            <th>Level 5</th>
          </tr>
        </thead>
        <tbody>
          {dailyTasks.map((task, index) => (
            <tr key={index}>
              <td>{task}</td>
              {[0, 1, 2, 3, 4].map((level) => (
                <td key={level}>
                  <input
                    type="checkbox"
                    checked={dailyStatus[index]?.[level] || false}
                    onChange={(e) =>
                      handleDailyCheckbox(index, level, e.target.checked)
                    }
                    disabled={!isToday}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Today's Schedule */}
      <h3>Today's Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Start Time</th>
            <th>Description</th>
            <th>End Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  value={row.task}
                  onChange={(e) => handleScheduleChange(index, "task", e.target.value)}
                  disabled={!isToday}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                  disabled={!isToday}
                />
              </td>
              <td>
                <input
                  value={row.description}
                  onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                  disabled={!isToday}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                  disabled={!isToday}
                />
              </td>
              <td>
                <select
                  value={row.status}
                  onChange={(e) => handleScheduleChange(index, "status", e.target.value)}
                  disabled={!isToday}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

          <div id="btn2">
            
      {isToday && (
        <div style={{ display: "flex", gap: "20px", marginTop: "2px" }}>
          <button id="btn22" type="button" onClick={update}>
            Save / Update
          </button>
        </div>
      )}
      </div>
    </div>
  );
}