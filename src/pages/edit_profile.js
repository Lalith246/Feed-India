import React, { useEffect, useReducer, useState } from 'react'
import { app } from '../firebase'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import PopupWindow2 from './modal_register'

const auth = getAuth(app)

const defaultState = {
  name: '',
  phone: '',
  address: '',
  category: 'Hotel',
  statement: '',
  modalOpen: false,
  error: false,
}

const reduce = (state, action) => {
  if (action.type === 'NAME_UPDATE') {
    return { ...state, name: action.payload }
  } else if (action.type === 'PHONE_UPDATE') {
    return { ...state, phone: action.payload }
  } else if (action.type === 'ADDRESS_UPDATE') {
    return { ...state, address: action.payload }
  } else if (action.type === 'CATEGORY_UPDATE') {
    return { ...state, category: action.payload }
  } else if (action.type === 'CLOSE_MODAL') {
    return { ...state, modalOpen: false, error: false }
  } else if (action.type === 'EXISTS') {
    return {
      ...state,
      name: action.payload.name,
      phone: action.payload.phone,
      address: action.payload.address,
      category: action.payload.category,
      modalOpen: false,
      error: false,
    }
  }
}

const Edit = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const db = getFirestore(app)
        console.log(auth.currentUser)
        const userID = auth.currentUser.uid
        const docSnapshot = await getDoc(doc(db, 'users', userID))
        if (docSnapshot.exists) {
          const data = docSnapshot.data()
          dispatch({ type: 'EXISTS', payload: data })
        } else {
          setLoading(false)
          alert('Document does not exist')
        }
      } catch (error) {
        setLoading(false)
        alert('Error retrieving Firestore data:' + error)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const [state, dispatch] = useReducer(reduce, defaultState)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const db = getFirestore(app)
    const userID = auth.currentUser.uid
    const userEmail = auth.currentUser.email
    const docToUpdate = doc(db, 'users', userID)
    try {
      await updateDoc(docToUpdate, {
        name: state.name,
        phone: state.phone,
        address: state.address,
        category: state.category,
      })
      alert('Details updated successfully!')
      window.location.assign(`../home/hotel/${userEmail.split('@')[0]}`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' })
  }

  return (
    <div>
      <div className='loginBox'>
        <center>
          <h1>Edit Profile</h1>
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
                Submit
              </button>
            </center>
          </div>
        </form>

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
  )
}

export default Edit
