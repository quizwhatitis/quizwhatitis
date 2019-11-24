import React from "react";
import Head from "next/head";
import Nav from "../../components/nav";
import Vote from "../../components/vote";
import fetch from "isomorphic-unfetch";
import config from "../../config";
import * as seedrandom from "seedrandom";

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

const seedToInt = seed => {
  Number.MAX_SAFE;
  return JSON.stringify(seed)
    .split("")
    .map((x, i) => Math.pow(256, i % 7) * x.charCodeAt(0))
    .reduce((acc, x) => (acc + x) % Number.MAX_SAFE_INTEGER, 0);
};

const dist = (p1, p2) => {
  const x1 = p1.r * Math.cos(p1.theta);
  const y1 = p1.r * Math.sin(p1.theta);
  const x2 = p2.r * Math.cos(p2.theta);
  const y2 = p2.r * Math.sin(p2.theta);
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

class PersonalityMap extends React.Component {
  constructor(props) {
    super(props);
    this.cvsRef = React.createRef();
  }
  render() {
    const { traits, seed } = this.props;
    return (
      <>
        <h2>Your personality map</h2>
        <canvas id="cvs" ref={this.cvsRef} height={600} width={900} />
      </>
    );
  }
  componentDidMount() {
    const { traits, seed, winnerName, otherTitles } = this.props;
    const colors = ["#FF0", "#0FF", "#00F", "#000", "#000", "#F00"];
    const height = 600;
    const width = 600;
    const radius = height / 2 - 45;
    const prng = seedrandom(JSON.stringify(seed));

    const you = {
      theta: prng.quick() * Math.PI * 2,
      r: prng.quick() * radius,
      d: 0
    };
    const [winner, ...otherPoints] = new Array(otherTitles.length + 1)
      .fill(0)
      .map(_ => ({
        theta: prng.quick() * Math.PI * 2,
        r: prng.quick() * radius
      }))
      .map(p => ({ ...p, d: dist(p, you) }))
      .sort((x, y) => x.d - y.d);
    console.log(otherPoints);
    const points = [
      { ...you, color: "red", label: "you" },
      { ...winner, color: "blue", label: winnerName },
      ...otherPoints.map((p, i) => ({ ...p, label: otherTitles[i] }))
    ];

    const ctx = this.cvsRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height + 10);
    ctx.save();

    ctx.translate(200 + width / 2, height / 2);
    //ctx.arc(0, 0, radius, rads(359.1667), rads(180.833));
    const n = traits.length;
    for (let i = 0; i < traits.length; i++) {
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        radius,
        (2 * i * Math.PI) / n,
        (2 * (i + 1) * Math.PI) / n,
        false
      );
      ctx.strokeStyle = colors[i % (colors.length - 1)];
      ctx.lineWidth = "5";
      ctx.stroke();
    }

    for (let i = 0; i < traits.length; i++) {
      ctx.save();
      ctx.font = "24px serif";
      const theta = (2 * (i + 0.5) * Math.PI) / n;
      ctx.textAlign =
        theta < Math.PI / 2 || theta > (3 / 2) * Math.PI ? "left" : "right";
      //ctx.translate(Math.cos(theta), Math.sin(theta));
      ctx.fillText(
        traits[i],
        Math.cos(theta) * (radius + 20),
        Math.sin(theta) * (radius + 20)
      );
      ctx.restore();
    }

    const graphPoint = point => {
      const { theta, r, color } = point;
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        r * Math.cos(theta),
        r * Math.sin(theta),
        5,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = color || "black";
      ctx.fill();
    };

    const drawLabel = point => {
      ctx.save();
      const { theta, r } = point;
      ctx.textAlign = "center";
      //ctx.translate(Math.cos(theta), Math.sin(theta));
      ctx.fillStyle = point.color || "black";
      ctx.font = "12px serif";
      ctx.fillText(point.label, Math.cos(theta) * r, Math.sin(theta) * r - 10);
      ctx.restore();
    };

    for (let i = points.length - 1; i >= 0; i--) {
      graphPoint(points[i]);
      drawLabel(points[i]);
    }
  }
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
            seed="otherTitles"
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
