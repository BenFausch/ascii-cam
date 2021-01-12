import React, { Component } from "react";

//Custom Components
import Header from "./components/Header.js";
import Nav from "./components/Nav.js";
import CaptureButton from "./components/CaptureButton";
import RecordButton from "./components/RecordButton";
import Performance from "./components/Performance";
import Console from "./components/Console";
import { MobileCheck } from "./components/MobileCheck";

//External Libraries/Components
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";

//Styles
import "./App.scss";
import "react-toastify/dist/ReactToastify.css";

//Init vars
var AU = require("ansi_up");
//eslint-disable-next-line
var ansi_up = new AU.default();
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
      invalidBrowser: false,
      video: null,
      canvas: null,
      currentId: 0,
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
      controls: {
        isColor: false,
        asciiWidth: 100,
        asciiHeight: 30,
        refreshRate: 30,
        consoleColor: "#ffffff",
      },
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
                fixedWidth: parseInt(rdx.state.controls.asciiWidth),
                colored: rdx.state.controls.isColor,
                fixedHeight: parseInt(rdx.state.controls.asciiHeight),
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

  ///////////////////////////////////////////////////
  //                  _             _
  //                 | |           | |
  //   ___ ___  _ __ | |_ _ __ ___ | |___
  //  / __/ _ \| '_ \| __| '__/ _ \| / __|
  // | (_| (_) | | | | |_| | | (_) | \__ \
  // \___\___/|_| |_|\__|_|  \___/|_|___/
  //////////////////////////////////////////////////

  //Controls Listener/Handler
  updateView(event, name) {
    console.log("UPDATE", name, event.target.value);
    switch (name) {
      case "color-switch":
        rdx.setState((prevState) => ({
          controls: { ...prevState.controls, isColor: event.target.checked },
        }));
        break;
      case "ascii-width":
        rdx.setState((prevState) => ({
          controls: { ...prevState.controls, asciiWidth: event.target.value },
        }));
        break;
      case "ascii-height":
        rdx.setState((prevState) => ({
          controls: { ...prevState.controls, asciiHeight: event.target.value },
        }));
        break;
      case "refresh-rate":
        rdx.setRefresh(event);
        break;
      case "console-color":
        rdx.setState((prevState) => ({
          controls: { ...prevState.controls, consoleColor: event.target.value },
        }));
        break;
      default:
        return true;
    }
  }

  //Clears Interval, Restarts watcher with new rate
  setRefresh(e) {
    rdx.clear();
    rdx.setState((prevState) => ({
      controls: { ...prevState.controls, refreshRate: e.target.value },
    }));
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
      val ? val : rdx.state.controls.refreshRate
    );
  }

  //Resets Frame Watcher
  clear() {
    window.clearInterval(rdx.state.currentId);
  }

  //Verifies Desktop
  checkView() {
    if (MobileCheck() || window.innerWidth < 1024) {
      if (!rdx.state.invalidBrowser) {
        rdx.setState({ invalidBrowser: true });

        toast.dark(
          "Hi there, this project is too resource heavy for mobile browsers, live canvas drawing is like that right now unfortunately. Please do not attempt to use this site on your mobile device, it may catch fire!!",
          {
            position: "top-center",
            autoClose: 9000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    } else {
      //reload page once valid
      if(rdx.state.invalidBrowser){
        window.location.reload()
      }
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
          rdx.setState({ invalidBrowser: false });
          rdx.state.video = rdx.videoElement.current;
          rdx.state.video.srcObject = stream;
          rdx.init();
        })
        .catch(function (error) {
          console.log("error", error);

          if (!rdx.state.invalidBrowser) {
            rdx.setState({ invalidBrowser: true });

            toast.dark(
              "Hola muchacho! This site needs your camera to work, otherwise it's just a really fancy empty page :) You'll want to refresh the page and allow camera permissions for this page.",
              {
                position: "top-center",
                autoClose: 9000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              }
            );
          }
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
        {rdx.state.invalidBrowser ? (
          <div className="invalidBrowser">
            <ToastContainer
              position="top-center"
              autoClose={9000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        ) : (
          <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
            <Header></Header>
            <div className="mdl-layout__drawer">
              <span className="mdl-layout-title">Settings</span>
              <Nav
                controlVals={rdx.state.controls}
                onUpdate={rdx.updateView}
              ></Nav>
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
                    <RecordButton
                      setRecording={() =>
                        rdx.setState({ recording: true, recordingVideo: true })
                      }
                    />
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
                    <CaptureButton
                      setCapturing={() => rdx.setState({ capturing: true })}
                    />
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

                    <a
                      id="ascii-img"
                      href={rdx.state.daHref}
                      download={rdx.state.daDown}
                      ref={rdx.downloadImg}
                    >
                      &nbsp;
                    </a>
                  </div>
                  <Performance
                    performanceMetrics={rdx.performanceMetrics}
                    rate={rdx.state.rate}
                  />
                </div>
                <div className="mdl-layout-spacer"></div>
                <Console
                  console={rdx.console}
                  tmp={rdx.tmp}
                  consoleHTML={rdx.state.consoleHTML}
                  tmpHTML={rdx.state.tmpHTML}
                  consoleColor={rdx.state.controls.consoleColor}
                />
              </div>
            </main>
          </div>
        )}
      </div>
    );
  } //end render
}

export default App;