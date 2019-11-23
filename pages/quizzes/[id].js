import React from 'react'
import Head from 'next/head'
import Nav from '../../components/nav'

function Quiz ({questions}) {
  const {title, answers} = questions[0]

  const answerCards = answers.map(({text}, id) =>
  <a href={"#" + id} className="card" key={id}>
    <h3>{text}</h3>
  </a>)

  return <div>
    <Head>
      <title>Quiz what it is</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Nav />

    <div className="hero">
      <h1 className="title">{title}</h1>

      <div className="row">
        {answerCards}
      </div>
    </div>

    {style}
  </div>
}

Quiz.getInitialProps = async ({ req }) => {
  // we can load stuff from the DB/fs here
  // TODO req doesn't work?
  // const quiz = await getQuiz(req.query)
  const quiz = await getQuiz({})
  return quiz
}

export default Quiz;

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

const style = <style>{`
.hero {
  width: 100%;
  color: #333;
}
.title {
  margin: 0;
  width: 100%;
  padding-top: 80px;
  line-height: 1.15;
  font-size: 48px;
}
.title,
.description {
  text-align: center;
}
.row {
  max-width: 880px;
  margin: 80px auto 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.card {
  padding: 18px 18px 24px;
  width: 220px;
  text-align: left;
  text-decoration: none;
  color: #434343;
  border: 1px solid #9b9b9b;
}
.card:hover {
  border-color: #067df7;
}
.card h3 {
  margin: 0;
  color: #067df7;
  font-size: 18px;
}
.card p {
  margin: 0;
  padding: 12px 0 0;
  font-size: 13px;
  color: #333;
}
`}</style>
