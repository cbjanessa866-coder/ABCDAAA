
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

// Fix for missing JSX intrinsic elements in the environment's TypeScript configuration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
