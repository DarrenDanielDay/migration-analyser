// Note that you can only import relative modules end with `.js` suffix in the UI sub-project.
// Because this UI demo is based on CDN react bundle and `script` tag with `type="module"`.
import { App } from "./app.js";
import { MessageManager } from "./messager.js";

// Use `import type` for your type defined. These imports will be ignored by tsc.
import type { ProtocalCommand } from "../message-protocol";
window.addEventListener("message", MessageManager.instance.listener);
window.extensionAPI = new Proxy(
  {},
  {
    get(_target, key: ProtocalCommand, _receiver) {
      return async (params: any) => {
        const result = await MessageManager.instance.request(key, params);
        console.log(`execute ${key}`, result);
        return result;
      };
    },
  }
) as never;
window.useState = React.useState;
window.useEffect = React.useEffect;
ReactDOM.render(<App></App>, document.getElementById("app"));
