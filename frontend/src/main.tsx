import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { store } from './store.ts'
import './styles/tokens.css'
import './styles/global.css'
<<<<<<< HEAD
import '/styles/forms.css'
=======
import './styles/forms.css'
>>>>>>> root/main

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}> 
       <App />
    </Provider>
  </StrictMode>,
);
