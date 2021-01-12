import { render, screen } from "@testing-library/react";
import Adapter from "enzyme-adapter-react-16";
import { shallow, configure, mount } from "enzyme";
import App from "./App";

configure({ adapter: new Adapter() });

const resizeWindow = (x, y) => {
	window.innerWidth = x;
	window.innerHeight = y;
	window.dispatchEvent(new Event("resize"));
};

//mock camera/wasm/go
let mediaDevicesMock = {
	enumerateDevices: jest.fn(),
};
global.navigator.mediaDevices = mediaDevicesMock;
let Go = jest.fn();
global.Go = Go;
global.WebAssembly.instantiateStreaming = () => Promise.resolve(true);

//verifies render after load
test("verifies video element in browser", () => {
	render(<App />);
	expect(document.getElementById("videoElement")).toBeInTheDocument();
});

//verifies error on mobile
test("verifies error in mobile browser", () => {
	let mob = render(<App />);

	// Change the viewport to a mobile version.
	resizeWindow(1023, 640);
	let mob2 = shallow(<App />);
	let isInvalid = mob2.instance().state.invalidBrowser;
	expect(isInvalid).toEqual(true);
});