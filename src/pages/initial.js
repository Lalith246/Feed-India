import React from 'react'
import logo from '../assets/bg_img.jpg'

import { Link } from 'react-router-dom'

const Initial = () => {
  return (
    <div className='initialPage'>
      <div>
        <center>
          <img src={logo} alt='No Image' id='logoImg' />
        </center>
      </div>
      <div>
        <center>
          <Link to='/login' className='btn'>
            Login
          </Link>
        </center>
      </div>
      <br />
      <br />
      <div>
        <center>
          <Link to='/register' className='btn'>
            Register
          </Link>
        </center>
      </div>
    </div>
  )
}

export default Initial
