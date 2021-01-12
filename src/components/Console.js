import React, { Component } from "react";

class Console extends Component {
	render() {
		return (
			<div className="ascii-card mdl-card mdl-shadow--2dp">
				<div className="mdl-card__actions">You in ASCII !</div>
				<pre
					id="console"
					ref={this.props.console}
					style={{ color: this.props.consoleColor }}
					dangerouslySetInnerHTML={{ __html: this.props.consoleHTML }}
				></pre>
				<pre
					id="tmp"
					ref={this.props.tmp}
					dangerouslySetInnerHTML={{ __html: this.props.tmpHTML }}
				></pre>
			</div>
		);
	}
}
export default Console;