import { InfoModalSchema } from './backendTypes';

// Every message dialog the backend raises arrives with its own translated
// close label. These are the dialogs the renderer has to raise on its own -
// the backend sent an action nobody understands, or it could not be reached at
// all - so there is nothing to translate them with. The text is a diagnostic
// and the label lives here, in the one place that needs it, rather than at
// each call site.
const CLOSE_BUTTON_TEXT = 'OK';

export default function protocolErrorDialog(text: string): InfoModalSchema {
  return { title: undefined, text, close_button_text: CLOSE_BUTTON_TEXT };
}
