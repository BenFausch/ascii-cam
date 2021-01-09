import React, { Component } from "react";
import { MobileCheck } from "./MobileCheck.js";
import "./App.scss";

//this
var rdx = null;

class App extends Component {
  ///////////////////////////////
  //  _            _
  // | |          | |
  // | |_ ___   __| | ___
  // | __/ _ \ / _` |/ _ \
  // | || (_) | (_| | (_) |
  //  \__\___/ \__,_|\___/
  /////////////////////////////
  /*
1. finish gif output logic
2. move classlist.add to controlled html
3. try to get console to be controlled with dangerouslySetHTML
4. move things to components
5. see if libraries can be npm components instead
6. remove unused funcs, vars, ID's
7. document/push, etc
*/

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
      // capturedDesc : document.getElementById("ascii-captured"),
      // loader : document.querySelector(".loader"),
      // cdiv : document.getElementById("tmp");
    };
    rdx = this;
  }

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

  //start frame watcher
  init(val) {
    console.log("REFRESHRATE", val);
    rdx.state.currentId = window.setInterval(
      function () {
        rdx.checkView();
        rdx.takeSnapshot();
      },
      val ? val : rdx.state.refreshRate
    );
    console.log("currentId", rdx.state.currentId);
  }

  //reset watcher
  clear() {
    console.log("clearing rdx.state.currentId", rdx.state.currentId);
    window.clearInterval(rdx.state.currentId);
  }

  //capture frame
  takeSnapshot() {
    var t0 = performance.now();
    // var img = document.querySelector('img') || document.createElement('img');
    var context;
    var width = rdx.state.video.offsetWidth,
      height = rdx.state.video.offsetHeight;
    rdx.state.canvas = rdx.state.canvas || document.createElement("canvas");
    rdx.state.canvas.width = width;
    rdx.state.canvas.height = height;
    context = rdx.state.canvas.getContext("2d");
    context.drawImage(rdx.state.video, 0, 0, width, height);
    if (!rdx.state.exporting) {
      //direct output
      rdx.state.canvas.toBlob(function (blob) {
        var reader = new FileReader();
        // CONVERT
        reader.onload = function () {
          var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer);

          //wait for availability
          if (typeof convert !== "undefined") {
            //eslint-disable-next-line
            var txt = convert(
              array,
              JSON.stringify({
                fixedWidth: parseInt(rdx.state.asciiWidth),
                colored: rdx.state.isColor,
                fixedHeight: parseInt(rdx.state.asciiHeight),
                reversed: false,
              })
            );
            //eslint-disable-next-line
            var ansi_up = new AnsiUp();
            var html = ansi_up.ansi_to_html(txt);
            if (!rdx.state.recording) {
              //set to html
              rdx.setState({ consoleHTML: html });
            }
            //analyze
            var t1 = performance.now();
            rdx.setState({ rate: t1 - t0 });

            try {
              document
                .querySelector(".mdl-js-progress")
                .MaterialProgress.setProgress(rdx.state.rate / 40);
            } catch (e) {
              console.log("no MD yet");
            }

            //convert screencap for export
            if (rdx.state.capturing) {
              rdx.setState({ capturing: false });

              //eslint-disable-next-line
              html2canvas(cdiv).then(function (canvasOutput) {
                console.log("canvasOutput", canvasOutput);
                var downloadImg = document.getElementById("ascii-img");
                downloadImg.setAttribute(
                  "download",
                  `cool-ascii-stream-${Date.now()}.png`
                );
                downloadImg.setAttribute(
                  "href",
                  canvasOutput
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream")
                );
                downloadImg.click();
              });
            }
            if (rdx.state.recording) {
              rdx.state.outputFrames.push(html);
              if (rdx.state.outputFrames.length === rdx.state.frameMax) {
                document.getElementById("recordBtn").classList.remove("active");
                console.log(
                  "MAX FRAMES REACHED",
                  rdx.state.outputFrames.length
                );
                document.querySelector("#ascii-recorded").innerHTML = "";
                // convertToGif(rdx.state.outputFrames)
              } else if (rdx.state.outputFrames.length < rdx.state.frameMax) {
                document.querySelector("#ascii-recorded").innerHTML =
                  rdx.state.outputFrames.length +
                  "/" +
                  rdx.state.frameMax +
                  " recorded";
              }
            }
          } //end undefined if
        };

        try {
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          console.log("no blob yet");
        }
        //END CONVERT
      }, "image/jpeg");
    } else {
      // document.getElementById("performance").innerHTML = rdx.state.rate;
      document
        .querySelector(".mdl-js-progress")
        .MaterialProgress.setProgress(rdx.state.rate / 40);
      rdx.state.rate = 0;
    }
  }

  // async function convertToGif(frames) {
  //     var cdiv = document.getElementById("tmp");
  //     var consoleDiv = document.getElementById("console")
  //     cdiv.style.width = consoleDiv.innerWidth;
  //     cdiv.style.height = consoleDiv.innerHeight;
  //     console.log("NUMBER OF TOTAL FRAMES", frames.length)
  //     // frames.forEach(function(frame) {
  //     for (let i = 0; i < frames.length; i++) {
  //         cdiv.innerHTML = frames[i];
  //         if (rdx.state.recording && i < frameMax) {
  //             await frame2Canvas(i);
  //         } else if (i === frameMax) {
  //             rdx.state.exporting = true;
  //             console.log('SHOULD CREATE GIF NOW', outputVideo.length, frameMax)
  //             loader.classList.add('active')
  //             capturedDesc.innerHTML = 'Creating jif... if you selected color or a high resolution, it\'ll be a minute';
  //             createGifAsset()
  //         }
  //     }
  // }

  // function frame2Canvas(index) {
  //     return new Promise(resolve => {
  //         html2canvas(cdiv).then(function(canvasOutput) {
  //             console.log('recorded output', canvasOutput)
  //             let img = canvasOutput.toDataURL("image/png")
  //             outputVideo.push(img)
  //             console.log('frames captured', outputVideo.length, 'INDEX', index)
  //             loader.classList.add('active')
  //             capturedDesc.innerHTML = 'Capturing frames, ' + outputVideo.length + '/' + frameMax;
  //             resolve(true)
  //         });
  //     })
  // }

  // function createGifAsset() {
  //     gifshot.createGIF({
  //         'images': outputVideo,
  //         // 'interval': refreshRate / 3600,
  //         'interval':.00833,
  //         'gifWidth': 1000,
  //         'gifHeight': 625,
  //     }, function(obj) {
  //         if (!obj.error) {
  //             var image = obj.image;
  //             console.log("gif created", image)
  //             var downloadImg = document.getElementById('ascii-img');
  //             downloadImg.setAttribute('download', `cool-ascii-stream-${Date.now()}.gif`);
  //             downloadImg.setAttribute('href', image.replace("image/gif", "image/octet-stream"));
  //             downloadImg.click();
  //             console.log("CLEARING QUEUE")
  //             outputFrames = [];
  //             outputVideo = [];
  //             rdx.state.recording = false;
  //             loader.classList.remove('active')
  //             capturedDesc.innerHTML = '';
  //             rdx.state.exporting = false;
  //         } else {
  //             console.log('error', obj.error)
  //             rdx.state.recording = false;
  //         }
  //     });
  //     return false;
  // }

  setRefresh(e) {
    rdx.clear();
    console.log("val", e.target.value);
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

  componentDidMount() {
    //camera check and init
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(function (stream) {
          rdx.state.video = document.querySelector("#videoElement");
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

    //create wasm instance
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
                  &nbsp;&nbsp;&nbsp;________________ ____ <br />
                  &nbsp;&nbsp;/ _ \__ ___/__ _/_ |<br />
                  &nbsp;/ /_\ \| | \ \/ /| |<br />
                  / | \ | \ / | |<br />
                  \&nbsp;&nbsp;__|____/____| \_/ |___|
                  <br />
                  &nbsp;\/
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

                <video autoPlay={true} id="videoElement"></video>
                <span id="recordBtn">
                  {" "}
                  Recording...<i></i>
                </span>
                <p id="ascii-recorded"></p>
                <div className="mdl-card__actions">
                  <h4>Capture</h4>
                  <button
                    id="ascii-record"
                    className="mdl-button mdl-button--raised"
                    onClick={() => rdx.setState({ recording: true })}
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
                  <div className="loader">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <p id="ascii-captured"></p>
                  {/*eslint-disable-next-line*/}
                  <a id="ascii-img" href=""></a>
                </div>

                <div className="perf-card">
                  <div
                    className="mdl-card__actions performance-container"
                    id="ascii-performance"
                  >
                    <h4>Performance</h4>
                    <div className="mdl-progress mdl-js-progress"></div>
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
                  style={{ color: this.state.consoleColor }}
                  dangerouslySetInnerHTML={{ __html: rdx.state.consoleHTML }}
                ></pre>
                <pre
                  id="tmp"
                  style={{ position: "absolute", bottom: "-1500px" }}
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