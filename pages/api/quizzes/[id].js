import quizzes from "../../../quizzes_with_results_and_answers";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { intFromSeed } from "../../../util";

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
  const choice = intFromSeed(answers);
  const { possible_results } = quizzes.find(q => q.id === id);
  const result = possible_results[choice % possible_results.length];

  const { title } = result;
  console.log(possible_results);
  console.log(result);
  console.log(title);

  const wikiData = await (
    await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&titles=${encodeURIComponent(
        title
      )}&exintro=1`
    )
  ).json();

  const { thumbnail } = Object.values(wikiData.query.pages)[0];
  const imageUrl = thumbnail ? thumbnail.source : null;

  const extract = Object.values(wikiData.query.pages)[0].extract;
  return { title, imageUrl, extract };
}
