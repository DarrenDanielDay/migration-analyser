// Define your global variables here.
// Don't forget to inject them into window!
// `React` and `ReactDOM` will be injected with CDN script tag.
declare var React: typeof import("react");
declare var ReactDOM: typeof import("react-dom");
declare var useState: typeof import("react")["useState"]
declare var useEffect: typeof import("react")["useEffect"]
// This is a simple implementation for calling extension API in webview.
// See index.tsx for more details.
declare var extensionAPI: import("../message-protocol").UIRequestController;
