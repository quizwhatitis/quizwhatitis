import quizzes from "../../../quizzes_with_results_and_answers";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { intFromSeed, randomSubsetFromList } from "../../../util";
import * as sanitizeHtml from "sanitize-html";

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

const allPersonalityTraits = [
  "agreeableness",
  "conscientiousness",
  "introversion",
  "extraversion",
  "happy-go-luckiness",
  "goodheartedness",
  "commitment",
  "loyalty",
  "ambition",
  "kleptomania",
  "nervousness",
  "empathy",
  "compassion",
  "wisdom",
  "prudence",
  "evil",
  "mischief",
  "relilience",
  "steadfastness",
  "trustworthiness",
  "mercy",
  "religiosity",
  "spirituality",
  "stubbornness",
  "rage",
  "midichlorian count",
  "elitism",
  "intelligence",
  "tomfoolishness",
  "skulduggery",
  "pushoverability",
  "weakness",
  "pure idiocy",
  "snobishness",
  "tastefulness",
  "superficiality"
];

async function recordQuizResult({ body, query: { id } }) {
  const { answers } = JSON.parse(body);
  const choice = intFromSeed(answers);
  const { possible_results } = quizzes.find(q => q.id === id);
  const result = possible_results[choice % possible_results.length];

  const { title } = result;
  console.log(result);
  console.log(title);

  if (title) {
    const wikiData = await (
      await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&titles=${encodeURIComponent(
          title
        )}&exintro=1`
      )
    ).json();

    const { thumbnail } = Object.values(wikiData.query.pages)[0];
    const imageUrl = thumbnail ? thumbnail.source : null;

    const extract = sanitizeHtml(
      Object.values(wikiData.query.pages)[0].extract
    );
    return {
      title,
      imageUrl,
      extract,
      possible_results,
      traits: randomSubsetFromList(possible_results, 6, allPersonalityTraits),
      otherTitles: randomSubsetFromList(
        answers,
        6,
        possible_results
          .map(x => x.title)
          .filter(Boolean)
          .filter(x => x.title !== title)
      )
    };
  }
  return { imageUrl: result.image };
}
