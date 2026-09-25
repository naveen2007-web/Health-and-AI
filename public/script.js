/* =========================================================
   HEALTHPULSE - COMPLETE FRONTEND SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const API = "/api";

const LS = {
    patient: "healthpulsePatientId",
    meals: "healthpulseMeals",
    activities: "healthpulseActivities"
};

let patient = null;
let measurements = [];
let reminders = [];


/* =========================================================
   SAFE DOM HELPER
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   SAFE VALUE HELPERS
   ========================================================= */

function numberValue(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function round(value, decimals = 1) {
    const n = numberValue(value);
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
}

function today() {
    const d = new Date();

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function nowTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LOADING SCREEN
   ========================================================= */

let loadingFinished = false;

function finishLoading() {

    if (loadingFinished) return;

    loadingFinished = true;

    const loading = $("loadingScreen");
    const app = $("app");

    try {
        if (loading) {
            loading.classList.add("loaded");
            loading.style.opacity = "0";
            loading.style.pointerEvents = "none";

            setTimeout(() => {
                try {
                    loading.style.display = "none";
                } catch (_) {}
            }, 400);
        }

        if (app) {
            app.classList.remove("hidden");
            app.style.display = "flex";
            app.style.visibility = "visible";
            app.style.opacity = "1";
        }

        document.body.classList.add("healthpulse-ready");

    } catch (error) {
        console.warn("Loading screen cleanup warning:", error);
    }
}


/*
   IMPORTANT:
   These fallbacks make sure that even if another part
   of the application encounters an error, the user is
   not permanently stuck on the loading screen.
*/

window.addEventListener("load", () => {
    setTimeout(finishLoading, 150);
});

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(finishLoading, 250);
});

setTimeout(finishLoading, 3000);


/* =========================================================
   TOAST
   ========================================================= */

function toast(message, type = "ok") {

    const box = $("toast");
    const text = $("toastMessage");

    if (!box || !text) {
        console.log(message);
        return;
    }

    text.textContent = message;

    box.className = "toast show";

    if (type === "error") {
        box.classList.add("error");
    }

    if (type === "warning") {
        box.classList.add("warning");
    }

    clearTimeout(box._toastTimer);

    box._toastTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 2800);
}


/* =========================================================
   API
   ========================================================= */

async function api(url, options = {}) {

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(API + url, config);

    let data = {};

    try {
        data = await response.json();
    } catch (_) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.error ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getMeals() {

    try {
        const data = JSON.parse(
            localStorage.getItem(LS.meals) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (_) {
        return [];
    }
}

function setMeals(data) {

    try {
        localStorage.setItem(
            LS.meals,
            JSON.stringify(Array.isArray(data) ? data : [])
        );
    } catch (error) {
        console.warn("Unable to save meals:", error);
    }
}

function getActivities() {

    try {
        const data = JSON.parse(
            localStorage.getItem(LS.activities) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (_) {
        return [];
    }
}

function setActivities(data) {

    try {
        localStorage.setItem(
            LS.activities,
            JSON.stringify(Array.isArray(data) ? data : [])
        );
    } catch (error) {
        console.warn("Unable to save activities:", error);
    }
}

function dayMeals() {
    return getMeals().filter(item => item.date === today());
}

function dayActivities() {
    return getActivities().filter(item => item.date === today());
}


/* =========================================================
   FOOD DATABASE FALLBACK
   ========================================================= */

const DEFAULT_FOODS = {

    Dosa: {
        cal: 135,
        protein: 3.5,
        carbs: 20,
        fat: 4.5
    },

    Idli: {
        cal: 58,
        protein: 2,
        carbs: 12,
        fat: 0.3
    },

    Chapati: {
        cal: 120,
        protein: 3.5,
        carbs: 20,
        fat: 3
    },

    Parotta: {
        cal: 260,
        protein: 5,
        carbs: 35,
        fat: 11
    },

    Rice: {
        cal: 205,
        protein: 4,
        carbs: 45,
        fat: 0.4
    },

    Pongal: {
        cal: 210,
        protein: 6,
        carbs: 32,
        fat: 7
    },

    Upma: {
        cal: 180,
        protein: 5,
        carbs: 30,
        fat: 5
    },

    Egg: {
        cal: 78,
        protein: 6.3,
        carbs: 0.6,
        fat: 5.3
    },

    Banana: {
        cal: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4
    },

    Apple: {
        cal: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3
    },

    Milk: {
        cal: 122,
        protein: 8,
        carbs: 12,
        fat: 5
    },

    Tea: {
        cal: 70,
        protein: 2,
        carbs: 10,
        fat: 2
    },

    Coffee: {
        cal: 65,
        protein: 2,
        carbs: 8,
        fat: 2
    },

    Paneer: {
        cal: 265,
        protein: 18,
        carbs: 6,
        fat: 20
    },

    ChickenBiryani: {
        cal: 350,
        protein: 18,
        carbs: 42,
        fat: 13
    },

    Samosa: {
        cal: 160,
        protein: 3,
        carbs: 18,
        fat: 9
    },

    Bajji: {
        cal: 120,
        protein: 2,
        carbs: 14,
        fat: 6
    }
};

const DEFAULT_SIDES = {

    Sambar: {
        cal: 90,
        protein: 4,
        carbs: 12,
        fat: 3
    },

    CoconutChutney: {
        cal: 80,
        protein: 1.5,
        carbs: 5,
        fat: 6
    },

    TomatoChutney: {
        cal: 45,
        protein: 1,
        carbs: 7,
        fat: 1.5
    },

    PotatoMasala: {
        cal: 120,
        protein: 2,
        carbs: 20,
        fat: 4
    },

    ChickenCurry: {
        cal: 180,
        protein: 18,
        carbs: 5,
        fat: 10
    },

    EggCurry: {
        cal: 160,
        protein: 8,
        carbs: 6,
        fat: 11
    },

    Curd: {
        cal: 70,
        protein: 4,
        carbs: 5,
        fat: 4
    },

    Rasam: {
        cal: 35,
        protein: 1.5,
        carbs: 5,
        fat: 0.5
    }
};

function foodDatabase() {
    return (
        typeof FOODS !== "undefined" &&
        FOODS &&
        typeof FOODS === "object"
    )
        ? FOODS
        : DEFAULT_FOODS;
}

function sideDatabase() {
    return (
        typeof SIDES !== "undefined" &&
        SIDES &&
        typeof SIDES === "object"
    )
        ? SIDES
        : DEFAULT_SIDES;
    }


/* =========================================================
   PATIENT HELPERS
   ========================================================= */

function initials(name) {

    if (!name) return "HP";

    return name
        .trim()
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "HP";
}

function hasPatient() {
    return Boolean(
        patient &&
        patient.patientId
    );
}


/* =========================================================
   CALORIE / MACRO GOALS
   ========================================================= */

function calculateGoals(profile) {

    if (!profile) return null;

    const weight = numberValue(profile.weight);
    const height = numberValue(profile.height);
    const age = numberValue(profile.age);

    if (
        weight <= 0 ||
        height <= 0 ||
        age <= 0
    ) {
        return null;
    }

    /*
       Mifflin-St Jeor estimate.
       This is only an approximate wellness calculation.
    */

    const gender = String(
        profile.gender || ""
    ).toLowerCase();

    let bmr;

    if (gender === "female") {
        bmr =
            (10 * weight) +
            (6.25 * height) -
            (5 * age) -
            161;
    } else {
        bmr =
            (10 * weight) +
            (6.25 * height) -
            (5 * age) +
            5;
    }

    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };

    const multiplier =
        multipliers[profile.activityLevel] || 1.2;

    const tdee = Math.round(
        bmr * multiplier
    );

    /*
       HealthPulse uses maintenance-style tracking.
       No automatic aggressive calorie restriction.
    */

    const calories = Math.max(
        1000,
        tdee
    );

    const protein = Math.max(
        1,
        Math.round(weight * 1.2)
    );

    const fat = Math.max(
        1,
        Math.round((calories * 0.27) / 9)
    );

    const carbs = Math.max(
        0,
        Math.round(
            (calories - (protein * 4) - (fat * 9)) / 4
        )
    );

    return {
        bmr: Math.round(bmr),
        tdee,
        cal: Math.round(calories),
        protein,
        carbs,
        fat
    };
}


/* =========================================================
   NUTRITION TOTALS
   ========================================================= */

function nutritionTotals() {

    const meals = dayMeals();

    return meals.reduce(
        (total, meal) => {

            total.cal += numberValue(meal.cal);
            total.protein += numberValue(meal.protein);
            total.carbs += numberValue(meal.carbs);
            total.fat += numberValue(meal.fat);

            return total;

        },
        {
            cal: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        }
    );
}


/* =========================================================
   ACTIVITY CALORIES
   ========================================================= */

function activityCalories(
    activityType,
    minutes
) {

    const MET = {
        walking: 3.3,
        running: 8,
        cycling: 7,
        calisthenics: 6,
        sports: 7,
        other: 4
    };

    const met =
        MET[activityType] || 4;

    const duration =
        numberValue(minutes);

    const weight =
        numberValue(patient?.weight, 60);

    if (
        duration <= 0 ||
        weight <= 0
    ) {
        return 0;
    }

    /*
       Approximate MET calorie equation:
       kcal/min = MET × 3.5 × weight(kg) / 200
    */

    const calories =
        (met * 3.5 * weight / 200) *
        duration;

    return Math.max(
        0,
        Math.round(calories)
    );
}

function activityTotals() {

    return dayActivities().reduce(
        (total, activity) => {

            total.cal += numberValue(
                activity.cal
            );

            total.minutes += numberValue(
                activity.minutes
            );

            return total;

        },
        {
            cal: 0,
            minutes: 0
        }
    );
}


/* =========================================================
   MEAL CALCULATOR
   ========================================================= */

function calculateMeal() {

    const foods = foodDatabase();
    const sides = sideDatabase();

    const total = {
        cal: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    const mainFoodElement =
        $("mainFood");

    const quantityElement =
        $("mainFoodQuantity");

    const foodName =
        mainFoodElement?.value || "";

    const quantity =
        Math.max(
            0,
            numberValue(
                quantityElement?.value,
                1
            )
        );

    const food =
        foods[foodName];

    if (food && quantity > 0) {

        total.cal +=
            numberValue(food.cal) *
            quantity;

        total.protein +=
            numberValue(food.protein) *
            quantity;

        total.carbs +=
            numberValue(food.carbs) *
            quantity;

        total.fat +=
            numberValue(food.fat) *
            quantity;
    }

    document
        .querySelectorAll(".side-row")
        .forEach(row => {

            const select =
                row.querySelector(".side-select");

            const quantityInput =
                row.querySelector(".side-qty");

            const side =
                sides[select?.value];

            const sideQuantity =
                Math.max(
                    0,
                    numberValue(
                        quantityInput?.value,
                        1
                    )
                );

            if (
                side &&
                sideQuantity > 0
            ) {

                total.cal +=
                    numberValue(side.cal) *
                    sideQuantity;

                total.protein +=
                    numberValue(side.protein) *
                    sideQuantity;

                total.carbs +=
                    numberValue(side.carbs) *
                    sideQuantity;

                total.fat +=
                    numberValue(side.fat) *
                    sideQuantity;
            }
        });

    updateMealPreview(total);

    return total;
}

function updateMealPreview(total) {

    const values = {
        mealCal: round(total.cal),
        mealProtein: round(total.protein),
        mealCarbs: round(total.carbs),
        mealFat: round(total.fat)
    };

    Object.entries(values).forEach(
        ([id, value]) => {

            const element = $(id);

            if (element) {
                element.textContent = value;
            }
        }
    );
}


/* =========================================================
   FOOD SELECT
   ========================================================= */

function prettyFoodName(name) {

    return String(name)
        .replaceAll("ChickenBiryani", "Chicken Biryani")
        .replaceAll(/([a-z])([A-Z])/g, "$1 $2");
}

function prettySideName(name) {

    return String(name)
        .replaceAll(/([a-z])([A-Z])/g, "$1 $2");
}

function populateFoodSelect() {

    const select =
        $("mainFood");

    if (!select) return;

    const foods =
        foodDatabase();

    select.innerHTML =
        `<option value="">Select food</option>` +
        Object.keys(foods)
            .map(
                name =>
                    `<option value="${escapeHTML(name)}">
                        ${escapeHTML(prettyFoodName(name))}
                    </option>`
            )
            .join("");

    if ($("mainFoodQuantity")) {
        $("mainFoodQuantity").value = 1;
    }

    const container =
        $("sideDishContainer");

    if (container) {
        container.innerHTML = "";
        addSideDishRow();
    }

    calculateMeal();
}


/* =========================================================
   SIDE DISH
   ========================================================= */

function addSideDishRow() {

    const container =
        $("sideDishContainer");

    if (!container) return;

    const sides =
        sideDatabase();

    const row =
        document.createElement("div");

    row.className = "side-row";

    row.innerHTML = `
        <select class="side-select">
            <option value="">Select side</option>
            ${Object.keys(sides)
                .map(
                    name =>
                        `<option value="${escapeHTML(name)}">
                            ${escapeHTML(prettySideName(name))}
                        </option>`
                )
                .join("")}
        </select>

        <input
            class="side-qty"
            type="number"
            min="0.1"
            step="0.1"
            value="1"
        >

        <button
            type="button"
            class="remove-btn"
            aria-label="Remove side dish"
        >×</button>
    `;

    container.appendChild(row);

    const select =
        row.querySelector(".side-select");

    const quantity =
        row.querySelector(".side-qty");

    const remove =
        row.querySelector(".remove-btn");

    select?.addEventListener(
        "change",
        calculateMeal
    );

    quantity?.addEventListener(
        "input",
        calculateMeal
    );

    remove?.addEventListener(
        "click",
        () => {
            row.remove();
            calculateMeal();
        }
    );
}


/* =========================================================
   NUTRITION UI
   ========================================================= */

function updateNutritionUI() {

    const totals =
        nutritionTotals();

    const fields = {
        nutritionCalories:
            Math.round(totals.cal),

        nutritionProtein:
            `${round(totals.protein)} g`,

        nutritionCarbs:
            `${round(totals.carbs)} g`,

        nutritionFat:
            `${round(totals.fat)} g`
    };

    Object.entries(fields).forEach(
        ([id, value]) => {

            const element = $(id);

            if (element) {
                element.textContent = value;
            }
        }
    );

    const list =
        $("mealList");

    if (!list) return;

    const meals =
        dayMeals();

    if (!meals.length) {

        list.innerHTML =
            `<div class="empty-state">
                No meals logged today.
            </div>`;

        return;
    }

    list.innerHTML =
        meals
            .map(meal => `
                <div class="list-item">

                    <div>
                        <strong>
                            ${escapeHTML(meal.food)}
                        </strong>

                        <small>
                            ${escapeHTML(meal.time || "")}
                            •
                            ${Math.round(numberValue(meal.cal))}
                            kcal
                        </small>
                    </div>

                    <b>
                        ${round(numberValue(meal.protein))}g P
                    </b>

                </div>
            `)
            .join("");
}


/* =========================================================
   ACTIVITY UI
   ========================================================= */

function updateActivityUI() {

    const totals =
        activityTotals();

    const values = {
        activityTotalCalories:
            totals.cal,

        activityTotalMinutes:
            totals.minutes,

        activityEntryCount:
            dayActivities().length
    };

    Object.entries(values).forEach(
        ([id, value]) => {

            const element = $(id);

            if (element) {
                element.textContent = value;
            }
        }
    );

    const list =
        $("activityList");

    if (!list) return;

    const activities =
        dayActivities();

    if (!activities.length) {

        list.innerHTML =
            `<div class="empty-state">
                No activity logged today.
            </div>`;

        return;
    }

    list.innerHTML =
        activities
            .map(activity => `
                <div class="list-item">

                    <div>
                        <strong>
                            ${escapeHTML(
                                String(activity.type || "")
                                    .replaceAll("_", " ")
                            )}
                        </strong>

                        <small>
                            ${numberValue(activity.minutes)}
                            min
                            •
                            ${escapeHTML(activity.time || "")}
                        </small>
                    </div>

                    <b>
                        ${numberValue(activity.cal)}
                        kcal
                    </b>

                </div>
            `)
            .join("");
}


/* =========================================================
   PROGRESS BAR
   ========================================================= */

function setProgress(
    id,
    current,
    target
) {

    const element = $(id);

    if (!element) return;

    const currentValue =
        numberValue(current);

    const targetValue =
        numberValue(target);

    if (targetValue <= 0) {
        element.style.width = "0%";
        return;
    }

    const percent =
        Math.min(
            100,
            Math.max(
                0,
                (currentValue / targetValue) * 100
            )
        );

    element.style.width =
        `${percent}%`;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const nutrition =
        nutritionTotals();

    const activity =
        activityTotals();

    const goals =
        calculateGoals(patient);

    const values = {

        dashboardCaloriesIn:
            Math.round(nutrition.cal),

        dashboardCaloriesOut:
            Math.round(activity.cal),

        energyInLarge:
            `${Math.round(nutrition.cal)} kcal`,

        energyOutLarge:
            `${Math.round(activity.cal)} kcal`,

        dashboardProtein:
            `${round(nutrition.protein)} g`,

        dashboardCarbs:
            `${round(nutrition.carbs)} g`,

        dashboardFat:
            `${round(nutrition.fat)} g`,

        macroProteinLarge:
            `${round(nutrition.protein)} g`,

        macroCarbsLarge:
            `${round(nutrition.carbs)} g`,

        macroFatLarge:
            `${round(nutrition.fat)} g`,

        dashboardActivity:
            `${activity.minutes} min`,

        overviewActivity:
            `${activity.minutes} min`
    };

    Object.entries(values).forEach(
        ([id, value]) => {

            const element = $(id);

            if (element) {
                element.textContent = value;
            }
        }
    );

    const activityText =
        $("overviewActivityText");

    if (activityText) {

        activityText.textContent =
            activity.minutes > 0
                ? `${activity.cal} kcal estimated output today.`
                : "No activity logged today.";
    }

    if (goals) {

        const goalElements = {

            dashboardCalorieGoal:
                `Goal ${goals.cal} kcal`,

            dashboardProteinGoal:
                `Goal ${goals.protein} g`,

            dashboardCarbsGoal:
                `Goal ${goals.carbs} g`,

            dashboardFatGoal:
                `Goal ${goals.fat} g`
        };

        Object.entries(goalElements).forEach(
            ([id, value]) => {

                const element = $(id);

                if (element) {
                    element.textContent = value;
                }
            }
        );

        setProgress(
            "proteinProgress",
            nutrition.protein,
            goals.protein
        );

        setProgress(
            "carbsProgress",
            nutrition.carbs,
            goals.carbs
        );

        setProgress(
            "fatProgress",
            nutrition.fat,
            goals.fat
        );

    } else {

        [
            "dashboardCalorieGoal",
            "dashboardProteinGoal",
            "dashboardCarbsGoal",
            "dashboardFatGoal"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.textContent =
                    id === "dashboardCalorieGoal"
                        ? "Set profile"
                        : "Goal —";
            }
        });

        [
            "proteinProgress",
            "carbsProgress",
            "fatProgress"
        ].forEach(id => {

            const element = $(id);

            if (element) {
                element.style.width = "0%";
            }
        });
    }

    setProgress(
        "activityProgress",
        activity.minutes,
        numberValue(
            patient?.dailyActivityMinutes,
            30
        )
    );

    updateNutritionUI();
    updateActivityUI();
}


/* =========================================================
   PROFILE UI
   ========================================================= */

function fillProfile() {

    if (!patient) return;

    const fields = [
        "name",
        "age",
        "gender",
        "height",
        "weight",
        "dailyActivityMinutes",
        "activityLevel",
        "goal",
        "emergencyContactName",
        "emergencyEmail"
    ];

    fields.forEach(id => {

        const element = $(id);

        if (
            element &&
            patient[id] !== undefined &&
            patient[id] !== null
        ) {
            element.value = patient[id];
        }
    });

    const consent =
        $("consentDoctorMonitoring");

    if (consent) {
        consent.checked =
            Boolean(
                patient.consentDoctorMonitoring
            );
    }

    renderConditions(
        Array.isArray(patient.conditions)
            ? patient.conditions
            : []
    );

    const goals =
        calculateGoals(patient);

    if (goals) {

        const values = {

            profileCalorieGoal:
                goals.cal,

            profileProteinGoal:
                `${goals.protein} g`,

            profileCarbGoal:
                `${goals.carbs} g`,

            profileFatGoal:
                `${goals.fat} g`
        };

        Object.entries(values).forEach(
            ([id, value]) => {

                const element = $(id);

                if (element) {
                    element.textContent = value;
                }
            }
        );
    }
}


/* =========================================================
   CONDITIONS
   ========================================================= */

function renderConditions(values) {

    const container =
        $("conditionsContainer");

    if (!container) return;

    container.innerHTML = "";

    const list =
        values.length
            ? values
            : [""];

    list.forEach(
        value => addConditionRow(value)
    );
}

function addConditionRow(value = "") {

    const container =
        $("conditionsContainer");

    if (!container) return;

    const row =
        document.createElement("div");

    row.className =
        "condition-row";

    row.innerHTML = `
        <select class="condition-select">

            <option value="">
                No condition selected
            </option>

            <option value="Hypertension">
                Hypertension
            </option>

            <option value="Diabetes">
                Diabetes
            </option>

            <option value="Asthma">
                Asthma
            </option>

            <option value="Heart condition">
                Heart condition
            </option>

            <option value="Thyroid disorder">
                Thyroid disorder
            </option>

            <option value="Anemia">
                Anemia
            </option>

            <option value="Kidney condition">
                Kidney condition
            </option>

            <option value="Arthritis">
                Arthritis
            </option>

            <option value="Migraine">
                Migraine
            </option>

            <option value="Other">
                Other
            </option>

        </select>

        <button
            type="button"
            class="remove-condition"
        >
            ×
        </button>
    `;

    container.appendChild(row);

    const select =
        row.querySelector(".condition-select");

    const remove =
        row.querySelector(".remove-condition");

    if (select) {
        select.value = value || "";
    }

    remove?.addEventListener(
        "click",
        () => row.remove()
    );
}


/* =========================================================
   FILL MAIN UI
   ========================================================= */

function fillUI() {

    const patientExists =
        hasPatient();

    const patientId =
        patientExists
            ? patient.patientId
            : "Not created";

    const patientName =
        patient?.name ||
        "New Patient";

    const ids = [
        "sidebarPatientId",
        "dashboardPatientId",
        "doctorPagePatientId",
        "profilePatientId"
    ];

    ids.forEach(id => {

        const element = $(id);

        if (element) {
            element.textContent =
                patientId;
        }
    });

    const nameElements = {
        sidebarPatientName:
            patientName,

        welcomeName:
            patient?.name || "there"
    };

    Object.entries(nameElements).forEach(
        ([id, value]) => {

            const element = $(id);

            if (element) {
                element.textContent =
                    value;
            }
        }
    );

    const avatar =
        $("sidebarAvatar");

    if (avatar) {
        avatar.textContent =
            initials(patient?.name);
    }

    const notice =
        $("profileNotice");

    if (notice) {
        notice.style.display =
            patientExists
                ? "none"
                : "flex";
    }

    const weight =
        $("dashboardWeight");

    if (weight) {

        weight.textContent =
            patient?.weight
                ? `${patient.weight} kg`
                : "—";
    }

    const weightStatus =
        $("weightStatus");

    if (weightStatus) {

        weightStatus.textContent =
            patient?.weight
                ? "Profile weight"
                : "Add profile data";
    }

    const permission =
        $("doctorPermissionStatus");

    if (permission) {

        permission.textContent =
            patient?.consentDoctorMonitoring
                ? "Enabled"
                : "Not enabled";
    }

    const conditions =
        $("dashboardConditions");

    if (conditions) {

        const list =
            Array.isArray(patient?.conditions)
                ? patient.conditions
                : [];

        conditions.innerHTML =
            list.length
                ? list
                    .map(
                        item =>
                            `<span class="condition-chip">
                                ${escapeHTML(item)}
                            </span>`
                    )
                    .join("")
                : `<div class="empty-state">
                        No conditions added.
                   </div>`;
    }

    if (patientExists) {
        fillProfile();
    }

    updateDashboard();
}


/* =========================================================
   LOAD PATIENT
   ========================================================= */

async function loadPatient() {

    const storedId =
        localStorage.getItem(
            LS.patient
        );

    /*
       New user.
       This is completely valid.
    */

    if (!storedId) {

        patient = null;
        measurements = [];
        reminders = [];

        fillUI();

        return;
    }

    try {

        const loaded =
            await api(
                `/patients/${encodeURIComponent(storedId)}`
            );

        if (
            !loaded ||
            !loaded.patientId
        ) {
            throw new Error(
                "Invalid patient data received."
            );
        }

        patient = loaded;

        localStorage.setItem(
            LS.patient,
            patient.patientId
        );

        await Promise.allSettled([
            loadMeasurements(),
            loadReminders()
        ]);

        fillUI();

    } catch (error) {

        console.warn(
            "Patient loading problem:",
            error
        );

        /*
           Do not leave the application unusable.
           The old ID is removed only if the server
           says the patient cannot be loaded.
        */

        patient = null;
        measurements = [];
        reminders = [];

        localStorage.removeItem(
            LS.patient
        );

        fillUI();
    }
}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

async function saveProfile(event) {

    event?.preventDefault();

    const status =
        $("profileSaveStatus");

    const body = {

        name:
            $("name")?.value.trim() || "",

        age:
            numberValue(
                $("age")?.value,
                null
            ),

        gender:
            $("gender")?.value || "",

        height:
            numberValue(
                $("height")?.value,
                null
            ),

        weight:
            numberValue(
                $("weight")?.value,
                null
            ),

        dailyActivityMinutes:
            numberValue(
                $("dailyActivityMinutes")?.value,
                0
            ),

        activityLevel:
            $("activityLevel")?.value ||
            "moderate",

        goal:
            $("goal")?.value ||
            "maintenance",

        conditions:
            Array.from(
                document.querySelectorAll(
                    ".condition-select"
                )
            )
                .map(
                    element =>
                        element.value.trim()
                )
                .filter(Boolean),

        emergencyContactName:
            $("emergencyContactName")
                ?.value.trim() || "",

        emergencyEmail:
            $("emergencyEmail")
                ?.value.trim() || "",

        consentDoctorMonitoring:
            Boolean(
                $("consentDoctorMonitoring")
                    ?.checked
            )
    };

    try {

        if (status) {
            status.textContent =
                "Saving...";
        }

        let savedPatient;

        /*
           IMPORTANT:
           If patient exists, UPDATE it.
           Otherwise CREATE a new patient.

           The Patient ID is NEVER generated
           by the frontend.
        */

        if (
            patient &&
            patient.patientId
        ) {

            savedPatient =
                await api(
                    `/patients/${encodeURIComponent(
                        patient.patientId
                    )}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(body)
                    }
                );

        } else {

            savedPatient =
                await api(
                    "/patients",
                    {
                        method: "POST",
                        body: JSON.stringify(body)
                    }
                );
        }

        if (
            !savedPatient ||
            !savedPatient.patientId
        ) {
            throw new Error(
                "Server did not return a valid Patient ID."
            );
        }

        patient =
            savedPatient;

        /*
           THIS is the important Patient ID fix.
        */

        localStorage.setItem(
            LS.patient,
            patient.patientId
        );

        if (status) {
            status.textContent =
                "Saved ✓";
        }

        fillUI();

        toast(
            `Profile saved • Patient ID: ${patient.patientId}`
        );

    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );

        if (status) {
            status.textContent =
                "Save failed";
        }

        toast(
            error.message ||
            "Unable to save profile.",
            "error"
        );
    }
}


/* =========================================================
   MEASUREMENTS
   ========================================================= */

async function loadMeasurements() {

    if (!hasPatient()) {
        measurements = [];
        return;
    }

    try {

        const data =
            await api(
                `/measurements/${encodeURIComponent(
                    patient.patientId
                )}`
            );

        measurements =
            Array.isArray(data)
                ? data
                : [];

        const sorted =
            measurements
                .slice()
                .sort(
                    (a, b) =>
                        new Date(b.recordedAt) -
                        new Date(a.recordedAt)
                );

        const latest =
            sorted[0];

        if (latest) {

            const updated =
                $("measurementLastUpdated");

            if (updated) {
                updated.textContent =
                    new Date(
                        latest.recordedAt
                    ).toLocaleString();
            }
        }

        const heartRate =
            sorted.find(
                item =>
                    item.type === "heart_rate"
            );

        if (heartRate) {

            const element =
                $("dashboardHeartRate");

            if (element) {
                element.textContent =
                    heartRate.value;
            }
        }

    } catch (error) {

        console.warn(
            "Measurement loading failed:",
            error
        );

        measurements = [];
    }
}


/* =========================================================
   SAVE MEASUREMENTS
   ========================================================= */

async function saveMeasurements() {

    if (!hasPatient()) {

        toast(
            "Create your profile first.",
            "warning"
        );

        return;
    }

    const readings = [];

    function addNumeric(
        inputId,
        type,
        unit
    ) {

        const element =
            $(inputId);

        if (!element) return;

        const value =
            numberValue(
                element.value
            );

        if (value > 0) {

            readings.push({
                patientId:
                    patient.patientId,

                type,

                value,

                unit
            });
        }
    }

    addNumeric(
        "heartRateInput",
        "heart_rate",
        "BPM"
    );

    addNumeric(
        "glucoseInput",
        "glucose",
        "mg/dL"
    );

    addNumeric(
        "spo2Input",
        "spo2",
        "%"
    );

    addNumeric(
        "temperatureInput",
        "temperature",
        "°C"
    );

    addNumeric(
        "measurementWeightInput",
        "weight",
        "kg"
    );

    /*
       IMPORTANT:
       The current server converts req.body.value
       using Number(...).

       Therefore "120/80" would become NaN/null.

       We intentionally store BP as TWO numeric
       measurements instead.
    */

    const systolic =
        numberValue(
            $("bpSystolicInput")?.value
        );

    const diastolic =
        numberValue(
            $("bpDiastolicInput")?.value
        );

    if (systolic > 0) {

        readings.push({
            patientId:
                patient.patientId,

            type:
                "blood_pressure_systolic",

            value:
                systolic,

            unit:
                "mmHg"
        });
    }

    if (diastolic > 0) {

        readings.push({
            patientId:
                patient.patientId,

            type:
                "blood_pressure_diastolic",

            value:
                diastolic,

            unit:
                "mmHg"
        });
    }

    if (!readings.length) {

        toast(
            "Enter at least one health reading.",
            "warning"
        );

        return;
    }

    try {

        for (const reading of readings) {

            await api(
                "/measurements",
                {
                    method: "POST",
                    body: JSON.stringify(reading)
                }
            );
        }

        toast(
            "Health readings saved."
        );

        await loadMeasurements();

        fillUI();

    } catch (error) {

        console.error(
            "Measurement save error:",
            error
        );

        toast(
            error.message ||
            "Unable to save readings.",
            "error"
        );
    }
}


/* =========================================================
   SAVE MEAL
   ========================================================= */

function saveMeal() {

    if (!hasPatient()) {

        toast(
            "Create your profile first.",
            "warning"
        );

        return;
    }

    const totals =
        calculateMeal();

    const food =
        $("mainFood")?.value || "";

    if (!food) {

        toast(
            "Select a food first.",
            "warning"
        );

        return;
    }

    if (
        totals.cal <= 0 &&
        totals.protein <= 0 &&
        totals.carbs <= 0 &&
        totals.fat <= 0
    ) {

        toast(
            "The selected food has no nutrition value.",
            "warning"
        );

        return;
    }

    const item = {

        id:
            Date.now(),

        date:
            today(),

        time:
            nowTime(),

        food:
            food,

        cal:
            round(totals.cal),

        protein:
            round(totals.protein),

        carbs:
            round(totals.carbs),

        fat:
            round(totals.fat)
    };

    const meals =
        getMeals();

    meals.push(item);

    setMeals(meals);

    toast(
        `Meal added • ${Math.round(item.cal)} kcal`
    );

    updateDashboard();
}


/* =========================================================
   SAVE ACTIVITY
   ========================================================= */

function saveActivity() {

    if (!hasPatient()) {

        toast(
            "Create your profile first.",
            "warning"
        );

        return;
    }

    const type =
        $("activityType")?.value ||
        "other";

    const minutes =
        numberValue(
            $("activityMinutes")?.value
        );

    if (minutes <= 0) {

        toast(
            "Enter activity minutes.",
            "warning"
        );

        return;
    }

    const calories =
        activityCalories(
            type,
            minutes
        );

    const item = {

        id:
            Date.now(),

        date:
            today(),

        time:
            nowTime(),

        type,

        minutes,

        cal:
            calories,

        note:
            $("activityNote")
                ?.value.trim() || ""
    };

    const activities =
        getActivities();

    activities.push(item);

    setActivities(
        activities
    );

    const minutesInput =
        $("activityMinutes");

    const noteInput =
        $("activityNote");

    if (minutesInput) {
        minutesInput.value = "";
    }

    if (noteInput) {
        noteInput.value = "";
    }

    toast(
        `Activity logged • ${calories} kcal estimated`
    );

    updateDashboard();
}


/* =========================================================
   MEDICINE REMINDERS
   ========================================================= */

async function loadReminders() {

    if (!hasPatient()) {

        reminders = [];

        renderReminderList();

        return;
    }

    try {

        const data =
            await api(
                `/reminders/${encodeURIComponent(
                    patient.patientId
                )}`
            );

        reminders =
            Array.isArray(data)
                ? data
                : [];

        renderReminderList();

    } catch (error) {

        console.warn(
            "Reminder loading failed:",
            error
        );

        reminders = [];

        renderReminderList();
    }
}

function renderReminderList() {

    const list =
        $("reminderList");

    if (!list) return;

    if (!reminders.length) {

        list.innerHTML =
            `<div class="empty-state">
                No reminders.
            </div>`;

        return;
    }

    list.innerHTML =
        reminders
            .map(reminder => {

                const hour =
                    String(
                        numberValue(
                            reminder.hour
                        )
                    ).padStart(2, "0");

                const minute =
                    String(
                        numberValue(
                            reminder.minute
                        )
                    ).padStart(2, "0");

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
                                    reminder.date ||
                                    "Daily"
                                )}

                                ${hour}:${minute}

                                •

                                ${escapeHTML(
                                    reminder.status ||
                                    "scheduled"
                                )}
                            </small>

                        </div>

                        ${
                            reminder.status !==
                            "acknowledged"

                            ? `
                                <button
                                    class="secondary-button small"
                                    data-ack="${escapeHTML(
                                        reminder.id
                                    )}"
                                >
                                    Acknowledge
                                </button>
                            `
                            : `
                                <span class="status">
                                    Acknowledged
                                </span>
                            `
                        }

                    </div>
                `;
            })
            .join("");

    document
        .querySelectorAll("[data-ack]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    try {

                        await api(
                            `/reminders/${encodeURIComponent(
                                button.dataset.ack
                            )}/acknowledge`,
                            {
                                method: "POST",
                                body: "{}"
                            }
                        );

                        toast(
                            "Reminder acknowledged."
                        );

                        await loadReminders();

                    } catch (error) {

                        toast(
                            error.message ||
                            "Unable to acknowledge reminder.",
                            "error"
                        );
                    }
                }
            );
        });
}

async function saveReminder(event) {

    event?.preventDefault();

    if (!hasPatient()) {

        toast(
            "Create your profile first.",
            "warning"
        );

        return;
    }

    const medicineName =
        $("medicineName")?.value.trim();

    const medicineTime =
        $("medicineTime")?.value;

    if (!medicineName) {

        toast(
            "Enter the medicine name.",
            "warning"
        );

        return;
    }

    if (!medicineTime) {

        toast(
            "Select a reminder time.",
            "warning"
        );

        return;
    }

    const parts =
        medicineTime.split(":");

    const hour =
        numberValue(parts[0]);

    const minute =
        numberValue(parts[1]);

    try {

        await api(
            "/reminders",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        patientId:
                            patient.patientId,

                        medicineName,

                        dosage:
                            $("medicineDosage")
                                ?.value.trim() ||
                            "As prescribed",

                        date:
                            $("medicineDate")
                                ?.value || "",

                        hour,

                        minute,

                        repeat:
                            $("medicineRepeat")
                                ?.value ||
                            "once",

                        graceMinutes:
                            Math.max(
                                1,
                                numberValue(
                                    $("graceMinutes")
                                        ?.value,
                                    30
                                )
                            )
                    })
            }
        );

        toast(
            "Medicine reminder created."
        );

        const form =
            $("reminderForm");

        form?.reset();

        await loadReminders();

    } catch (error) {

        console.error(
            "Reminder error:",
            error
        );

        toast(
            error.message ||
            "Unable to create reminder.",
            "error"
        );
    }
}


/* =========================================================
   DOCTOR ACCESS
   ========================================================= */

async function renderAccessRequests() {

    const list =
        $("accessRequestList");

    if (!list) return;

    if (!hasPatient()) {

        list.innerHTML =
            `<div class="empty-state">
                Create your profile first.
            </div>`;

        return;
    }

    try {

        const requests =
            await api(
                `/access-requests/patient/${encodeURIComponent(
                    patient.patientId
                )}`
            );

        if (
            !Array.isArray(requests) ||
            !requests.length
        ) {

            list.innerHTML =
                `<div class="empty-state">
                    No doctor requests.
                </div>`;

            return;
        }

        list.innerHTML =
            requests
                .map(request => {

                    const id =
                        escapeHTML(
                            request.id
                        );

                    return `
                        <div class="list-item">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        request.doctorName ||
                                        "Doctor"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        request.doctorId ||
                                        "No doctor ID"
                                    )}

                                    •

                                    ${escapeHTML(
                                        request.status ||
                                        "pending"
                                    )}
                                </small>

                            </div>

                            ${
                                request.status ===
                                "pending"

                                ? `
                                    <span>

                                        <button
                                            class="secondary-button small"
                                            data-allow="${id}"
                                        >
                                            Allow
                                        </button>

                                        <button
                                            class="secondary-button small"
                                            data-deny="${id}"
                                        >
                                            Deny
                                        </button>

                                    </span>
                                `
                                : ""
                            }

                        </div>
                    `;
                })
                .join("");

        document
            .querySelectorAll(
                "[data-allow],[data-deny]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const requestId =
                            button.dataset.allow ||
                            button.dataset.deny;

                        const allow =
                            button.hasAttribute(
                                "data-allow"
                            );

                        try {

                            await api(
                                `/access-requests/${encodeURIComponent(
                                    requestId
                                )}/respond`,
                                {
                                    method: "POST",

                                    body:
                                        JSON.stringify({
                                            allow
                                        })
                                }
                            );

                            toast(
                                allow
                                    ? "Doctor access allowed."
                                    : "Doctor request denied."
                            );

                            await renderAccessRequests();

                        } catch (error) {

                            toast(
                                error.message ||
                                "Unable to respond to request.",
                                "error"
                            );
                        }
                    }
                );
            });

    } catch (error) {

        console.warn(
            "Access request loading failed:",
            error
        );

        list.innerHTML =
            `<div class="empty-state">
                Unable to load doctor requests.
            </div>`;
    }
}

async function sendDemoRequest() {

    if (!hasPatient()) {

        toast(
            "Create your profile first.",
            "warning"
        );

        return;
    }

    const doctorName =
        $("demoDoctorName")
            ?.value.trim() ||
        "Demo Doctor";

    const doctorId =
        $("demoDoctorId")
            ?.value.trim() ||
        "DOC-DEMO";

    try {

        await api(
            "/access-requests",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        patientId:
                            patient.patientId,

                        doctorName,

                        doctorId
                    })
            }
        );

        toast(
            "Doctor access request sent."
        );

        await renderAccessRequests();

    } catch (error) {

        toast(
            error.message ||
            "Unable to send doctor request.",
            "error"
        );
    }
}


/* =========================================================
   HEALTH HISTORY
   ========================================================= */

async function renderHistory() {

    const table =
        $("historyTableBody");

    if (!table) return;

    if (!hasPatient()) {

        table.innerHTML =
            `<tr>
                <td colspan="4">
                    Create your profile first.
                </td>
            </tr>`;

        return;
    }

    await loadMeasurements();

    if (!measurements.length) {

        table.innerHTML =
            `<tr>
                <td colspan="4">
                    No readings saved.
                </td>
            </tr>`;

        return;
    }

    const sorted =
        measurements
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.recordedAt) -
                    new Date(a.recordedAt)
            );

    table.innerHTML =
        sorted
            .map(measurement => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                new Date(
                                    measurement.recordedAt
                                ).toLocaleString()
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                String(
                                    measurement.type ||
                                    ""
                                ).replaceAll(
                                    "_",
                                    " "
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                measurement.value
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                measurement.unit ||
                                ""
                            )}
                        </td>

                    </tr>
                `;
            })
            .join("");
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(name) {

  document.querySelectorAll(".page").forEach(page => {

    page.classList.toggle(
      "active",
      page.id === `page-${name}`
    );

  });

  document.querySelectorAll(".nav-button").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === name
    );

  });

  const info = PAGE_INFO[name] || PAGE_INFO.dashboard;

  if ($("pageTitle")) {
    $("pageTitle").textContent = info.title;
  }

  if ($("pageSubtitle")) {
    $("pageSubtitle").textContent = info.subtitle;
  }

  const sidebar = $("sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  if (name === "nutrition") {
    renderNutrition();
  }

  if (name === "activity") {
    renderActivities();
  }

  if (name === "medicine") {
    loadReminders();
  }

  if (name === "history") {
    renderHistory();
  }

  if (name === "doctor") {
    loadAccessRequests();
  }
}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".nav-button").forEach(button => {

    button.addEventListener("click", () => {

      showPage(button.dataset.page);

    });

  });

  const mobileButton = $("mobileMenuButton");

  if (mobileButton) {

    mobileButton.addEventListener("click", () => {

      $("sidebar")?.classList.toggle("open");

    });

  }

});


/* =========================================================
   COPY PATIENT ID
   ========================================================= */

async function copyPatientId() {

    if (!hasPatient()) {

        toast(
            "No Patient ID has been created yet.",
            "warning"
        );

        return;
    }

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                patient.patientId
            );

        } else {

            const temporary =
                document.createElement("textarea");

            temporary.value =
                patient.patientId;

            document.body.appendChild(
                temporary
            );

            temporary.select();

            document.execCommand("copy");

            temporary.remove();
        }

        toast(
            "Patient ID copied."
        );

    } catch (error) {

        console.warn(
            "Copy failed:",
            error
        );

        toast(
            `Patient ID: ${patient.patientId}`
        );
    }
}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

async function checkConnection() {

    const element =
        $("connectionStatus");

    try {

        await api("/health");

        if (element) {
            element.textContent =
                "Connected";
        }

    } catch (_) {

        if (element) {
            element.textContent =
                "Offline";
        }
    }
}


/* =========================================================
   INITIALIZE EVENTS SAFELY
   ========================================================= */

function safeClick(
    id,
    callback
) {

    const element =
        $(id);

    if (!element) return;

    element.addEventListener(
        "click",
        callback
    );
}

function safeInput(
    id,
    callback
) {

    const element =
        $(id);

    if (!element) return;

    element.addEventListener(
        "input",
        callback
    );
}

function safeChange(
    id,
    callback
) {

    const element =
        $(id);

    if (!element) return;

    element.addEventListener(
        "change",
        callback
    );
}


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeHealthPulse() {

    /*
       FIRST:
       Make the page visible immediately.
       This prevents loading-screen lockups.
    */

    finishLoading();

    try {

        /* Current date */

        const currentDate =
            $("currentDate");

        if (currentDate) {

            currentDate.textContent =
                new Date().toLocaleDateString(
                    undefined,
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
        }


        /* Navigation */

        document
            .querySelectorAll(".nav-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.page ||
                            "dashboard"
                        );
                    }
                );
            });


        /* Mobile menu */

        safeClick(
            "mobileMenuButton",
            () => {

                $("sidebar")
                    ?.classList.add("open");

                $("sidebarOverlay")
                    ?.classList.add("visible");
            }
        );

        safeClick(
            "sidebarOverlay",
            () => showPage("dashboard")
        );


        /* Profile buttons */

        safeClick(
            "openProfileButton",
            () => showPage("profile")
        );

        safeClick(
            "openProfileFromDoctorButton",
            () => showPage("profile")
        );


        /* Profile */

        const profileForm =
            $("profileForm");

        if (profileForm) {

            profileForm.addEventListener(
                "submit",
                saveProfile
            );
        }

        safeClick(
            "addConditionButton",
            () => addConditionRow()
        );


        /* Measurements */

        safeClick(
            "saveMeasurementsButton",
            saveMeasurements
        );


        /* Nutrition */

        populateFoodSelect();

        safeChange(
            "mainFood",
            calculateMeal
        );

        safeInput(
            "mainFoodQuantity",
            calculateMeal
        );

        safeClick(
            "addSideDishButton",
            () => {

                addSideDishRow();

                calculateMeal();
            }
        );

        safeClick(
            "saveMealButton",
            saveMeal
        );


        /* Activity */

        safeClick(
            "saveActivityButton",
            saveActivity
        );


        /* Medicine */

        const reminderForm =
            $("reminderForm");

        if (reminderForm) {

            reminderForm.addEventListener(
                "submit",
                saveReminder
            );
        }


        /* History */

        safeClick(
            "refreshHistoryButton",
            renderHistory
        );


        /* Doctor access */

        safeClick(
            "createDemoRequestButton",
            sendDemoRequest
        );


        /* Patient ID */

        safeClick(
            "copyPatientIdButton",
            copyPatientId
        );


        /* Help */

        safeClick(
            "helpButton",
            () => {

                alert(
                    "HealthPulse is an educational health-monitoring prototype. " +
                    "It organizes health information, nutrition tracking, activity tracking, " +
                    "measurements and reminders. It does not diagnose conditions, prescribe " +
                    "medicines, or replace professional medical care."
                );
            }
        );


        /*
           LOAD EXISTING PATIENT.

           This is intentionally awaited AFTER
           the application is already visible.
        */

        await loadPatient();


        /*
           Refresh connection status without
           blocking the dashboard.
        */

        checkConnection();


        /*
           Final UI refresh.
        */

        fillUI();

        updateDashboard();

        calculateMeal();

    } catch (error) {

        /*
           MOST IMPORTANT ERROR PROTECTION.

           Even if an unexpected problem occurs,
           the dashboard stays visible.
        */

        console.error(
            "HealthPulse initialization error:",
            error
        );

        toast(
            "Dashboard loaded with limited features.",
            "warning"
        );

    } finally {

        /*
           NEVER leave loading screen active.
        */

        finishLoading();
    }
}


/* =========================================================
   START APPLICATION
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHealthPulse,
        {
            once: true
        }
    );

} else {

    initializeHealthPulse();

}


/* =========================================================
   GLOBAL ERROR PROTECTION
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "HealthPulse frontend error:",
            event.error || event.message
        );

        finishLoading();
    }
);

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "HealthPulse promise error:",
            event.reason
        );

        finishLoading();
    }
);