import React from "react";
import Head from "next/head";
import Nav from "../../components/nav";
import Vote from "../../components/vote";
import fetch from "isomorphic-unfetch";
import config from "../../config";
import PersonalityMap from "../../components/personalitymap";

function QuizIntro({ itemName, handleBegin }) {
  return (
    <>
      <h1 className="title">Let's see what sort of {itemName} you are!</h1>
      <div className="row">
        <a onClick={handleBegin} className="card">
          <h3>Begin!</h3>
        </a>
      </div>
    </>
  );
}

function QuizResult({
  result: { title, extract, imageUrl, traits, otherTitles },
  answers
}) {
  return (
    <>
      {title ? (
        <>
          <h1 className="title">
            Congratulations! You have the personality of {title}
          </h1>
          <div dangerouslySetInnerHTML={{ __html: extract }} />
          {imageUrl ? <img src={imageUrl} width="400" /> : null}
          <PersonalityMap
            traits={traits}
            winnerName={title}
            otherTitles={otherTitles}
            seed={otherTitles}
          />
        </>
      ) : (
        <>
          <h1 className="title">
            Congratulations! Here is a picture of your personality:
          </h1>
          {imageUrl ? <img src={imageUrl} width="400" /> : null}
        </>
      )}
    </>
  );
}

function renderPage(children) {
  return (
    <div>
      <Head>
        <title>Quiz what it is</title>
        <link rel="icon" href="/favicon.ico" />
        <Vote />
      </Head>

      <Nav />

      <div className="hero">{children}</div>

      {style}
    </div>
  );
}

class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isIntro: true,
      result: null,
      page: 0,
      answers: {}
    };
  }

  handleBegin = () => {
    this.setState({ isIntro: false });
  };

  handleAnswer = (page, answer) => () => {
    const {
      quiz: { id },
      questions
    } = this.props;
    const question = questions[page];
    const nextQuestion = questions[page + 1];

    return this.setState(
      prevState => {
        return {
          answers: {
            ...prevState.answers,
            [question]: answer
          },
          page: page + 1
        };
      },
      async () => {
        if (nextQuestion) return;
        const { answers } = this.state;
        const body = JSON.stringify({ answers });
        const res = await fetch(`${config.serverUri}/api/quizzes/${id}`, {
          method: "POST",
          body
        });
        const result = await res.json();
        this.setState({ result });
      }
    );
  };

  render() {
    const { quiz, questions } = this.props;
    const { isIntro, result, page } = this.state;

    if (!questions) {
      return <div>Not found</div>;
    }

    if (isIntro) {
      return renderPage(<QuizIntro {...quiz} handleBegin={this.handleBegin} />);
    }

    if (result) {
      return renderPage(
        <QuizResult {...quiz} result={result} answers={this.state.answers} />
      );
    }

    const question = questions[page];

    if (!question) {
      return null;
    }

    return renderPage(
      <div key={question}>
        <h1 className="title">{question.instructions}</h1>
        <div className="questionImageDiv">
          {question.questionImage ? (
            <img src={question.questionImage} className="questionImage" />
          ) : null}
        </div>

        <div className="row">
          {question.options.map((option, i) => {
            return (
              <a
                onClick={this.handleAnswer(page, option.label)}
                className="card"
                key={`${i}`}
              >
                {option.image ? (
                  <img src={option.image} className="cardImage" />
                ) : (
                  <h3>{option.label}</h3>
                )}
              </a>
            );
          })}
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
  const response = await fetch(`${config.serverUri}/api/quizzes/${id}`);
  return response.json();
};

export default Quiz;

const style = (
  <style>{`
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
  padding: 18px;
  width: 250px;
  text-align: center;
  text-decoration: none;
  color: #434343;
  border: 1px solid #9b9b9b;
}
.cardImage {
width: 240px; margin: auto;
}
.card:hover {
  border-color: #067df7;
  filter: invert(30%);
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
.questionImageDiv {
text-align: center;
}
.questionImage{
width: 400px;
}
`}</style>
);
