import quizzes from "../../../quizzes";
import bigQuizDB from "../../../quizzes_with_results_and_answers";

export default (req, res) => {
  const featuredQuizzes = quizzes.filter(
    x =>
      [
        "Q16322", // Cryptid
        "Q51805", // Star wars
        "Q236209" // Pokemon species
      ].indexOf(x.id) !== -1
  ).map(addImage);
  const body = {
    featuredQuizzes,
    randomQuizzes: [...quizzes]
      .sort((x, y) => Math.random() - Math.random())
      .slice(0, 10).map(addImage)
  };

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(body));
};

function addImage(quiz) {
  const quizData = bigQuizDB.find((d) => d.id === quiz.id);
  const resultWithImage = quizData.possible_results.find((r) => !!r.image)
  if (resultWithImage) {
    const image = resultWithImage.image;
    return { ...quiz, image };
  }
  return quiz;
}
