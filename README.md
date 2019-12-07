https://quizwhatitis.herokuapp.com/

* [x] Going from list article title to quiz name.
* [~] Generating questions/building a corpus of questions (binary yes/no) (extra credit selection)
* [x] The home page (navigate to various quizzes)
* [Conner] Frontend for quiz page (has questions, tells you your result)
  * [ ] Intro
    * [ ] Details from the wikipedia article?
  * [x] Questions
    * [X] Binary
    * [x] Selection
    * [x] Picture to go along with choice
  * [x] Result
    * [x] 1. Tells you what you are
    * [x] 2. Describes what you are
    * [x] 3. Picture of what you are if possible.
    * [x] 4. Personality map
* [x] Adding voting options to the home page
* [x] Getting infra (heroku) set up so we can deploy this a real place
* [x] Building a system for deterministically selecting a result from question answers.


* [x] for a given list: questions asked are consistent, and the options (possible answers) for those questions are consistent
* [x] there are pictures (where possible) for results
* [x] for results script: it should not include possible results that are missing both an image and a title
* [ ] results should have a description (stretch goal is our madlibs/nlp/bold claims based on answers and result description paragraph)
* [ ] we want lots more quizes
* [x] we have curated list of a few quizzes at the top of the home page

So remaining todos/ideas:
* [ ] I think the answers are broken maybe? I don't think they're getting submitted to the server, so you always get the same result. That needs to be fixed.
* [ ] Madlibs thing? You have access to the "excerpt" from the wikipedia article now, maybe that's enough to get started?
* [ ] I think we should also try and grab an "excerpt" from the list page when they're just starting out with the quiz on the intro. We also might be able to grab a picture some way.
* [ ] result pages can be bookmarked (stretch goal)
* [ ] Increase question corpus? Basically to do that, go to "generate.js" and look where I have "ANIMAL" and "FOOD". We can add more categories like that with a rich set of subcategories likely to have images, maybe.
* [ ] Maybe think up some way of generating text-only questions, too -- with new queries? The querying stuff was really fun.
* [ ] Shareable links & twitter?
* [ ] Maybe we should ask people to vote for us on the results page? And maybe also "if you liked this quiz, then maybe you'll also like <completely unrelated quiz> (edited) 

Oh yeah if you need to run the Makefile or generate.js or that stuff
if you get "rate limited"
just delete the output file and run it again and again
it's all cached so you will gradually make progress ] more varied questions

* [x] Going from list article title to quiz name.
* [~] Generating questions/building a corpus of questions (binary yes/no) (extra credit selection)
* [x] The home page (navigate to various quizzes)
* [Conner] Frontend for quiz page (has questions, tells you your result)
  * [ ] Intro
    * [ ] Details from the wikipedia article?
  * [x] Questions
    * [X] Binary
    * [x] Selection
    * [x] Picture to go along with choice
  * [x] Result
    * [x] 1. Tells you what you are
    * [x] 2. Describes what you are
    * [x] 3. Picture of what you are if possible.
    * [x] 4. Personality map
* [x] Adding voting options to the home page
* [x] Getting infra (heroku) set up so we can deploy this a real place
* [x] Building a system for deterministically selecting a result from question answers.


* [x] for a given list: questions asked are consistent, and the options (possible answers) for those questions are consistent
* [x] there are pictures (where possible) for results
* [x] for results script: it should not include possible results that are missing both an image and a title
* [ ] results should have a description (stretch goal is our madlibs/nlp/bold claims based on answers and result description paragraph)
* [ ] we want lots more quizes
* [x] we have curated list of a few quizzes at the top of the home page

So remaining todos/ideas:
* [ ] I think the answers are broken maybe? I don't think they're getting submitted to the server, so you always get the same result. That needs to be fixed.
* [ ] Madlibs thing? You have access to the "excerpt" from the wikipedia article now, maybe that's enough to get started?
* [ ] I think we should also try and grab an "excerpt" from the list page when they're just starting out with the quiz on the intro. We also might be able to grab a picture some way.
* [ ] result pages can be bookmarked (stretch goal)
* [ ] Increase question corpus? Basically to do that, go to "generate.js" and look where I have "ANIMAL" and "FOOD". We can add more categories like that with a rich set of subcategories likely to have images, maybe.
* [ ] Maybe think up some way of generating text-only questions, too -- with new queries? The querying stuff was really fun.
* [ ] Shareable links & twitter?
* [ ] Maybe we should ask people to vote for us on the results page? And maybe also "if you liked this quiz, then maybe you'll also like <completely unrelated quiz> (edited) 
Oh yeah if you need to run the Makefile or generate.js or that stuff
if you get "rate limited"
just delete the output file and run it again and again
it's all cached so you will gradually make progress ] more varied questions
