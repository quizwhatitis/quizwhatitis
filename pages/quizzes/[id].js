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
        <link rel="stylesheet" href="/styles.css" />
        <Vote />
      </Head>

      <Nav />

      <div className="hero">{children}</div>
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
    const nextQuestion = questions[page + 1];

    return this.setState(
      prevState => {
        return {
          answers: {
            ...prevState.answers,
            [page]: answer
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
      return renderPage(<div>Not found</div>);
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
      return renderPage();
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
                onClick={this.handleAnswer(page, i)}
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
