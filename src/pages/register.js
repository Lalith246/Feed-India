import React, { useReducer, useState } from 'react'
import { Statement } from '../statement'
import Modal from 'react-modal'
import { Link, useSearchParams } from 'react-router-dom'
import loadingGif from '../assets/Loading_icon.gif'

import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import {
  collection,
  getFirestore,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore'
import { app } from '../firebase'
import PopupWindow2 from './modal_register'

const auth = getAuth(app)

const phoneno = /^\d{10}$/

const defaultState = {
  name: '',
  email: '',
  pass: '',
  passConfirm: '',
  statement: '',
  phone: '',
  address: '',
  error: false,
  category: 'Hotel',
  modalOpen: false,
}

const reduce = (state, action) => {
  if (action.type === 'NAME_UPDATE') {
    return { ...state, name: action.payload }
  } else if (action.type === 'EMAIL_UPDATE') {
    return { ...state, email: action.payload }
  } else if (action.type === 'PASS_UPDATE') {
    return { ...state, pass: action.payload }
  } else if (action.type === 'PASS2_UPDATE') {
    return { ...state, passConfirm: action.payload }
  } else if (action.type === 'PHONE_UPDATE') {
    return { ...state, phone: action.payload }
  } else if (action.type === 'ADDRESS_UPDATE') {
    return { ...state, address: action.payload }
  } else if (action.type === 'CATEGORY_UPDATE') {
    return { ...state, category: action.payload }
  } else if (action.type === 'SUCCESS') {
    return {
      ...state,
      name: '',
      email: '',
      pass: '',
      passConfirm: '',
      phone: '',
      address: '',
      statement: '',
      category: 'Hotel',
    }
  } else if (action.type === 'SUCCESS_MODAL') {
    return {
      ...state,
      statement: 'Registered Successfully! Please click here to ',
      modalOpen: true,
    }
  } else if (action.type === 'FAIL_MODAL') {
    return {
      ...state,
      statement: action.payload,
      error: true,
      modalOpen: true,
    }
  } else if (action.type === 'CLOSE_MODAL') {
    return { ...state, modalOpen: false, error: false }
  }
}

export const Register = () => {
  const [state, dispatch] = useReducer(reduce, defaultState)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (state.pass !== state.passConfirm) {
        throw new Error('Passwords do not match')
      }
      if (state.phone.match(phoneno)) {
        createUserWithEmailAndPassword(auth, state.email, state.pass)
          .then((value) => {
            const db = getFirestore(app)
            const userID = value.user.uid
            const addCategory = async () => {
              await setDoc(doc(db, 'users', userID), {
                category: state.category,
                name: state.name,
                email: state.email,
                phone: state.phone,
                address: state.address,
              })
            }

            // const addPhoneAdd = async () => {
            //   await setDoc(doc(db, 'hotels', userID), {
            //     hPhone: state.phone,
            //     hAddress: state.address,
            //     uId: userID,
            //     hId: new Date().getTime().toString(),
            //     hEmail: state.email,
            //   })
            // }
            // if (state.category === 'Hotel') {
            //   addPhoneAdd().catch((error) => {
            //     dispatch({ type: 'FAIL_MODAL', payload: error.message })
            //   })
            // }

            addCategory()
              .then((value) => {
                dispatch({ type: 'SUCCESS' })
                dispatch({ type: 'SUCCESS_MODAL' })
                setLoading(false)
              })
              .catch((error) => {
                dispatch({ type: 'FAIL_MODAL', payload: error.message })
                setLoading(false)
              })
          })
          .catch((error) => {
            dispatch({ type: 'FAIL_MODAL', payload: error.message })
            setLoading(false)
          })

        // 1. Add the category selected to users collection and corresponding UID.

        // 2. If the user registered as hotel, add the phone and address to the hotels collection and corresponding UID.
      } else {
        throw new Error('Please enter a valid phone number!')
      }
    } catch (Error) {
      dispatch({ type: 'FAIL_MODAL', payload: Error.message })
      setLoading(false)
    }
  }

  return !loading ? (
    <div style={{ height: '970px' }}>
      <div className='registerBox'>
        <center>
          <h1>Register</h1>
        </center>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor='name'>Name: </label>
            <br />
            <input
              type='text'
              value={state.name}
              onChange={(e) =>
                dispatch({ type: 'NAME_UPDATE', payload: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor='email'>Email: </label>
            <br />
            <input
              type='email'
              value={state.email}
              onChange={(e) =>
                dispatch({ type: 'EMAIL_UPDATE', payload: e.target.value })
              }
              required
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
              required
            />
          </div>
          <div>
            <label htmlFor='pass'>Confirm Password: </label>
            <br />
            <input
              type='password'
              value={state.passConfirm}
              onChange={(e) =>
                dispatch({ type: 'PASS2_UPDATE', payload: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor='phone'>Phone: </label>
            <br />
            <input
              type='text'
              value={state.phone}
              onChange={(e) =>
                dispatch({ type: 'PHONE_UPDATE', payload: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor='address'>Address: </label>
            <br />
            <input
              type='text'
              value={state.address}
              onChange={(e) =>
                dispatch({ type: 'ADDRESS_UPDATE', payload: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor='category'>Category: </label>
            <br />
            <select
              name='category'
              id='category'
              value={state.category}
              onChange={(e) =>
                dispatch({
                  type: 'CATEGORY_UPDATE',
                  payload: e.target.value,
                })
              }
            >
              <option value='Hotel'>Hotel</option>
              <option value='NGO'>NGO</option>
            </select>
          </div>
          <div>
            <center>
              <button type='submit' className='btn'>
                Register
              </button>
            </center>
          </div>
        </form>

        <div>
          <center>
            <p>
              Already have an account? Sign in <Link to='/login'>here</Link>.
            </p>
          </center>
        </div>

        {state.modalOpen && (
          <PopupWindow2
            modalOpen={state.modalOpen}
            handleClose={handleClose}
            statement={state.statement}
            isError={state.error}
          />
        )}
      </div>
    </div>
  ) : (
    <center>
      <img src={loadingGif} alt='Wait...' />
    </center>
  )
}
