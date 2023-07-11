import React from 'react'
import Modal from 'react-modal'
import { Link } from 'react-router-dom'

const PopupWindow2 = (props) => {
  return (
    <div>
      <Modal
        isOpen={props.modalOpen}
        onRequestClose={props.handleClose}
        ariaHideApp={false}
      >
        <button className='close-button' onClick={props.handleClose}>
          X
        </button>
        <h4 style={props.isError ? { color: 'red' } : { color: 'black' }}>
          {props.statement} {!props.isError && <Link to='/login'>login</Link>}
        </h4>
        {console.log(props.statement)}
      </Modal>
    </div>
  )
}

export default PopupWindow2
