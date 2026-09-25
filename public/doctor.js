/* =========================================================
   HEALTHPULSE DOCTOR DASHBOARD JAVASCRIPT
   ========================================================= */

"use strict";

const input =
  document.getElementById("patientIdInput");

const button =
  document.getElementById("loadPatientButton");

const statusBox =
  document.getElementById("doctorStatus");

const emptyState =
  document.getElementById("emptyState");

const dashboard =
  document.getElementById("patientDashboard");


/* =========================================================
   API
   ========================================================= */

async function api(url) {

  const response =
    await fetch(url);

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {

    throw new Error(
      data.error ||
      `Unable to load patient (${response.status})`
    );

  }

  return data;
}


/* =========================================================
   LOAD PATIENT
   ========================================================= */

async function loadPatient() {

  const id =
    input.value.trim();

  if (!id) {

    statusBox.textContent =
      "Enter a Patient ID.";

    return;
  }

  statusBox.textContent =
    "Loading authorized patient data...";

  button.disabled = true;

  try {

    const data =
      await api(
        `/api/doctor/patient/${encodeURIComponent(id)}`
      );

    renderPatient(data);

    statusBox.textContent =
      "Authorized patient data loaded.";

  } catch (error) {

    dashboard.classList.add("hidden");
    emptyState.classList.remove("hidden");

    statusBox.textContent =
      error.message;

  } finally {

    button.disabled = false;

  }
}


/* =========================================================
   RENDER PATIENT
   ========================================================= */

function renderPatient(data) {

  const p =
    data.patient;

  emptyState.classList.add(
    "hidden"
  );

  dashboard.classList.remove(
    "hidden"
  );


  /* Patient identity */

  document.getElementById(
    "patientName"
  ).textContent =
    p.name || "Patient";


  document.getElementById(
    "patientMeta"
  ).textContent =
    [
      p.age
        ? `${p.age} years`
        : "",

      p.gender
        ? p.gender
        : ""
    ]
      .filter(Boolean)
      .join(" • ") ||
    "Profile details not provided";


  document.getElementById(
    "patientIdDisplay"
  ).textContent =
    p.patientId;


  /* Summary */

  document.getElementById(
    "doctorWeight"
  ).textContent =
    p.weight
      ? `${p.weight} kg`
      : "Not provided";


  const conditions =
    Array.isArray(p.conditions)
      ? p.conditions
      : [];


  document.getElementById(
    "doctorConditions"
  ).textContent =
    conditions.length
      ? conditions.join(", ")
      : "None listed";


  document.getElementById(
    "doctorReadingCount"
  ).textContent =
    data.measurements.length;


  document.getElementById(
    "doctorReminderCount"
  ).textContent =
    data.reminders.length;


  renderMeasurements(
    data.measurements
  );

  renderReminders(
    data.reminders
  );

  renderPatientInfo(p);
}


/* =========================================================
   MEASUREMENTS
   ========================================================= */

function renderMeasurements(
  measurements
) {

  const container =
    document.getElementById(
      "measurementCards"
    );

  if (!measurements.length) {

    container.innerHTML = `
      <div class="empty-doctor">
        No health measurements have been shared.
      </div>
    `;

    return;
  }

  const latest = {};

  measurements.forEach(item => {

    const old =
      latest[item.type];

    if (
      !old ||
      new Date(item.recordedAt) >
      new Date(old.recordedAt)
    ) {

      latest[item.type] =
        item;

    }

  });


  const names = {

    weight:
      "Weight",

    heart_rate:
      "Heart Rate",

    blood_pressure_systolic:
      "Blood Pressure - Systolic",

    blood_pressure_diastolic:
      "Blood Pressure - Diastolic",

    blood_glucose:
      "Blood Glucose",

    temperature:
      "Temperature",

    spo2:
      "SpO₂"

  };


  container.innerHTML =
    Object.values(latest)
      .map(item => `

        <div class="reading">

          <span>
            ${escapeHTML(
              names[item.type] ||
              item.type
            )}
          </span>

          <strong>
            ${escapeHTML(
              item.value
            )}
            ${
              item.unit
                ? ` ${escapeHTML(item.unit)}`
                : ""
            }
          </strong>

          <small>
            ${escapeHTML(
              formatDateTime(
                item.recordedAt
              )
            )}
          </small>

        </div>

      `)
      .join("");
}


/* =========================================================
   REMINDERS
   ========================================================= */

function renderReminders(
  reminders
) {

  const container =
    document.getElementById(
      "doctorReminders"
    );

  if (!reminders.length) {

    container.innerHTML = `
      <div class="empty-doctor">
        No medicine reminders shared.
      </div>
    `;

    return;
  }

  container.innerHTML =
    reminders
      .map(reminder => {

        const time =
          `${String(reminder.hour)
            .padStart(2, "0")}:
           ${String(reminder.minute)
            .padStart(2, "0")}`;


        return `

          <div class="list-item">

            <div>

              <strong>
                ${escapeHTML(
                  reminder.medicineName
                )}
              </strong>

              <small>
                ${escapeHTML(
                  reminder.dosage
                )}
                <br>
                ${escapeHTML(
                  reminder.date ||
                  "Daily"
                )}
                • ${time}
                • ${escapeHTML(
                  reminder.repeat
                )}
              </small>

            </div>

            <span class="status">
              ${escapeHTML(
                reminder.status
              )}
            </span>

          </div>

        `;

      })
      .join("");
}


/* =========================================================
   PATIENT INFORMATION
   ========================================================= */

function renderPatientInfo(
  patient
) {

  const container =
    document.getElementById(
      "patientInfo"
    );

  const items = [

    [
      "Height",
      patient.height
        ? `${patient.height} cm`
        : "Not provided"
    ],

    [
      "Activity",
      patient.dailyActivityMinutes
        ? `${patient.dailyActivityMinutes} min/day`
        : "Not provided"
    ],

    [
      "Goal",
      patient.goal ||
      "General wellness"
    ],

    [
      "Doctor Consent",
      patient.consentDoctorMonitoring
        ? "Enabled"
        : "Not enabled"
    ],

    [
      "Emergency Contact",
      patient.emergencyContactName ||
      "Not provided"
    ],

    [
      "Last Updated",
      patient.updatedAt
        ? formatDateTime(
            patient.updatedAt
          )
        : "—"
    ]

  ];


  container.innerHTML =
    items
      .map(item => `

        <div class="info-item">

          <span>
            ${escapeHTML(item[0])}
          </span>

          <strong>
            ${escapeHTML(item[1])}
          </strong>

        </div>

      `)
      .join("");
}


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function formatDateTime(value) {

  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }

  return date.toLocaleString();
}


/* =========================================================
   EVENTS
   ========================================================= */

button.addEventListener(
  "click",
  loadPatient
);

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      loadPatient();

    }

  }
);