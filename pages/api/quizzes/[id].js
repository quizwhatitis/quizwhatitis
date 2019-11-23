export default async (req, res) => {
  if (req.method === 'POST') {
    // TODO: save the quiz results here
    const body = { answer: 'Soup bar' }
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(body))
    return;
  }
}
