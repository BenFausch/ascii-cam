import React, { Component } from "react";

class RecordButton extends Component {
	render() {
		return (
			<button
				id="ascii-record"
				className="mdl-button mdl-button--raised"
				onClick={this.props.setRecording}
			>
				Record
			</button>
		);
	}
}

export default RecordButton;