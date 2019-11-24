quizzes.json:
	node generate.js quizzes > quizzes.json

quizzes_with_results.json: littlequizzes.json generate.js
	node generate.js quizzes_with_results quizzes.json > quizzes_with_results.json

subclass_images.json:
	node generate.js subclass_images > subclass_images.json

quizzes_with_results_and_answers.json: quizzes_with_results.json subclass_images.json
	node generate.js quizzes_with_results_and_answers quizzes_with_results.json subclass_images.json > quizzes_with_results_and_answers.json
deploy:
	git push heroku master
