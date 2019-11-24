const fetch = require("node-fetch");
const { promisify } = require("util");
const { createHash } = require("crypto");
const parseString = promisify(require("xml2js").parseString);
const fs = require("fs");

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
  const result = await fromWikidata(query, `quiz-results-${listID}`);

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
    prettyLog(uri);
    if (uri.split(",").length > 1) {
      prettyLog(uri);
    }
    return uri.split(",")[0];
  });
};

const augmentSubSubclassWithOptions = async subSubclass => {
  return {
    ...subSubclass,
    images: await getImagesOfSubSubclass(subSubclass.id)
  };
};

const intFromSeed = seed => {
  const encoded = JSON.stringify(seed);
  const hash = createHash("md5")
    .update(encoded, "utf8")
    .digest()
    .toString("hex");
  const s = hash.slice(-10);
  return parseInt(s, 16);
};

const subclassQuestions = name => [
  `If you were stuck on a desert island with only one ${name}, which would you pick?`,
  `Pick your favorite ${name}`,
  `Which ${name} do you prefer`,
  `If you were a ${name}, which would you be`,
  `Which ${name} matches your energy`,
  `Stare deeply into each ${name}. Pick the one that speaks to you.`,
  `If you could spend an entire day with one ${name}, which would you pick?`,
  `If you could force everybody in the world to study one ${name}, which would you pick?`
];
const pickYourFavoriteSubclassQuestion = (subclassImages, seed) => {
  const i = intFromSeed(seed) % (subclassImages.length - 1);
  const name = subclassImages[i].subSubclassName;

  const images = [...subclassImages[i].images].sort((x, y) => {
    return (
      intFromSeed(JSON.stringify(seed) + x) <
      intFromSeed(JSON.stringify(seed) + y)
    );
  });

  if (subclassImages[i].images.length === 1) {
    return generateYesOrNoQuestion(subclassImages[i].images[0], seed);
  }

  return {
    instructions: randomFromList(seed, subclassQuestions(name)),
    options: subclassImages[i].images.map(x => ({ image: x })).slice(0, 6)
  };
};

const randomFromList = (seed, list) => {
  if (list.length === 1) {
    return list[0];
  }
  return list[intFromSeed(seed) % (list.length - 1)];
};

const yesOrNoOptionses = [
  ["yes", "no"],
  ["yes", "no"],
  ["yes", "no"],
  ["yes", "no"],
  ["yes", "no", "I don't know"],
  ["yes", "no", "decline to answer"],
  ["yes", "no", "I plead the fifth"],
  ["yes", "I plead the fifth"],
  ["yes", "no", "absolutely yes"],
  [
    "yes",
    "absolutely yes",
    "even more yes",
    "there's not enough yes in the world for how yes this is",
    "no, why would you even think that? What kind of personality quiz is this anyway?"
  ],
  ["Indeed, yes", "no, are you crazy???!?"],
  ["yes, I'm afraid", "no"],
  ["no, are you crazy?", "alas, yes"],
  [("regrettably no", "yes, it appears")]
];
const yesOrNoImageQuestions = [
  "Is this a sandwich?",
  "Do you consider this a sandwich?",
  "Would you eat this if I paid you a million dollars?",
  "Would the world be a better place without this?",
  "Would you wear this out on a date?",
  "Does this remind you of someone?",
  "Does this invoke cherished memories?",
  "Do you want more of things like this in your life?"
];

const randomImage = (subclassImages, seed) =>
  randomFromList(
    seed,
    subclassImages.reduce((acc, x) => {
      return [...acc, x.images];
    }, [])
  );

const generateYesOrNoQuestion = (questionImage, seed) => {
  return {
    instructions: randomFromList(seed, yesOrNoImageQuestions),
    questionImage,
    options: randomFromList(seed, yesOrNoOptionses).map(x => ({ label: x }))
  };
};

const generateRandomQuestion = (subclassImages, seed) => {
  const r = (intFromSeed(seed) / 100) % 1;
  if (r < 0.1) {
    return generateYesOrNoQuestion(randomImage(subclassImages, seed), seed);
  }
  return pickYourFavoriteSubclassQuestion(subclassImages, seed);
};

const main = async () => {
  const action = process.argv[2];
  const sources = process.argv.slice(3);

  if (action === "quizzes") {
    prettyPrint(await fetchQuizList());
  }
  if (action === "quizzes_with_results") {
    const [quizzesPath] = sources;
    const quizzes = JSON.parse(fs.readFileSync(quizzesPath));

    prettyPrint(await Promise.all(quizzes.map(augmentQuizWithResults)));
  }
  if (action === "subclass_images") {
    const ANIMAL = "Q729";
    const FOOD = "Q2095";

    const subclasses = [
      ...(await fetchSubSubclasses(ANIMAL, "animal")),
      ...(await fetchSubSubclasses(FOOD, "food"))
    ];
    prettyPrint(
      await Promise.all(subclasses.map(augmentSubSubclassWithOptions))
    );
  }
  if (action === "quizzes_with_results_and_answers") {
    const [quizzesWithResultsPath, subclassImagesPath] = sources;
    const quizzes = JSON.parse(fs.readFileSync(quizzesWithResultsPath));
    const subclassImages = JSON.parse(fs.readFileSync(subclassImagesPath));
    prettyPrint(
      quizzes.map(quiz => ({
        ...quiz,
        questions: new Array(5)
          .fill(0)
          .map(_ => generateRandomQuestion(subclassImages, Math.random()))
      }))
    );
  }
};

main()
  .then()
  .catch(e => {
    console.error(e);
  });
