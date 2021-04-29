import createDebug, { Debugger } from 'debug';

export { Debugger } from 'debug';

export const debug: Debugger = createDebug('mongoodm');
