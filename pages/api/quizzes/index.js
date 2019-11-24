import quizzes from "../../../quizzes";

export default (req, res) => {
  const featuredQuizzes = quizzes.filter(
    x =>
      [
        "Q16322", // Cryptid
        "Q51805", // Star wars
        "Q236209" // Pokemon species
      ].indexOf(x.id) !== -1
  );
  const body = {
    featuredQuizzes,
    randomQuizzes: [...quizzes]
      .sort((x, y) => Math.random() - Math.random())
      .slice(0, 10)
  };

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(body));
};
