//SIDEBAR CONTROLS//
import React, {Component} from 'react';

class Nav extends Component{

onSet = (e,name)=>{
	this.props.onUpdate(e,name)
}
 
	render(){
		return (
			<nav className="mdl-navigation">
              <form id="controls">
                <ul>
                  <li className="mdl-navigation__link">
                    <label
                      htmlFor="switchColor"
                      className="mdl-switch mdl-js-switch mdl-js-ripple-effect"
                      id="switchColorLabel"
                    >
                      <input
                        type="checkbox"
                        id="switchColor"
                        className="mdl-switch__input"
                        checked={this.props.controlVals.isColor}
                        onChange={event=>this.onSet(event,'color-switch')}                        
                      ></input>
                      <span className="mdl-switch__label">Color</span>
                    </label>
                  </li>
                  <li className="mdl-navigation__link">
                    <span className="mdl-switch__label">
                      Number of characters (X)
                    </span>
                    <input
                      className="mdl-slider mdl-js-slider"
                      type="range"
                      id="slideWidth"
                      min="10"
                      max="150"
                      step="10"
                      value={this.props.controlVals.asciiWidth}
                      onChange={event=>this.onSet(event,'ascii-width')}                      
                    />
                    <span className="mdl-switch__label" id="slideWidthVal">
                      {this.props.controlVals.asciiWidth}
                    </span>
                  </li>
                  <li className="mdl-navigation__link">
                    <span className="mdl-switch__label">
                      Number of rows (Y)
                    </span>
                    <input
                      className="mdl-slider mdl-js-slider"
                      type="range"
                      id="slideHeight"
                      min="10"
                      max="40"
                      step="2"
                      value={this.props.controlVals.asciiHeight}
                      onChange={event=>this.onSet(event,'ascii-height')}
                    />
                    <span className="mdl-switch__label" id="slideHeightVal">
                      {this.props.controlVals.asciiHeight}
                    </span>
                  </li>
                  <li className="mdl-navigation__link">
                    <span className="mdl-switch__label">Refresh Rate (ms)</span>
                    <input
                      className="mdl-slider mdl-js-slider"
                      type="range"
                      id="refreshRate"
                      min="10"
                      max="1000"
                      step="10"
                      value={this.props.controlVals.refreshRate}
                      onChange={event=>this.onSet(event,'refresh-rate')}
                    />
                    <span className="mdl-switch__label" id="refreshRateVal">
                      {this.props.controlVals.refreshRate} ms/frame
                    </span>
                  </li>
                  <li className="mdl-navigation__link">
                    <span className="mdl-switch__label">
                      Text Color (BW only)
                    </span>
                    <input
                      type="color"
                      id="textColor"
                      value={this.props.controlVals.consoleColor}
                      onChange={event=>this.onSet(event,'console-color')}
                    ></input>
                    <span
                      className="mdl-switch__label"
                      id="textColorVal"
                      style={{ color: this.props.controlVals.consoleColor }}
                    >
                      {this.props.controlVals.consoleColor}
                    </span>
                  </li>
                </ul>
              </form>
              <button id="info">i</button>
              <div
                className="mdl-tooltip mdl-tooltip--large mdl-tooltip--top"
                htmlFor="info"
              >
                Built in React by Ben Fausch in 2020/21 with: <br />
                <br />
                WASM compiled Go <br />
                <br />
                ANSI Up <br />
                <br />
                GifShot <br />
                <br />
                HTML2Canvas <br />
                <br />
                Material UI Lite <br />
                <br />
                Special Thanks to Stack Overflow <br />
                <br />
              </div>
            </nav>
			)
	}
}

export default Nav;