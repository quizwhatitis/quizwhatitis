import quizzes from "../../../littlequizzeswithpossibleresults";
import pickyourfavorite from "../../../pickyourfavorite";
import { createHash } from "crypto";
import { readFileSync } from "fs";

export default async (req, res) => {
  let body;
  if (req.method === "POST") {
    body = await recordQuizResult(req);
  } else {
    body = await getQuiz(req);
  }

  // TODO: save the quiz results here
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(body));
  return;
};

async function getQuiz({ query: { id } }) {
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) {
    return {};
  }

  const questions = await getQuestions(id);
  return { quiz, questions };
}

const pickYourFavoriteToQuestion = x => ({
  instructions: `Pick your favorite ${x.subSubclassName}`,
  options: x.images.map(x => ({ image: x })).slice(0, 6)
});
async function getQuestions(id) {
  return [
    pickYourFavoriteToQuestion(pickyourfavorite[19]),
    {
      instructions: "Waffles?",
      options: [{ label: "yes" }, { label: "no" }]
    },
    { instructions: "Space?", options: [{ label: "yes" }, { label: "no" }] },
    { instructions: "Tall?", options: [{ label: "yes" }, { label: "no" }] },
    {
      instructions: "Would Hulk beat Thor?",
      options: [{ label: "yes" }, { label: "no" }]
    }
  ];
}

async function recordQuizResult({ body, query: { id } }) {
  const { answers } = JSON.parse(body);
  const choice = answersAsInteger(answers);
  const { possible_results } = quizzes.find(q => q.id === id);
  const result = possible_results[choice % possible_results.length].title;
  return { result };
}

function answersAsInteger(answers) {
  const encoded = JSON.stringify(answers);
  const hash = createHash("md5")
    .update(encoded, "utf8")
    .digest()
    .toString("hex");
  const s = hash.slice(-10);
  return parseInt(s, 16);
}
