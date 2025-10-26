import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./App.css"
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

import { Buffer } from "buffer"; // pdfmake needs this polyfill
window.Buffer = Buffer;

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);