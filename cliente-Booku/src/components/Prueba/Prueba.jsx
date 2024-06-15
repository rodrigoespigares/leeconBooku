import React, { useState } from 'react'
import { useParams } from 'react-router-dom';

export default function Prueba() {

  const { check, id } = useParams();

    
  return (
    <div>
        <h1>{check}</h1>
        <h2>{id}</h2>
    </div>
  )
}
