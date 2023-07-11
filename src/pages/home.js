import React, { useEffect } from 'react'
import { useState } from 'react'
import PopupWindow from './modal'
import {
  getFirestore,
  getDocs,
  collection,
  query,
  where,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { app } from '../firebase'
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth'
import loadingGif from '../assets/Loading_icon.gif'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FaUserAlt } from 'react-icons/fa'
import user from '../img/user.png'
import edit from '../img/edit.png'
import logout from '../img/log-out.png'

const auth = getAuth(app)

const Home = () => {
  const [hotels, setHotels] = useState([])
  const [hotelPersonalData, setHotelPersonalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dropOpen, setDropopen] = useState(false)

  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore(app)
        const querySnapshot = await getDocs(collection(db, 'hotels'))

        const hotelUsersQuery = query(
          collection(db, 'users'),
          where('category', '==', 'Hotel')
        )
        const querySnapshot2 = await getDocs(hotelUsersQuery)

        const hotelUserIds = []
        querySnapshot.docs.map((doc) => {
          hotelUserIds.push(doc.id)
        })

        const hotelsData = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          ...doc.data(),
        }))

        const personalData = querySnapshot2.docs
          .filter((doc) => hotelUserIds.includes(doc.id) === true)
          .map((doc) => ({
            key: doc.id,
            ...doc.data(),
          }))

        setHotels(hotelsData)
        setHotelPersonalData(personalData)
        setFetched(true)
      } catch (error) {
        setLoading(false)
        alert('Error retrieving Firestore data:' + error)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const [open, setOpen] = React.useState(false)
  const [hotelID, setHotelID] = React.useState(0)

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = (id) => {
    setOpen(true)
    setHotelID(id)
  }

  const handleUserClick = (text) => {
    if (text === 'Edit Profile') {
      window.location.assign(`/edit/${auth.currentUser.email.split('@')[0]}`)
    } else if (text === 'Logout') {
      handleLogout()
    } else if (text === 'Reset Password') {
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

  const findHotel = () => {
    return hotels.filter((hotel) => hotel.key === hotelID)[0]
  }

  const findUser = () => {
    return hotelPersonalData.filter((hotel) => hotel.key === hotelID)[0]
  }

  function DropdownItem(props) {
    return (
      <li className='dropdownItem' onClick={() => handleUserClick(props.text)}>
        <img src={props.img} />
        <a>{props.text}</a>
      </li>
    )
  }

  return !loading ? (
    fetched && hotels.length > 0 && (
      <article>
        <nav className='navBar'>
          <div className='heading'>
            <center>
              <h1>Hotels Nearby</h1>
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
              Lalith Kanakamedala
              <br />
              <span>Website Designer</span>
            </h3>
            <ul>
              <DropdownItem img={user} text='Edit Profile' />
              <DropdownItem img={edit} text='Change Password' />
              <DropdownItem img={logout} text='Logout' />
            </ul>
          </div>
        </nav>
        <section className='hotelList'>
          {hotels.map((hotel, index) => {
            return (
              <div className='item' key={hotel.key}>
                <img src={hotel.hImage} alt='leo' />
                <center>
                  <h3>{hotelPersonalData[index].name}</h3>
                </center>
                <center>
                  <a id={hotel.key} onClick={(e) => handleOpen(e.target.id)}>
                    Tap Here
                  </a>
                </center>
              </div>
            )
          })}
          {open && (
            <PopupWindow
              items={findHotel().hDesc}
              servCap={findHotel().hCap}
              handleClose={handleClose}
              phone={findUser().phone}
              address={findUser().address}
              open={open}
            />
          )}
        </section>
      </article>
    )
  ) : (
    <center>
      <img src={loadingGif} alt='Loading' />
    </center>
  )
}

export default Home
