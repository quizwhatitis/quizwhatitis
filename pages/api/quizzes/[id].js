export default (req, res) => {
  let body

  if (req.method === 'POST') {
    // TODO: save the quiz results here
    body = { answer: 'Nextjs' }
  }
  else {
    // TODO: return the quiz questions here
    body = {
      id: req.query.id,
      questions: [
        {
          text: '1. How foamy are you?',
          answers: [
            {text: 'No foam at all'},
            {text: 'A little bit of bubbles'},
            {text: 'I am in the sweet spot'},
            {text: 'Pure foam'},
          ],
        },
      ]
    }
  }

  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(body))
}
