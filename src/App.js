import React, { Component } from "react";
import html2canvas from 'html2canvas';
    
import { MobileCheck } from "./MobileCheck.js";
import "./App.scss";


var AU = require('ansi_up');
//eslint-disable-next-line
var ansi_up = new AU.default;

var rdx = null;

class App extends Component {
  /////////////////////////////////////////////////
  //                      _                   _
  //                     | |                 | |
  //   ___ ___  _ __  ___| |_ _ __ _   _  ___| |_
  //  / __/ _ \| '_ \/ __| __| '__| | | |/ __| __|
  // | (_| (_) | | | \__ \ |_| |  | |_| | (__| |_
  //  \___\___/|_| |_|___/\__|_|   \__,_|\___|\__|
  ////////////////////////////////////////////////

  constructor(props) {
    super(props);
    this.state = {
      video: null,
      canvas: null,
      isColor: false,
      currentId: 0,
      asciiWidth: 100,
      asciiHeight: 30,
      refreshRate: 30,
      consoleColor: "#ffffff",
      rate: 1,
      capturing: false,
      recording: false,
      exporting: false,
      outputFrames: [],
      outputVideo: [],
      frameMax: 40,
      consoleHTML: null,
      recordedProg: "",
      daDown: null,
      daHref: null,
      capturedDesc: "",
      loading: false,
      recordingVideo: false,
    };

    //class scope this
    rdx = this;

    //refs
    this.downloadImg = React.createRef();
    this.console = React.createRef();
    this.performanceMetrics = React.createRef();
    this.videoElement = React.createRef();
    this.tmp = React.createRef();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //                  _                      __                             _
  //                 | |                    / /                            | |
  //   ___ __ _ _ __ | |_ _   _ _ __ ___   / /    _____  ___ __   ___  _ __| |_
  //  / __/ _` | '_ \| __| | | | '__/ _ \ / /    / _ \ \/ / '_ \ / _ \| '__| __|
  // | (_| (_| | |_) | |_| |_| | | |  __// /    |  __/>  <| |_) | (_) | |  | |_
  //  \___\__,_| .__/ \__|\__,_|_|  \___/_/      \___/_/\_\ .__/ \___/|_|   \__|
  //           | |                                        | |
  //           |_|                                        |_|
  //////////////////////////////////////////////////////////////////////////////////////////////////

  /*Main Loop*/
  // Takes Video Snap, converts to ASCII
  // Outputs for Capture/Recording

  takeSnapshot() {
    let t0 = performance.now(),
      context,
      width = rdx.state.video.offsetWidth,
      height = rdx.state.video.offsetHeight;

    //set widths
    rdx.state.canvas = rdx.state.canvas || document.createElement("canvas");
    rdx.state.canvas.width = width;
    rdx.state.canvas.height = height;

    //create img from video
    context = rdx.state.canvas.getContext("2d");
    context.drawImage(rdx.state.video, 0, 0, width, height);

    //create ascii
    if (!rdx.state.exporting) {
      rdx.state.canvas.toBlob(function (blob) {
        let reader = new FileReader();

        // convert to uint8array
        reader.onload = function () {
          let arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer);

          //wait for reader availability
          if (typeof convert !== "undefined") {
            //eslint-disable-next-line
            let txt = convert(
              array,
              JSON.stringify({
                fixedWidth: parseInt(rdx.state.asciiWidth),
                colored: rdx.state.isColor,
                fixedHeight: parseInt(rdx.state.asciiHeight),
                reversed: false,
              })
            );

            //eslint-disable-next-line
            // let ansi_up = new AnsiUp();

            //convert HTML to ASCII
            let html = ansi_up.ansi_to_html(txt);
            if (!rdx.state.recording) {
              //set to console
              rdx.setState({ consoleHTML: html });
            }

            //analyze
            let t1 = performance.now();
            rdx.setState({ rate: parseInt(t1 - t0) });
            rdx.setProgress();

            //convert screencap for export
            if (rdx.state.capturing) {
              rdx.captureFrame();
            }

            //convert to gif for export
            if (rdx.state.recording) {
              rdx.recordFrames(html);
            }
          }
        };

        try {
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          console.log("no blob yet");
        }
        //END CONVERT
      }, "image/jpeg");
    } else {
      rdx.setProgress();
      rdx.state.rate = 0;
    }
  }

//Set performance bar
  setProgress() {
    try {
      rdx.performanceMetrics.current.MaterialProgress.setProgress(
        rdx.state.rate / 40
      );
    } catch (e) {
      console.log("no MD yet");
    }
  }

  //Captures 1 Frame From ASCII Output, Downloads Gif
  captureFrame() {
    rdx.setState({ capturing: false });

    //eslint-disable-next-line
    html2canvas(rdx.console.current).then(function (canvasOutput) {
      rdx.setState({
        daDown: `cool-ascii-stream-${Date.now()}.png`,
        daHref: canvasOutput
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream"),
      });

      rdx.downloadImg.current.click();
    });
  }

  //Captures Frames from ASCII Output, Converts to Gif When Max Reached
  recordFrames(html) {
    rdx.state.outputFrames.push(html);
    if (rdx.state.outputFrames.length === rdx.state.frameMax) {      
      rdx.setState({ recordedProg: "", recordingVideo: false });

      //convert to gif
      rdx.convertToGif(rdx.state.outputFrames);
    } else if (rdx.state.outputFrames.length < rdx.state.frameMax) {
      rdx.setState({
        recordedProg: `${rdx.state.outputFrames.length} / ${rdx.state.frameMax} recorded`,
      });
    }
  }

  //Converts Video Frames to Gif, Outputs Gif When Complete
  async convertToGif(frames) {
    //set capture frame to match video frame height
    rdx.tmp.current.style.width = rdx.console.current.innerWidth;
    rdx.tmp.current.style.height = rdx.console.current.innerHeight;

    for (let i = 0; i < frames.length; i++) {
      rdx.setState({ tmpHTML: frames[i] });

      if (rdx.state.recording && i < rdx.state.frameMax) {
        await rdx.frame2Canvas(i);
      } else if (i === rdx.state.frameMax) {
        rdx.setState({
          recording: false,
          exporting: true,
          loading: true,
          capturedDesc:
            "Creating jif... if you selected color or a high resolution, it'll be a minute",
        });

        rdx.createGifAsset();
      }
    }
  }

  //Converts Tmp HTML to Canvas Object
  frame2Canvas(index) {
    return new Promise((resolve) => {
      //eslint-disable-next-line
      html2canvas(rdx.tmp.current).then(function (canvasOutput) {
        let img = canvasOutput.toDataURL("image/png");

        let curOpt = rdx.state.outputVideo;
        curOpt.push(img);

        rdx.setState({
          outputVideo: curOpt,
          loading: true,
          capturedDesc:
            "Capturing frames, " +
            rdx.state.outputVideo.length +
            "/" +
            rdx.state.frameMax,
        });
        resolve(true);
      });
    });
  }

  //Creates GIF from Output Video Frames
  createGifAsset() {
    //eslint-disable-next-line
    gifshot.createGIF(
      {
        images: rdx.state.outputVideo,
        // 'interval': refreshRate / 3600,
        interval: 0.00833,
        gifWidth: 1000,
        gifHeight: 625,
      },
      function (obj) {
        if (!obj.error) {
          var image = obj.image;
          rdx.setState({
            daDown: `cool-ascii-stream-${Date.now()}.gif`,
            daHref: image.replace("image/gif", "image/octet-stream"),
          });

          rdx.downloadImg.current.click();

          rdx.setState({
            outputFrames: [],
            outputVideo: [],
            loading: false,
            capturedDesc: "",
            exporting: false,
          });
        } else {
          console.log("error", obj.error);
          rdx.state.recording = false;
        }
      }
    );
    return false;
  }

  //Clears Interval, Restarts watcher with new rate
  setRefresh(e) {
    rdx.clear();
    rdx.setState({ refreshRate: e.target.value });
    rdx.init(e.target.value);
  }

  //////////////////////////
  //  _       _ _
  // (_)     (_) |
  //  _ _ __  _| |_
  // | | '_ \| | __|
  // | | | | | | |_
  // |_|_| |_|_|\__|
  //////////////////////////

  //Begins Frame Watcher
  init(val) {
    rdx.state.currentId = window.setInterval(
      function () {
        rdx.checkView();
        rdx.takeSnapshot();
      },
      val ? val : rdx.state.refreshRate
    );
  }

  //Resets Frame Watcher
  clear() {
    window.clearInterval(rdx.state.currentId);
  }

  //Verifies Desktop
  checkView() {
    if (MobileCheck() || window.innerWidth < 768) {
      document.querySelector("body").style.display = "none";
      window.alert(
        "Hi there, this project is very resource heavy. Please do not attempt to use this site on your phone, it may catch fire!! Use at your own risk :)"
      );
    } else {
      document.querySelector("body").style.display = "block";
    }
  }

  componentDidMount() {
    //Verifies Camera Permissions
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(function (stream) {
          rdx.state.video = rdx.videoElement.current;
          rdx.state.video.srcObject = stream;
          rdx.init();
        })
        .catch(function (error) {
          console.log("error", error);
          // alert("Hola muchacho! This site needs your camera to work, otherwise it's just a really fancy empty page :)");
        });
    }

    //eslint-disable-next-line
    const go = new Go();

    //Creates New WASM Instance
    WebAssembly.instantiateStreaming(
      fetch("js/main.wasm"),
      go.importObject
    ).then((result) => {
      console.log("running wasm");
      go.run(result.instance);
    });
  }

  /////////////////////////////////////
  //  _ __ ___ _ __   __| | ___ _ __
  // | '__/ _ \ '_ \ / _` |/ _ \ '__|
  // | | |  __/ | | | (_| |  __/ |
  // |_|  \___|_| |_|\__,_|\___|_|
  ////////////////////////////////////
  render() {
    return (
      <div className="App">
        <div
          className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer
  mdl-layout--fixed-header"
        >
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
          <div className="mdl-layout__drawer">
            <span className="mdl-layout-title">Settings</span>
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
                        checked={this.state.isColor}
                        onChange={(event) =>
                          this.setState({ isColor: event.target.checked })
                        }
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
                      value={this.state.asciiWidth}
                      onChange={(event) =>
                        this.setState({ asciiWidth: event.target.value })
                      }
                    />
                    <span className="mdl-switch__label" id="slideWidthVal">
                      {this.state.asciiWidth}
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
                      value={this.state.asciiHeight}
                      onChange={(event) =>
                        this.setState({ asciiHeight: event.target.value })
                      }
                    />
                    <span className="mdl-switch__label" id="slideHeightVal">
                      {this.state.asciiHeight}
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
                      value={this.state.refreshRate}
                      onChange={this.setRefresh}
                    />
                    <span className="mdl-switch__label" id="refreshRateVal">
                      {this.state.refreshRate} ms/frame
                    </span>
                  </li>
                  <li className="mdl-navigation__link">
                    <span className="mdl-switch__label">
                      Text Color (BW only)
                    </span>
                    <input
                      type="color"
                      id="textColor"
                      value={this.state.consoleColor}
                      onChange={(event) =>
                        this.setState({ consoleColor: event.target.value })
                      }
                    ></input>
                    <span
                      className="mdl-switch__label"
                      id="textColorVal"
                      style={{ color: this.state.consoleColor }}
                    >
                      {this.state.consoleColor}
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
          </div>
          <main className="mdl-layout__content">
            <div className="page-content">
              <div className="video-card mdl-card mdl-shadow--2dp">
                <div className="mdl-card__actions">
                  <span className="video-card-image__filename">You</span>
                </div>

                <video
                  autoPlay={true}
                  id="videoElement"
                  ref={rdx.videoElement}
                  height="175"
                ></video>
                <span
                  id="recordBtn"
                  className={rdx.state.recordingVideo ? "active" : " "}
                >
                  {" "}
                  Recording...<i></i>
                </span>
                <p id="ascii-recorded">{rdx.state.recordedProg}</p>

                <div className="mdl-card__actions">
                  <h4>Capture</h4>
                  <button
                    id="ascii-record"
                    className="mdl-button mdl-button--raised"
                    onClick={() =>
                      rdx.setState({ recording: true, recordingVideo: true })
                    }
                  >
                    Record
                  </button>
                  <div
                    className="mdl-tooltip mdl-tooltip--top"
                    htmlFor="ascii-record"
                  >
                    Record up to 40 frames of the live video feed. <br />
                    <br />
                    Once finished this will export as a gif file for your
                    enjoyment! <br />
                    <br />
                    Length of the gif will depend on the refresh rate in the
                    toolbar.
                  </div>

                  <button
                    id="ascii-capture"
                    className="mdl-button mdl-button--raised"
                    onClick={() => rdx.setState({ capturing: true })}
                  >
                    Capture Still
                  </button>
                  <div
                    className="mdl-tooltip mdl-tooltip--bottom"
                    htmlFor="ascii-capture"
                  >
                    Take a capture of the live video feed. <br />
                    <br />
                    Once finished this will export as a png file for your
                    enjoyment.
                  </div>
                  <div
                    className={`loader ${rdx.state.loading ? "active" : ""}`}
                  >
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <p id="ascii-captured" ref={rdx.captured}>
                    {rdx.state.capturedDesc}
                  </p>
                  {/*eslint-disable-next-line*/}
                  <a
                    id="ascii-img"
                    href={rdx.state.daHref}
                    download={rdx.state.daDown}
                    ref={rdx.downloadImg}
                  ></a>
                </div>

                <div className="perf-card">
                  <div
                    className="mdl-card__actions performance-container"
                    id="ascii-performance"
                  >
                    <h4>Performance</h4>
                    <div
                      className="mdl-progress mdl-js-progress"
                      ref={rdx.performanceMetrics}
                    ></div>
                    <p>
                      <span id="performance">{rdx.state.rate}</span> ms response
                      time
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
              </div>
              <div className="mdl-layout-spacer"></div>

              <div className="ascii-card mdl-card mdl-shadow--2dp">
                <div className="mdl-card__actions">You in ASCII !</div>
                <pre
                  id="console"
                  ref={rdx.console}
                  style={{ color: this.state.consoleColor }}
                  dangerouslySetInnerHTML={{ __html: rdx.state.consoleHTML }}
                ></pre>
                <pre
                  id="tmp"
                  ref={rdx.tmp}
                  style={{ position: "absolute", bottom: "-1500px" }}
                  dangerouslySetInnerHTML={{ __html: rdx.state.tmpHTML }}
                ></pre>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  } //end render
}

export default App;

// //
// //FOR FILE INPUT
// // let buffer;
// // document.querySelector("#file").addEventListener(
// //   "change",
// //   function () {
// //     var reader = new FileReader();
// //     // reader.onload = function () {
// //     //   var arrayBuffer = this.result,
// //     //   array = new Uint8Array(arrayBuffer);
// //     //   buffer = array;
// //     //   var txt = convert(
// //     //     array,
// //     //     JSON.stringify({
// //     //       fixedWidth: 100,
// //     //       colored: true,
// //     //       fixedHeight: 40,
// //     //     })
// //     //     );
// //     //   var ansi_up = new AnsiUp();
// //     //   console.log("TXT",txt)
// //     //   var html = ansi_up.ansi_to_html(txt);
// //     //   var cdiv = document.getElementById("console");
// //     //   cdiv.innerHTML = html;
// //     // };
// //     // console.log('thisfiles',this.files)
// //     // reader.readAsArrayBuffer(this.files[0]);
// //   },
// //   false
// //   );
// // async function change(val) {
// //     var txt = convert(buffer, JSON.stringify(val));
// //     var ansi_up = new AnsiUp();
// //     var html = ansi_up.ansi_to_html(txt);
// //     var cdiv = document.getElementById("console");
// //     cdiv.innerHTML = html;
// // }
