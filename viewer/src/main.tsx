import { render } from 'preact'
import './index.css'
import App from './app.tsx';

render(<App />, document.getElementById('app')!)
// Create the web user interface using @tangerie/remote-sqlite/client to browse an sqlite database