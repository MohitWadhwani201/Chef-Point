import fetch from "node-fetch";

const MODEL = "models/gemini-flash-lite-latest";
const AI_TIMEOUT = 12000;
const MAX_RETRIES = 2;

/* ================= RANDOMIZATION ================= */

const STYLES = [
  "Indian home style",
  "Italian rustic",
  "Asian stir fry",
  "Creamy comfort food",
  "Healthy light meal",
  "Street food inspired",
  "Restaurant style"
];

const TECHNIQUES = [
  "pan fry",
  "slow simmer",
  "high heat stir fry",
  "shallow fry",
  "one-pot curry",
  "dry roast then sauce",
  "skillet cooking"
];

const DISH_TYPES = [
  "curry",
  "skillet meal",
  "sautéed main",
  "spiced gravy dish",
  "dry fry with sauce",
  "quick weekday dinner"
];

const randomStyle = () => STYLES[Math.floor(Math.random() * STYLES.length)];
const randomTechnique = () => TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)];
const randomDishType = () => DISH_TYPES[Math.floor(Math.random() * DISH_TYPES.length)];

/* ================= HOME PANTRY ================= */

const COMMON = [
  "oil","salt","pepper","water","butter","milk","cream",
  "garlic","ginger","onion","tomato","green chili",
  "turmeric","cumin","coriander","chili","paprika","garam masala",
  "soy","vinegar","sugar"
];

/* ================= PROMPT ================= */

const SYSTEM_PROMPT = `
You are a professional cookbook author.

STRICT RULES:

Return ONLY JSON.
No markdown.
No commentary.
No explanations.

You MUST generate a DIFFERENT recipe each time.

You may ONLY use:
- Provided ingredients
- Basic home pantry items (oil, salt, onion, garlic, milk, common spices)

DO NOT invent exotic or restaurant ingredients.

Include:
- Real quantities (grams, cups, tsp, tbsp)
- Real timings
- Heat levels
- Clear cooking steps

JSON format ONLY:

{
  "title": "",
  "ingredients": [
    "ingredient with quantity"
  ],
  "steps": [
    "step with timing and heat"
  ]
}
`;

/* ================= HELPERS ================= */

const clean = (t) =>
  t.replace(/```json/g, "").replace(/```/g, "").trim();

const ingredientsAllowed = (generated, input) => {
  const allowed = input.map(i => i.toLowerCase());

  return generated.every(item => {
    const name = item.toLowerCase();

    return (
      allowed.some(a => name.includes(a)) ||
      COMMON.some(c => name.includes(c))
    );
  });
};

const isValid = (r, input) =>
  r &&
  typeof r.title === "string" &&
  Array.isArray(r.ingredients) &&
  Array.isArray(r.steps) &&
  r.ingredients.length >= 4 &&
  r.steps.length >= 4 &&
  ingredientsAllowed(r.ingredients, input);

/* ================= MAIN ================= */

export const generateRecipeFromAI = async (ingredients, retry = 0) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${SYSTEM_PROMPT}

Cuisine style: ${randomStyle()}
Dish type: ${randomDishType()}
Primary cooking technique: ${randomTechnique()}

Ingredients:
${ingredients.join(", ")}
`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 1.1,
            topP: 0.95,
            topK: 64,
            seed: Math.floor(Math.random() * 1_000_000)
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    const raw = await res.text();

    if (!res.ok) {
      console.error("Gemini RAW:", raw);

      if (res.status === 503 && retry < MAX_RETRIES)
        return generateRecipeFromAI(ingredients, retry + 1);

      throw new Error("Gemini API failed");
    }

    const data = JSON.parse(raw);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("RAW AI:", text);

    if (!text) throw new Error("Empty AI response");

    const parsed = JSON.parse(clean(text));

    if (!isValid(parsed, ingredients)) {
      console.error("Rejected ingredients:", parsed.ingredients);
      throw new Error("Invalid ingredient usage");
    }

    return parsed;

  } catch (err) {
    if (err.name === "AbortError") throw new Error("Gemini timeout");
    throw err;
  }
};
