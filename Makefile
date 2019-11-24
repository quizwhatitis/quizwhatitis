quizzes.json:
	node fetchLists.js quizzes > quizzes.json
littlequizzes.json: quizzes.json
	cat quizzes.json | jq 'def keeper(x): [(x | contains("cryptid")), (x | contains("industrial disasters")), (x | contains("poker hands"))] | any; [.[] | select(keeper(.title))'] > littlequizzes.json
littlequizzeswithpossibleresults.json: littlequizzes.json fetchLists.js
	node fetchLists.js quizzeswithpossibleresults > littlequizzeswithpossibleresults.json

pickyourfavorite.json:
	node fetchLists.js pickyourfavorite > pickyourfavorite.json

deploy:
	git push heroku master
