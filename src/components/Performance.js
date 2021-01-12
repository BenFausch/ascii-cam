import React, { Component } from "react";

class Performance extends Component {
	render() {
		return (
			<div className="perf-card">
				<div
					className="mdl-card__actions performance-container"
					id="ascii-performance"
				>
					<h4>Performance</h4>
					<div
						className="mdl-progress mdl-js-progress"
						ref={this.props.performanceMetrics}
					></div>
					<p>
						<span id="performance">{this.props.rate}</span> ms
						response time
					</p>
					<div
						className="mdl-tooltip mdl-tooltip--right"
						htmlFor="ascii-performance"
					>
						&nbsp;
						<br />
						<br />
						How much you're making your browser hurt. <br />
						<br />
						Remember this is all JS/WASM on the FE! <br />
						<br />
						Adjust settings on the left to make the camera more
						responsive. <br />
						<br />
					</div>
				</div>
			</div>
		);
	}
}
export default Performance;