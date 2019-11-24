import quizzes from '../../../littlequizzes'

export default (req, res) => {
  // TODO: return a list of quizzes here
  const body = {
    quizzes: quizzes.map(({title, uri}) => ({
      id: uri.split('/').pop(),
      uri,
      title,
    }))
  }

  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(body))
}
