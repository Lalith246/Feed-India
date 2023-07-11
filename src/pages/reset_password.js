import React, { useReducer } from 'react'
import { Statement } from '../statement'
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth'
import { app } from '../firebase'
const defaultState = {
  oldPass: '',
  newPass: '',
  new2Pass: '',
  statement: '',
  showStatement: false,
  isError: false,
}

const reducer = (state, action) => {
  if (action.type === 'OLD_UPDATE') {
    return { ...state, oldPass: action.payload }
  } else if (action.type === 'NEW_UPDATE') {
    return { ...state, newPass: action.payload }
  } else if (action.type === 'NEW2_UPDATE') {
    return { ...state, new2Pass: action.payload }
  } else if (action.type === 'CLOSE_MSSG') {
    return {
      ...state,
      showStatement: false,
    }
  } else if (action.type === 'SUCCESS') {
    return {
      ...defaultState,
      statement: 'Password changed Successfully!',
      showStatement: true,
    }
  } else if (action.type === 'ERROR') {
    return {
      ...defaultState,
      statement: action.payload,
      showStatement: true,
      isError: true,
    }
  }
}

const ChangePassword = () => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  const closeMessage = () => {
    dispatch({ type: 'CLOSE_MSSG' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = getAuth(app).currentUser

      if (state.newPass !== state.new2Pass) {
        throw new Error('Passwords do not match!')
      }

      if (user) {
        const credential = await reauthenticateWithCredential(
          user,
          EmailAuthProvider.credential(user.email, state.oldPass)
        )
        await updatePassword(user, state.newPass)
        dispatch({ type: 'SUCCESS' })
      } else {
        alert('No authenticated user found')
      }
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message })
    }
  }

  return (
    <div className='loginBox'>
      <center>
        <h1>Change Password</h1>
      </center>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='old'>Old Password: </label>
          <br />
          <input
            type='password'
            value={state.oldPass}
            onChange={(e) =>
              dispatch({ type: 'OLD_UPDATE', payload: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor='new'>New Password: </label>
          <br />
          <input
            type='password'
            value={state.newPass}
            onChange={(e) =>
              dispatch({ type: 'NEW_UPDATE', payload: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor='new'>Re-enter New Password: </label>
          <br />
          <input
            type='password'
            value={state.new2Pass}
            onChange={(e) =>
              dispatch({ type: 'NEW2_UPDATE', payload: e.target.value })
            }
          />
        </div>
        <div>
          <center>
            <button type='submit' className='btn'>
              Submit
            </button>
          </center>
        </div>
      </form>

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
  )
}

export default ChangePassword
