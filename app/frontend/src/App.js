import React, { useState, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import LoginForm from './components/auth/LoginForm'
import SignUpForm from './components/auth/SignUpForm'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { auth } from './firebase/firebaseConfig'
import HomePage from './components/HomePage'
import WelcomePage from './components/WelcomePage'
import ConceptPage from './components/ConceptPage'
import TopicsPage from './components/TopicsPage'
import MainPage from './components/MainPage'
import Footer from './components/Footer'
import { fetchSingleUser } from './store/users'
import { authenticate } from './store/session'

function App({ locale, setLocale }) {
  const [loaded, setLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        await dispatch(authenticate()) // Make sure this properly sets the user
        await dispatch(fetchSingleUser(user.uid))
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
      setLoaded(true)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [dispatch])


  if (!loaded) {
    return <div>Loading...</div> // or any other loading indicator
  }

  return (
    <>
      <NavBar />
      <Switch>
        <Route exact path='/'>
          {currentUser ? <HomePage /> : <WelcomePage setLocale={setLocale} />}
        </Route>
        <Route path='/login'>
          {currentUser ? <Redirect to='/' /> : <LoginForm />}
        </Route>
        <Route path='/sign-up'>
          {currentUser ? <Redirect to='/' /> : <SignUpForm setLocale={setLocale} locale={locale} />}
        </Route>
        <Route path='/concepts/:conceptId'>
          {currentUser ? <TopicsPage /> : <WelcomePage setLocale={setLocale} />}
        </Route>
        <Route path='/topics/:topicId'>
          {currentUser ? <MainPage /> : <WelcomePage setLocale={setLocale} />}
        </Route>
        <Route path='/concepts'>
          {currentUser ? <ConceptPage /> : <WelcomePage setLocale={setLocale} />}
        </Route>
        <Route path='/main'>
          {currentUser ? <MainPage /> : <WelcomePage setLocale={setLocale} />}
        </Route>
        {/* Ensure your ProtectedRoute component is redirecting correctly */}
        <ProtectedRoute path='/'>
          {currentUser ? <HomePage /> : <Redirect to='/login' />}
        </ProtectedRoute>
      </Switch>
      <Footer />
    </>
  )
}


export default App
