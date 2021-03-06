import React from "react";
import Head from "next/head";
import Nav from "../components/nav";
import fetch from "isomorphic-unfetch";
import config from '../config'
import colors from '../colors'
import {singular} from 'pluralize'

function quizStyle(image) {
  const url = image || 'http://placekitten.com/200/300';
  return {
    backgroundImage: `url('${url}')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat'
  };
}

function Home({ featuredQuizzes, randomQuizzes }) {
  const chunkList = (list, chunkSize) => {
      const ret = []
      const l = [...list]
      while (l.length) {
          ret.push(l.splice(0, chunkSize))
      }
      return ret
  }
  const quizLinks = (quizzes) => chunkList(quizzes, 3).map(chunk => {
      return (
        <div className="row">{
          chunk.map(({ title, id, image }) => (
            <a
              href={getQuizUri({ id })}
              className='card'
            ><div>
              <div className='top'>
                <img src={image} />
              </div>
              <div className='bottom'>
                <h3>{getQuizName({id, title})}</h3>
              </div>
            </div></a>
          ))
        }</div>
  )
  })


  const featuredQuizLinks = quizLinks(featuredQuizzes)
  const randomQuizLinks = quizLinks(randomQuizzes)

  return (
    <div>
      <Head>
        <title>Quiz what it is</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css?family=B612&display=swap" rel="stylesheet" />
      </Head>

      <Nav />

      <div className="hero">
        <h1 className="title">Quiz what it is</h1>
        <p className="description">Reach a deeper understanding of your true self, through our thousands of personality quizzes.</p>
      </div>
      <h2>Featured Quizzes</h2>
       {featuredQuizLinks}
      <h2>Random Quizzes</h2>
       {randomQuizLinks}
      {style}
    </div>
  );
}

Home.getInitialProps = async (opts) => {
  const response = await fetch(`${config.serverUri}/api/quizzes`);
  return response.json();
};

function getQuizUri({ id }) {
  return "/quizzes/" + id;
}

function relationship(id) {
  const r = [
    'are you',
    'best describes you',
    'really GETS you',
    'speaks to you',
    'knows where you\'re coming from',
    'has seen what you\'ve seen',
    'is your spirit animal',
    'has really like been there, ya\'know',
    'best matches your personality',
  ];
  return r[parseInt(id.substring(1)) % r.length];
}

function getQuizName({ id, title }) {
  title = title
    .replace(/list of /i, "")
    .replace(/lists of /i, "");

  const lastIndexOfBy = title.lastIndexOf(' by ');
  if (lastIndexOfBy !== -1) title = title.slice(0, lastIndexOfBy);

  title = title.replace(/ and /i, " or ");

  title = title
    .split(" ")
    .map((word, _, {length}) => {
      if (word.match(/^[A-Z]/) && length > 1) return word;
      return singular(word)
    })
    .join(" ");

  return `What ${title} ${relationship(id)}?`;
}

export default Home;

const style = (
  <style>{`
  body {
    background-color: ${colors.backgroundColor};
    font-family: 'B612', sans-serif;
  }
.hero {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: ${colors.textColor};
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
  margin: 0 auto 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.card {
  width: 220px;
  text-align: left;
  text-decoration: none;
  border: 2px solid #9b9b9b;
  border-radius: 5px;
}
.card > * {
  text-align: center;
}

.card .top {
  height: 125px;
  background-color: ${colors.backgroundImageColor};
}

.card .top img {
  padding-top: 10px;
  padding-bottom: 10px;
  max-width: 80%;
  max-height: 80%;
}

.card .bottom {
  padding: 5px;
  border-top: 1px solid #9b9b9b;
  height: 60px;
  line-height: 80px;
  background-color: ${colors.backgroundTextColor};
}

.card .bottom h3 {
  display: inline-block;
  line-height: normal;
}

.card:hover {
  border-color: #067df7;
}
.card h3 {
  margin: 0;
  color: ${colors.textColor};
  font-size: 16px;
}

/* Smartphones (portrait) ----------- */
@media only screen and (max-width : 400px) {
  .card {
    width: 100px;
  }

  .card .top {
    height: 75px;
  }

  .card h3 {
    font-size: 10px !important;
  }
}

.card p {
  margin: 0;
  padding: 12px 0 0;
  font-size: 13px;
  color: #333;
}
h2 {

text-align: center;
}
`}</style>
);
