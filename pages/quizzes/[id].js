import React from 'react'
import Head from 'next/head'
import Nav from '../../components/nav'
import fetch from 'isomorphic-unfetch'
import config from '../../config'

function QuizIntro({ itemName, handleBegin }) {
  return <>
    <h1 className="title">
      Let's see what sort of { itemName } you are!
    </h1>
    <div className="row">
      <a onClick={handleBegin} className="card">
        <h3>Begin!</h3>
      </a>
    </div>
  </>
}

function pickResult(results) {
  const n = results.length;
  const choice = Math.floor(Math.random() * 10000) % n;
  return results[choice].title;
};

function QuizResult({ possible_results, answers }) {
  return <>
    <h1 className="title">
      You are a:
    </h1>
    <div className="row">
        <h2>{pickResult(possible_results)}</h2>
    </div>
    <ul>
      {Object.keys(answers).map((q) => (
        <li key={q}>{q}: {answers[q]}</li>
      ))}
    </ul>
  </>
}

function renderPage(children) {
  return <div>
    <Head>
      <title>Quiz what it is</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Nav />

    <div className="hero">{children}</div>

    {style}
  </div>
}

class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isIntro: true,
      finished: false,
      page: 0,
      answers: {}
    };
  }

  handleBegin = () => {
    this.setState({ isIntro: false })
  };

  handleAnswer = (page, answer) => () => {
    const { questions } = this.props;
    const question = questions[page];
    const nextQuestion = questions[page+1];

    this.setState((prevState) => {
      return {
        answers: {
          ...prevState.answers,
          [question]: answer
        },
        page: page+1,
        finished: !nextQuestion
      }
    });
  };

  render() {
    const { quiz, questions } = this.props;
    const { isIntro, finished, page } = this.state;

    if (!questions) {
      return <div>Not found</div>
    }

    if (isIntro) {
      return renderPage(<QuizIntro {...quiz} handleBegin={this.handleBegin}/>);
    }

    if (finished) {
      return renderPage(<QuizResult {...quiz} answers={this.state.answers} />);
    }

    const question = questions[page];

    return renderPage(
      <div key={question}>
        <h1 className="title">{question}</h1>

        <div className="row">
          <a onClick={this.handleAnswer(page, 'yes')} className="card" key="yes">
            <h3>Yes</h3>
          </a>
          <a onClick={this.handleAnswer(page, 'no')} className="card" key="no">
            <h3>No</h3>
          </a>
        </div>
      </div>
    );
  }
}

Quiz.getInitialProps = async ({ req, query: { id } }) => {
  // we can load stuff from the DB/fs here
  // TODO req doesn't work?
  // const quiz = await getQuiz(req.query)
  // const id = 1;
  // console.log(req);
  const response = await fetch(`${config.serverUri}/api/quizzes/${id}`)
  return response.json();
}

export default Quiz;

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
