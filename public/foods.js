/* =========================================================
   HEALTHPULSE FOOD DATABASE
   Approximate nutrition values per common serving.
   ========================================================= */

const FOODS = {
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

  Poori: {
    cal: 140,
    protein: 3,
    carbs: 18,
    fat: 6
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

  Orange: {
    cal: 62,
    protein: 1.2,
    carbs: 15,
    fat: 0.2
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

  Curd: {
    cal: 70,
    protein: 4,
    carbs: 5,
    fat: 4
  },

  Paneer: {
    cal: 265,
    protein: 18,
    carbs: 6,
    fat: 20
  },

  Chicken: {
    cal: 239,
    protein: 27,
    carbs: 0,
    fat: 14
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

const SIDES = {
  None: {
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },

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

  Rasam: {
    cal: 35,
    protein: 1.5,
    carbs: 5,
    fat: 0.5
  }
};

const ACTIVITY_METS = {
  walking: 3.5,
  running: 8.0,
  cycling: 7.5,
  calisthenics: 6.0,
  sports: 7.0,
  other: 4.0
};

function nutritionForFood(name) {
  return FOODS[name] || {
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
}

function nutritionForSide(name) {
  return SIDES[name] || {
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
}

function calculateActivityCalories(activity, minutes, weightKg) {
  const met = ACTIVITY_METS[activity] || ACTIVITY_METS.other;
  const minutesNumber = Number(minutes) || 0;
  const weight = Number(weightKg) || 60;

  if (minutesNumber <= 0 || weight <= 0) {
    return 0;
  }

  return Math.round(
    (met * 3.5 * weight / 200) * minutesNumber
  );
}