import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store.ts'
import './styles/tokens.css'
import './styles/global.css'
import './styles/forms.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}> 
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
