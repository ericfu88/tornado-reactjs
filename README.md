Boilerplate code to use [react.js](https://facebook.github.io/react/) framework in a [Tornadoweb](http://www.tornadoweb.org/en/stable/) server with templates.

## Intro
React.js is great framework to develope views in a web app. Tornado is a Python web framework and asynchronous networking library for web servers. While it's possible to completely separate the frontend from the backend web services using on-demand ajax calls, sometimes it is necessary to generate the views from server with data initialized when the page is initially rendered. 

## Install

### Prerequsite
* Install node.js
* Install Python (2.7 and later)

### Setup the Frontend

1. Go to the `/helloworld/client/` directory
2. Run `npm install` to install the npm pacakges. 
3. Run `gulp`. This will watch for file changes automatically rebuild the frontend for development.
4. To deploy to production, run `gulp deploy`

### Running Tests

1. Go to the `/helloworld/client/` directory 
2. Run `gulp`
3. Run `gulp test` in another shell.
4. Open `helloworld/client/testing/build/testrunner.html` in browser to see the test results.


### Setup the Backend

1. Goto the top level directory of the package.
2. Run `pip install -r requirements.txt`. You might want to install [VirtualenvWrapper](http://virtualenvwrapper.readthedocs.org/en/latest/command_ref.html).
3. Run `python main.py`
4. Open http://localhost:8080/ in a browser and see the page is working.
5. Edit `/helloworld/client/src/app/HelloWorldApp.js` to make some changes to the React component, and reload the page.

## File organization
There are two configurations setup for the server, both are in the `conf` directory. By default the `dev` configuration is used. To run the production configuration, run `python --env=prod`.

Depending on the `debug` switch, the server will use either `/client/build` (for development) or `/client/dist` (for production). Both folder contains a `/static` and `templates` folder, and the contents in both are generated from `/client/src` by the automated build process.

Fodlers:

* `/helloword/client/build`: Generated frontend during development
* `/helloword/client/dist`: Generated frontend for deployment
* `/helloword/client/src`: Edit your frontend source here
* `/helloword/client/testing`: Files needed to run tests
* `/helloword/client/testing/spec`: Write your test case here.

## Credit
Gulp files are modified from this [React App Boilerplate code] (https://github.com/christianalfoni/react-app-boilerplate).
