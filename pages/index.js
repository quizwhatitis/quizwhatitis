import React from "react";
import Head from "next/head";
import Nav from "../components/nav";
import fetch from "isomorphic-unfetch";

function Home({ quizzes }) {
  const quizLinks = quizzes.map(({ title, id }) => (
    <li key={id}>
      <a href={getQuizUri({ id })}>{getQuizName({ title })}</a>
    </li>
  ));

  return (
    <div>
      <Head>
        <title>Quiz what it is</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          src="http://www.nodeknockout.com/entries/40-twisted-ankle/vote.js"
          type="text/javascript"
        ></script>
      </Head>

      <Nav />

      <div className="hero">
        <h1 className="title">Quiz what it is</h1>
        <p className="description">Personality quizzes for everything!</p>

        <div className="row">
          <ul>{quizLinks}</ul>
        </div>
      </div>

      {style}
    </div>
  );
}

Home.getInitialProps = async ({ req }) => {
  // we can load stuff from the DB/fs here
  const response = await fetch(`http://localhost:3000/api/quizzes`);
  return response.json();
};

function getQuizUri({ id }) {
  return "./quizzes/" + id;
}

const listPrefix = "list of";
const pluralSuffix = "s";
function getQuizName({ title }) {
  title = title.toLowerCase();

  if (title.startsWith(listPrefix)) {
    title = title.slice(listPrefix.length + 1);
  }

  if (title.endsWith(pluralSuffix)) {
    title = title.slice(0, -pluralSuffix.length);
  }

  return `What ${title} are you?`;
}

export default Home;

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
);
