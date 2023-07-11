import React, { useEffect } from 'react'

export const Statement = (props) => {
  setTimeout(() => {
    props.closeMessage()
  }, 5000)
  return (
    <h4 className='errorMssg' style={{ color: !props.isError && 'green' }}>
      {props.toShow}
    </h4>
  )
}
