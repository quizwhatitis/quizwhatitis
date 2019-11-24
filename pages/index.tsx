import React from "react";
import Head from "next/head";
import Nav from "../components/nav";
import Vote from "../components/vote";
import fetch from "isomorphic-unfetch";
import config from '../config'
import {singular} from 'pluralize'

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
          chunk.map(({ title, id }) => (
            <a
              href={getQuizUri({ id })} className='card'
            ><h3>{getQuizName({ title })}</h3></a>
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
        <Vote/>
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

function getQuizName({ title }) {
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

  return `What ${title} are you?`;
}

export default Home;

const style = (
  <style>{`
.hero {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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
  margin: 0 auto 40px;
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
h2 {

text-align: center;
}
`}</style>
);
