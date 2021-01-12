import React, { Component } from "react";

class CaptureButton extends Component {
	render() {
		return (
			<button
				id="ascii-capture"
				className="mdl-button mdl-button--raised"
				onClick={this.props.setCapturing}
			>
				Capture Still
			</button>
		);
	}
}
export default CaptureButton;