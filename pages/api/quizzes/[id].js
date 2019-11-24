import quizzes from '../../../littlequizzeswithpossibleresults'

export default async (req, res) => {
  let body
  if (req.method === 'POST') {
    body = await recordQuizResult(req)
  } else {
    body = await getQuiz(req)
  }

  // TODO: save the quiz results here
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(body))
  return
}

async function getQuiz({query: { id }}) {
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) {
    return {};
  }

  const questions = await getQuestions(id);
  return { quiz, questions }
}

async function getQuestions(id) {
  return [
    'Faster than a speeding train?',
    'Waffles?',
    'Space?',
    'Tall?',
    'Would Hulk beat Thor?'
  ];
}

async function recordQuizResult({query: { id, answers }}) {
  console.log('sgsdlfsdfljkxd', id, answers);
  const { possible_results } = quizzes.find(q => q.id === id);
  const n = possible_results.length;
  const choice = Math.floor(Math.random() * 10000) % n;
  const result = possible_results[choice].title
  return { result };
}
