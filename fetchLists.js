const fetch = require("node-fetch");
const { promisify } = require("util");
const parseString = promisify(require("xml2js").parseString);
const fs = require("fs");

const action = process.argv[2];

const prettyPrint = x => console.log(JSON.stringify(x, null, 2));
const prettyLog = x => console.error(JSON.stringify(x, null, 2));

const withCache = async (name, fetchText) => {
  const path = `cache/${name}`;
  try {
    return fs.readFileSync(path).toString();
  } catch (e) {
    console.error(`could not find cache in ${path}, sending query`);
    const res = await fetchText();
    await parseString(res);
    fs.writeFileSync(path, res);
    return res;
  }
};

const fromWikidata = async (query, cache) => {
  const f = async () => {
    const text = await (
      await fetch(
        "https://query.wikidata.org/sparql?query=" + encodeURIComponent(query)
      )
    ).text();
    if (text === "Rate limit exceeded") {
      throw new Error(`${text} ${query}`);
    }
    return text;
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

const fetchSubSubclasses = async (classId, superclass) => {
  const query = `
SELECT distinct ?subSubclassLabel ?subSubclass {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    ?subclass wdt:P279 wd:${classId}.
    ?subSubclass wdt:P279 ?subclass.
    ?instance wdt:P31 ?subSubclass.
    ?instance wdt:P18 ?image.
 }
LIMIT 1000
`;
  const json = await fromWikidata(query, `subclasses-${classId}.xml`);

  const results = json.sparql.results.reduce((acc, r) => {
    return [...acc, ...r.result];
  }, []);

  return results.map(x => {
    const uri = x.binding.filter(y => y["$"].name === "subSubclass")[0].uri[0];
    const subSubclassName = x.binding.filter(
      y => y["$"].name === "subSubclassLabel"
    )[0].literal[0]["_"];
    return { uri, subSubclassName, id: idFromURI(uri), superclass };
  });
};

const getImagesOfSubSubclass = async subSubclassId => {
  const query = `
SELECT distinct ?image {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    ?instance wdt:P31 wd:${subSubclassId}.
    ?instance wdt:P18 ?image.
 }
LIMIT 1000
`;
  const json = await fromWikidata(query, `imagesof-${subSubclassId}.xml`);

  const results = json.sparql.results.reduce((acc, r) => {
    return [...acc, ...r.result];
  }, []);

  return results.map(x => {
    const uri = x.binding.filter(y => y["uri"])[0].uri[0];
    return uri;
  });
};

const augmentSubSubclassWithOptions = async subSubclass => {
  return {
    ...subSubclass,
    images: await getImagesOfSubSubclass(subSubclass.id)
  };
};

const main = async () => {
  if (action === "quizzes") {
    prettyPrint(await fetchQuizList());
  }
  if (action === "quizzeswithpossibleresults") {
    const quizzes = JSON.parse(fs.readFileSync("littlequizzes.json"));

    prettyPrint(await Promise.all(quizzes.map(augmentQuizWithResults)));
  }
  if (action === "pickyourfavorite") {
    const ANIMAL = "Q729";
    const FOOD = "Q2095";

    const subclasses = [
      ...(await fetchSubSubclasses(ANIMAL, "animal")),
      ...(await fetchSubSubclasses(FOOD, "food"))
    ];
    prettyPrint(
      await Promise.all(subclasses.map(augmentSubSubclassWithOptions))
    );

    //prettyPrint(await fetchAnimalImages());
  }
};

main()
  .then()
  .catch(e => {
    console.error(e);
  });
