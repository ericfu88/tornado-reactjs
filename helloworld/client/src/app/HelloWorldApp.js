/** @jsx React.DOM */
var React = require('react');

var HelloWorldApp = React.createClass({
	render: function() {
		return (
			<div className="helloworld">Hello world App. This works!</div>
		);
	}
	
});
	
module.exports = HelloWorldApp;
