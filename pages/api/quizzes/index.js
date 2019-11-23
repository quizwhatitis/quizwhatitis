export default (req, res) => {
  // TODO: return a list of quizzes here
  const body = {
    quizzes: [
      {
        id: 1,
        displayName: 'What brand of soup are you?',
      },
    ]
  };

  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(body))
}
