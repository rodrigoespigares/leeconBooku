import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
export default function Error() {
  return (
    <div id='error'>
      <p className='error'>404</p>
      <p><span>¡Oops!</span> Parece que <b>Booku</b> ha salido corriendo al ver esta ruta</p>
      <Link className='link' to="/"><Icon icon="mingcute:left-line" /> VOLVER</Link>
    </div>
  )
}
