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

async function getQuiz({id}) {
  return {
    id,
    questions: [
      {
        title: '1. How foamy are you?',
        answers: [
          {text: 'No foam at all'},
          {text: 'A little bit bubbly'},
          {text: 'I am in the sweet spot'},
          {text: 'Pure goodness'},
        ],
      },
    ]
  }
}

async function recordQuizResult(req) {

}
