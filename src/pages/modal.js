import React, { useState } from 'react'
import Modal from 'react-modal'

const PopupWindow = (props) => {
  const [contactClicked, setContactClicked] = useState(false)

  const handleClick = () => {
    setContactClicked(true)
  }

  return (
    <div>
      <Modal
        isOpen={props.open}
        onRequestClose={props.handleClose}
        ariaHideApp={false}
        className={'mymodal'}
        style={{
          position: 'absolute',
          border: '2px solid #000',
          backgroundColor: 'gray',
          boxShadow: '2px solid black',
          height: 40,
          width: 100,
          margin: 'auto',
        }}
      >
        <button className='close-button' onClick={props.handleClose}>
          X
        </button>
        <h1>Food Items</h1>
        <table>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
          {props.items.map((itemIter, index) => (
            <tr key={index}>
              <td>
                <h4>{itemIter.item}</h4>
              </td>
              <td>
                <h4>{itemIter.quantity}</h4>
              </td>
            </tr>
          ))}
        </table>
        {!contactClicked ? (
          <button className='btn' onClick={handleClick}>
            Contact
          </button>
        ) : (
          <div>
            <center>
              <h3 style={{ marginBottom: '0px', color: 'orangered' }}>
                {props.address}
              </h3>
              <h4 style={{ marginTop: '0px', color: 'orangered' }}>
                {props.phone}
              </h4>
            </center>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PopupWindow
