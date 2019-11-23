const fetch = require("node-fetch");
const { promisify } = require("util");
const parseString = promisify(require("xml2js").parseString);

const query = `
SELECT ?Wikimedia_list_article ?Wikimedia_list_articleLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  OPTIONAL {  }
  ?Wikimedia_list_article wdt:P31 wd:Q13406463.
}
`;

const main = async () => {
  const response = await fetch(
    "https://query.wikidata.org/sparql?query=" + encodeURIComponent(query)
  );
  const result = await parseString(await response.text());

  const results = result.sparql.results.reduce((acc, r) => {
    return [...acc, ...r.result];
  }, []);
  const list = results
    .map(x => {
      const uri = x.binding.filter(y => y["uri"])[0].uri[0];
      const title = x.binding.filter(y => y["literal"])[0].literal[0]["_"];
      return { uri, title };
    })
    .filter(
      x =>
        x.title &&
        (x.title.indexOf("List") !== -1 || x.title.indexOf("list") !== -1)
    );
  console.log(JSON.stringify(list, null, 2));
};
main()
  .then()
  .catch(e => {
    console.error(e);
  });
