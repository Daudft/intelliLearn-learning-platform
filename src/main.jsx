import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 1000, 
  easing: "ease-out-cubic",
  once: false
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
