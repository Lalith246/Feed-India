import React, { useState, useRef, useReducer } from 'react'
import { doc, updateDoc, getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app } from '../firebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

const auth = getAuth(app)

const defaultState = {
  uploaded: false,
  image: null,
  hName: '',
  hDesc: '',
  hServCap: 0,
}

const reducer = (state, action) => {
  if (action.type === 'IMG_CHANGE') {
    const file = action.payload.target.files[0]

    if (file && file.type.includes('image')) {
      return { ...state, image: file, uploaded: true }
    } else {
      alert('Please upload an image file!')
      return { ...state, image: null, uploaded: false }
    }
  } else if (action.type === 'IMG_REMOVE') {
    return { ...state, image: null, uploaded: false }
  } else if (action.type === 'NAME_CHANGE') {
    return { ...state, hName: action.payload }
  } else if (action.type === 'DESC_CHANGE') {
    return { ...state, hDesc: action.payload }
  } else if (action.type === 'SERV_CHANGE') {
    return { ...state, hServCap: action.payload }
  } else if (action.type === 'SUCCESS') {
    alert('Successfully uploaded the details!')
    return {
      ...state,
      uploaded: false,
      image: null,
      hName: '',
      hDesc: '',
      hServCap: 0,
    }
  }
}

const Upload = () => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const storage = getStorage(app)
      const storageRef = ref(
        storage,
        'hotel_images/image' + new Date().getTime().toString()
      )

      await uploadBytes(storageRef, state.image)
      const downloadURL = await getDownloadURL(storageRef)

      const db = getFirestore(app)
      const userID = auth.currentUser.uid
      await updateDoc(doc(db, 'hotels', userID), {
        hName: state.hName,
        hDesc: state.hDesc,
        hCap: state.hServCap,
        hImage: downloadURL,
      })

      console.log('Image uploaded and Firestore document created successfully.')
      handleSuccess()
    } catch (error) {
      alert('Error uploading image:', error)
    }
  }

  const handleImgChange = (e) => {
    dispatch({ type: 'IMG_CHANGE', payload: e })
    const file = e.target.files[0]
    if (!file || !file.type.includes('image')) {
      fileInputRef.current.value = null
    }
  }

  const handleRemove = () => {
    // setImage(null)
    // setUploaded(false)
    fileInputRef.current.value = null
    dispatch({ type: 'IMG_REMOVE' })
  }

  const handleLogout = () => {
    window.location.assign('/login')
  }

  const handleSuccess = () => {
    fileInputRef.current.value = null
    dispatch({ type: 'SUCCESS' })
  }

  return (
    <article>
      <nav className='navBar'>
        <div className='heading'>
          <center>
            <h1>Upload Details</h1>
          </center>
        </div>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          onClick={handleLogout}
          style={{
            cursor: 'pointer',
            fontSize: '30px',
            margin: 'auto 20px',
          }}
        />
      </nav>
      <section>
        <div className='uploadBox'>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div>
              <label htmlFor='imgInput'>Upload Image:</label>
              <br />
              <input
                type='file'
                id='imgInput'
                // fileName={state.image}
                onChange={(e) => handleImgChange(e)}
                ref={fileInputRef}
                required
              />
            </div>
            {state.uploaded && (
              <div>
                <img
                  src={URL.createObjectURL(state.image)}
                  alt='No Image'
                  id='imgUpload'
                />
                <center>
                  <button
                    type='button'
                    className='removeBtn'
                    onClick={handleRemove}
                  >
                    Remove File
                  </button>
                </center>
              </div>
            )}
            <div>
              <label htmlFor='hotelName'>Hotel Name: </label>
              <br />
              <input
                type='text'
                name='hotelName'
                id='hotelName'
                value={state.hName}
                onChange={(e) =>
                  dispatch({ type: 'NAME_CHANGE', payload: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor='hotelDesc'>Description: </label>
              <br />
              <textarea
                name='hotelDesc'
                id='hotelDesc'
                rows={6}
                cols={30}
                value={state.hDesc}
                onChange={(e) =>
                  dispatch({ type: 'DESC_CHANGE', payload: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor='hotelCap'>Serving Capacity: </label>
              <br />
              <input
                type='number'
                name='hotelCap'
                id='hotelCap'
                value={state.hServCap}
                onChange={(e) =>
                  dispatch({ type: 'SERV_CHANGE', payload: e.target.value })
                }
                min={0}
                required
              />
            </div>
            <div>
              <button type='submit' className='btn'>
                Upload
              </button>
            </div>
          </form>
        </div>
      </section>
    </article>
  )
}

export default Upload
