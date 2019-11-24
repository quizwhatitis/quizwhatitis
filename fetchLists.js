const fetch = require("node-fetch");
const { promisify } = require("util");
const parseString = promisify(require("xml2js").parseString);
const fs = require("fs");

const action = process.argv[2];

const prettyPrint = x => console.log(JSON.stringify(x, null, 2));
const prettyLog = x => console.error(JSON.stringify(x, null, 2));

const withCache = async (name, fetchText) => {
  try {
    return fs.readFileSync(name).toString();
  } catch (e) {
    console.error(`could not find cache in ${name}, sending query`);
    const res = await fetchText();
    fs.writeFileSync(name, res);
    return res;
  }
};

const fromWikidata = async (query, cache) => {
  const f = async () => {
    return await (
      await fetch(
        "https://query.wikidata.org/sparql?query=" + encodeURIComponent(query)
      )
    ).text();
  };

  const text = cache ? await withCache(cache, f) : await f();
  return await parseString(text);
};

const idFromURI = uri => uri.split("/").slice(-1)[0];

const fetchPossibleQuizResults = async listID => {
  const query = `
SELECT distinct ?listItem ?listItemLabel ?image {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  ?listItem wdt:P31 ?y.
  ?y wdt:P910 ?z.
  ?z wdt:P1753 wd:${listID}.
  OPTIONAL {?listItem wdt:P18 ?image}
}
LIMIT 1000
`;
  const result = await fromWikidata(query);

  const results = result.sparql.results.reduce((acc, r) => {
    return [...acc, ...r.result];
  }, []);
  const list = results.map(x => {
    const uri = x.binding.filter(y => y["uri"])[0].uri[0];
    const title = x.binding.filter(y => y["literal"])[0].literal[0]["_"];
    const image = x.binding
      .filter(y => y["$"].name === "image")
      .map(y => y.uri[0])[0];
    return { uri, title, image, id: idFromURI(uri) };
  });
  return list;
};

const augmentQuizWithResults = async quiz => {
  return { ...quiz, possible_results: await fetchPossibleQuizResults(quiz.id) };
};

const fetchQuizList = async () => {
  const query = `
SELECT distinct ?list ?listLabel ?itemName ?itemNameLabel {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  # ?listArticle wdt:P31 wd:Q13406463.
  # ?listArticle wdt:P3921 ?sparql.
  ?listItem wdt:P31 ?y.
  ?y wdt:P910 ?z.
  ?z wdt:P1753 ?list.
  ?list wdt:P360 ?itemName.
 }
LIMIT 1000
`;
  const json = await fromWikidata(query, "allLists.xml");

  const results = json.sparql.results.reduce((acc, r) => {
    return [...acc, ...r.result];
  }, []);

  return results
    .map(x => {
      const uri = x.binding.filter(y => y["uri"])[0].uri[0];
      const title = x.binding.filter(y => y["literal"])[0].literal[0]["_"];
      const itemName = x.binding.filter(y => y["$"].name === "itemNameLabel")[0]
        .literal[0]["_"];
      return { uri, title, itemName, id: idFromURI(uri) };
    })
    .filter(
      x =>
        x.title &&
        (x.title.indexOf("List") !== -1 || x.title.indexOf("list") !== -1)
    );
};

const main = async () => {
  if (action === "quizzes") {
    prettyPrint(await fetchQuizList());
  }
  if (action === "quizzeswithpossibleresults") {
    const quizzes = JSON.parse(fs.readFileSync("littlequizzes.json"));

    prettyPrint(await Promise.all(quizzes.map(augmentQuizWithResults)));
  }
};

main()
  .then()
  .catch(e => {
    console.error(e);
  });
