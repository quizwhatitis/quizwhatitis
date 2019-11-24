import React from "react";
import Head from "next/head";
import Nav from "../../../components/nav";
import Vote from "../../../components/vote";
import fetch from "isomorphic-unfetch";
import config from "../../../config";
import PersonalityMap from "../../../components/personalitymap";

function QuizResult({ title, extract, imageUrl, traits, otherTitles }) {
  return (
    <div>
      <Head>
        <title>Quiz what it is</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles.css" />
        <Vote />
      </Head>

      <Nav />

      <div className="hero">
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
      </div>
    </div>
  );
}
QuizResult.getInitialProps = async ({ req, query: { id, a }}) => {
  const answers = JSON.parse(new Buffer(a, 'base64').toString())
  const body = JSON.stringify({answers});
  const res = await fetch(`${config.serverUri}/api/quizzes/${id}`, {
    method: "POST",
    body
  })
  return res.json()
};

export default QuizResult;
