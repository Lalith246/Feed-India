import React, { useState, useReducer } from 'react'
import { Statement } from '../statement'
import { Link } from 'react-router-dom'
import {
  getAuth,
  signInWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '../firebase'
import loadingGif from '../assets/Loading_icon.gif'

const defaultState = {
  email: '',
  pass: '',
  statement: '',
  showStatement: false,
  isError: false,
}

const reduce = (state, action) => {
  if (action.type === 'EMAIL_UPDATE') {
    return { ...state, email: action.payload }
  } else if (action.type === 'PASS_UPDATE') {
    return { ...state, pass: action.payload }
  } else if (action.type === 'INCORRECT_CRED') {
    return {
      ...state,
      email: '',
      pass: '',
      statement: action.payload,
      showStatement: true,
      isError: true,
    }
  } else if (action.type === 'CLOSE_MSSG') {
    return {
      ...state,
      showStatement: false,
    }
  } else if (action.type === 'SUCCESS') {
    return {
      ...state,
      email: '',
      pass: '',
      openModal: false,
      statement: '',
      showStatement: false,
    }
  }
}

export const Login = () => {
  const [state, dispatch] = useReducer(reduce, defaultState)
  const [loading, setLoading] = useState(false)

  const auth = getAuth()

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)

    setPersistence(auth, browserSessionPersistence)
      .then(async () => {
        return await signInWithEmailAndPassword(auth, state.email, state.pass)
          .then(async (value) => {
            const db = getFirestore(app)
            const userID = auth.currentUser.uid
            const userData = (await getDoc(doc(db, 'users', userID))).data()
            if (userData.category === 'Hotel') {
              window.location.assign(`home/hotel/${state.email.split('@')[0]}`)
            } else {
              window.location.assign(`home/ngo/${state.email.split('@')[0]}`)
            }
            dispatch({ type: 'SUCCESS' })
          })
          .catch((error) => {
            setLoading(false)
            dispatch({ type: 'INCORRECT_CRED', payload: error.message })
          })
      })
      .catch((error) => {
        alert('Error: ' + error)
      })

    // setLoading(false)
  }

  const closeMessage = () => {
    dispatch({ type: 'CLOSE_MSSG' })
  }

  return !loading ? (
    <div className='loginBox'>
      <center>
        <h1>Login</h1>
      </center>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='email'>Email: </label>
          <br />
          <input
            type='email'
            value={state.email}
            onChange={(e) =>
              dispatch({ type: 'EMAIL_UPDATE', payload: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor='pass'>Password: </label>
          <br />
          <input
            type='password'
            value={state.pass}
            onChange={(e) =>
              dispatch({ type: 'PASS_UPDATE', payload: e.target.value })
            }
          />
        </div>
        <div>
          <center>
            <button type='submit' className='btn'>
              Login
            </button>
          </center>
        </div>
      </form>
      <div>
        <center>
          <p>
            Don't have an account? Sign up <Link to='/register'>here</Link>.
          </p>
        </center>
      </div>
      <div>
        {state.showStatement && (
          <center>
            <Statement
              toShow={state.statement}
              closeMessage={closeMessage}
              isError={state.isError}
            />
          </center>
        )}
      </div>
    </div>
  ) : (
    <center>
      <img src={loadingGif} alt='Loading' />
    </center>
  )
}
