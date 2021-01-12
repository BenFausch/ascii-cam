import React, { Component } from "react";

class Header extends Component {
	render() {
		return (
			<header className="mdl-layout__header">
				<div className="mdl-layout__header-row">
					<div className="mdl-textfield" id="logo">
						<pre>
							{`   ________________      ____ 
  /  _  \\__    ___/__  _/_   |
 /  /_\\  \\|    |  \\  \\/ /|   |
/    |    \\    |   \\   / |   |
\\____|__  /____|    \\_/  |___|
        \\/                    `}
						</pre>
					</div>
					<div className="mdl-layout-spacer"></div>

					<div
						className="mdl-textfield mdl-js-textfield mdl-textfield--expandable
      mdl-textfield--floating-label mdl-textfield--align-right"
					>
						ASCII Tools V1
						<sub>by Ben Fausch</sub>
						<div className="mdl-textfield__expandable-holder">
							<input
								className="mdl-textfield__input"
								type="text"
								name="sample"
								id="fixed-header-drawer-exp"
							></input>
						</div>
					</div>
				</div>
			</header>
		);
	}
}

export default Header;