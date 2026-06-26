import React from 'react'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Header from "./components/header/Header.jsx"
import FooterComp from './components/Footer/FooterComp.jsx'

const App = () => {
  return (
    <div>
      <Header/>
      <Dashboard />
      <FooterComp/>
    </div>
  )
}

export default App
