import quizzes from "../../../quizzes_with_results_and_answers";
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

  return { quiz, questions: quiz.questions };
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
