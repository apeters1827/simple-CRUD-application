start:
	npm run nodemon -- --watch '.' --ext '.js' --exec npm run gulp -- server

gulp-console:
	npm run gulp console

build:
	rm -rf public/assets
	npm run-script build

lint:
	npm run eslint .

test:
	npm test

coverage-test:
	npm test -- --coverage