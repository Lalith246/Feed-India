import React, { useState, useRef, useReducer, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/bg_img.jpg'
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore'
import { getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app } from '../firebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faL, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FaUserAlt } from 'react-icons/fa'
import { BsPlus } from 'react-icons/bs'
import { BiMinus } from 'react-icons/bi'
import loadingGif from '../assets/Loading_icon.gif'
import user from '../img/user.png'
import edit from '../img/edit.png'
import logout from '../img/log-out.png'
import hotel from '../img/hotel.png'
import axios from 'axios'
import { Password } from '@mui/icons-material'

const auth = getAuth(app)

const defaultState = {
  uploaded: false,
  image: null,
  hDesc: [],
  hServCap: 0,
  item: '',
  quantity: 0,
  imgSRC: '',
  errorStatement: '',
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
    return { ...state, image: null, uploaded: false, imgSRC: '' }
  } else if (action.type === 'ITEM_CHANGE') {
    return { ...state, item: action.payload }
  } else if (action.type === 'ERROR_ITEM') {
    return { ...state, errorStatement: 'Please enter valid name and quantity' }
  } else if (action.type === 'ERROR_HDESC') {
    return { ...state, errorStatement: 'Please enter atleast one food item' }
  } else if (action.type === 'QUANT_CHANGE') {
    return { ...state, quantity: action.payload }
  } else if (action.type === 'ADD_ITEM') {
    return {
      ...state,
      hDesc: [
        ...state.hDesc,
        { item: action.payload.item, quantity: action.payload.quantity },
      ],
      item: '',
      quantity: 0,
    }
  } else if (action.type === 'REMOVE_ITEM') {
    const updatedList = state.hDesc.filter((item, i) => i !== action.payload)
    return { ...state, hDesc: updatedList }
  } else if (action.type === 'DESC_CHANGE') {
    return { ...state, hDesc: action.payload }
  } else if (action.type === 'SERV_CHANGE') {
    return { ...state, hServCap: action.payload }
  } else if (action.type === 'SUCCESS' || action.type === 'ERROR') {
    return {
      ...state,
      uploaded: false,
      image: null,
      hDesc: '',
      hServCap: 0,
      imgSRC: '',
      item: '',
      quantity: 0,
      errorStatement: '',
    }
  } else if (action.type === 'USER_EXISTS') {
    return {
      ...state,
      uploaded: false,
      image: '',
      hDesc: action.payload.hDesc,
      hServCap: action.payload.hCap,
      imgSRC: action.payload.hImage,
    }
  }
}

const Upload2 = () => {
  const [state, dispatch] = useReducer(reducer, defaultState)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dropOpen, setDropopen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const setNameEmail = async () => {
    const db = getFirestore(app)
    const userID = auth.currentUser.uid
    const docRef = doc(db, 'users', userID)
    const docSnapshot = await getDoc(docRef)
    setName(docSnapshot.data().name)
    setEmail(docSnapshot.data().email)
  }

  useEffect(() => {
    setLoading(true)
    setNameEmail()
    setLoading(false)
  }, [])

  const fileInputRef = useRef(null)

  function DropdownItem(props) {
    return (
      <li className='dropdownItem' onClick={() => handleUserClick(props.text)}>
        <img src={props.img} />
        <a>{props.text}</a>
      </li>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (state.hDesc.length == 0) {
        setLoading(false)
        dispatch({ type: 'ERROR_HDESC' })
        setIsError(true)
        setTimeout(() => {
          setIsError(false)
        }, 3000)
      } else {
        if (state.imgSRC === '') {
          const storage = getStorage(app)
          const storageRef = ref(
            storage,
            'hotel_images/image' + new Date().getTime().toString()
          )
          await uploadBytes(storageRef, state.image)
          const downloadURL = await getDownloadURL(storageRef)
          const db = getFirestore(app)
          const userID = auth.currentUser.uid
          await setDoc(doc(db, 'hotels', userID), {
            hDesc: state.hDesc,
            hCap: state.hServCap,
            hImage: downloadURL,
          })
        } else {
          const db = getFirestore(app)
          const userID = auth.currentUser.uid
          await setDoc(doc(db, 'hotels', userID), {
            hDesc: state.hDesc,
            hCap: state.hServCap,
            hImage: await (await getDoc(doc(db, 'hotels', userID))).data()
              .hImage,
          })
        }

        console.log(
          'Image uploaded and Firestore document created successfully.'
        )
        alert('Successfully uploaded the details!')
        handleSuccess()
      }
    } catch (error) {
      setLoading(false)
      alert('Error uploading details:' + error.message)
      console.error(error)
      dispatch({ type: 'ERROR' })
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
    fileInputRef.current.value = null
    dispatch({ type: 'IMG_REMOVE' })
  }

  const handleLogout = () => {
    const auth = getAuth()
    signOut(auth)
      .then(() => {
        alert('Successfully Logged Out!!')
      })
      .catch((error) => {
        alert('Unable to logout due to the foloowing error, ' + error + '!')
      })
    window.location.assign('/login')
  }

  const handleSuccess = () => {
    setLoading(false)
    dispatch({ type: 'SUCCESS' })
  }

  const handleUserClick = (clickedBtn) => {
    if (clickedBtn === 'Edit Food Details') {
      checkHotelExists()
    } else if (clickedBtn === 'Logout') {
      handleLogout()
    } else if (clickedBtn === 'Edit Profile') {
      window.location.assign(`/edit/${auth.currentUser.email.split('@')[0]}`)
    } else if (clickedBtn === 'Reset Password') {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        sendPasswordResetEmail(auth, user.email)
          .then(() => {
            alert('Please check your email and reset your password!')
            signOut(auth)
              .then(() => {
                alert('Please login again!')
              })
              .catch((error) => {
                alert(
                  'Unable to logout due to the foloowing error, ' +
                    error.message +
                    '!'
                )
              })
            window.location.assign('/login')
          })
          .catch((error) => {
            alert('An error occurred. Please try again: ' + error.message)
          })
      } else {
        alert('No authenticated user found')
      }
    }
  }

  const checkHotelExists = async () => {
    setLoading(true)
    try {
      const db = getFirestore(app)
      const userID = auth.currentUser.uid
      const docRef = doc(db, 'hotels', userID)
      const docSnapshot = await getDoc(docRef)
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()
        console.log(userID)
        dispatch({ type: 'USER_EXISTS', payload: data })
        setLoading(false)
        setDropopen(false)
      } else {
        setLoading(false)
        setDropopen(false)
        alert('No existing details to edit. Please upload new details!')
      }
    } catch (error) {
      setLoading(false)
      setDropopen(false)
      console.error('Error fetching document data: ', error)
    }
  }

  const addItemList = (item, quantity) => {
    if (item === '' || quantity === 0) {
      dispatch({ type: 'ERROR_ITEM' })
      setIsError(true)
      setTimeout(() => {
        setIsError(false)
      }, 3000)
    } else {
      dispatch({
        type: 'ADD_ITEM',
        payload: { item: item, quantity: quantity },
      })
    }
  }

  const handleRemoveItem = (item) => {
    dispatch({ type: 'REMOVE_ITEM', payload: item })
  }

  return !loading ? (
    <article>
      <nav className='navBar'>
        <div className='heading'>
          <center>
            <h1>Upload Details</h1>
          </center>
        </div>
        <div className='menu-trigger'>
          <button
            onClick={() => {
              setDropopen(!dropOpen)
            }}
            style={{
              cursor: 'pointer',
              fontSize: '30px',
              margin: 'auto 20px',
              color: 'white',
              backgroundColor: 'orangered',
              border: '0px',
            }}
          >
            <FaUserAlt />
          </button>
        </div>
        <div className={`dropdown-menu ${dropOpen ? 'active' : 'inactive'}`}>
          <h3>
            {name}
            <br />
            <span>{email}</span>
          </h3>
          <ul>
            <DropdownItem img={user} text='Edit Profile' />
            <DropdownItem img={hotel} text='Edit Food Details' />
            <DropdownItem img={edit} text='Reset Password' />
            <DropdownItem img={logout} text='Logout' />
          </ul>
        </div>
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
                onChange={(e) => handleImgChange(e)}
                ref={fileInputRef}
                required={state.imgSRC === ''}
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
            {state.imgSRC !== '' && (
              <div>
                <img src={state.imgSRC} alt='No Image' id='imgUpload' />
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
              <label htmlFor='hotelDesc'>Add Food Items: </label>
              <br />
              <table>
                {state.hDesc.length > 0 && (
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Remove</th>
                  </tr>
                )}
                {state.hDesc.length > 0 &&
                  state.hDesc.map((foodItem, index) => {
                    return (
                      <tr className='addedList' key={index}>
                        <td>
                          <h5>{foodItem.item}</h5>
                        </td>
                        <td>
                          <h5>{foodItem.quantity}</h5>
                        </td>
                        <td>
                          <BiMinus
                            type='button'
                            onClick={() => handleRemoveItem(index)}
                            style={{
                              color: 'white',
                              fontSize: '20px',
                              cursor: 'pointer',
                              backgroundColor: 'red',
                              borderRadius: '50%',
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
              </table>
              <div className='foodItem'>
                <input
                  type='text'
                  value={state.item}
                  onChange={(e) =>
                    dispatch({
                      type: 'ITEM_CHANGE',
                      payload: e.target.value,
                    })
                  }
                  className='itemInput'
                />
                <pre> - </pre>
                <input
                  type='number'
                  min={0}
                  className='itemInput'
                  value={state.quantity}
                  onChange={(e) =>
                    dispatch({ type: 'QUANT_CHANGE', payload: e.target.value })
                  }
                />
              </div>
              {isError && (
                <div>
                  <h4 className='errorMssg'>{state.errorStatement}</h4>
                </div>
              )}
              <center>
                <BsPlus
                  type='button'
                  onClick={() => addItemList(state.item, state.quantity)}
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    backgroundColor: 'blue',
                    borderRadius: '50%',
                  }}
                />
              </center>
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
  ) : (
    <center>
      <img src={loadingGif} alt='Wait...' />
    </center>
  )
}

export default Upload2
