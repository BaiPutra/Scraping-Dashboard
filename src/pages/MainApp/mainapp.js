import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Footer, Header } from '../../components/molekul/molekul'
import Create from '../CreatePost/create'
import Detail from '../DetailPost/detail'
import Home from '../Home'

const MainApp = () => {
  return (
    <div>
      <Header />
      <Router>
        <Switch>
            <Route path='/create-post'>
                <Create />
            </Route>
            <Route path='/detail-post'>
                <Detail />
            </Route>
            <Route path='/'>
                <Home />
            </Route>
        </Switch>
      </Router>
      <Footer />
    </div>
  )
}

export default MainApp
