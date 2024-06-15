import React from 'react'
import { Link } from 'react-router-dom'

export default function Cookie() {
  return (
    <>
      <Link to="/home" className="mt-5 ms-5 btn btn-secondary">Volver</Link>
      <div className='complementarias'>
          <h2>Política de Cookies de Booku</h2>
          <h3>1. ¿Qué son las cookies?</h3>
          <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Son ampliamente utilizadas para que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.</p>
          <h3>2. ¿Cómo utilizamos las cookies en Booku?</h3>
          <p>En Booku, utilizamos cookies para mejorar su experiencia en nuestro sitio web, permitir ciertas funciones del sitio, y analizar cómo los visitantes utilizan nuestro sitio. Las cookies nos ayudan a personalizar el contenido y los anuncios, proporcionar funcionalidades de redes sociales y analizar nuestro tráfico.</p>
          <h3>3. Tipos de cookies que utilizamos</h3>
              <ul>
                  <li>Cookies estrictamente necesarias: Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones. Sin estas cookies, no se pueden proporcionar los servicios que ha solicitado.</li>
                  <li>Cookies de rendimiento: Estas cookies recopilan información sobre cómo los visitantes utilizan un sitio web, por ejemplo, qué páginas visitan con más frecuencia. Utilizamos esta información para mejorar el funcionamiento del sitio web.</li>
                  <li>Cookies de funcionalidad: Estas cookies permiten que el sitio web recuerde las elecciones que usted realiza (como su nombre de usuario, idioma o región) y proporcionan características mejoradas y más personales.</li>
                  <li>Cookies de publicidad y marketing: Estas cookies se utilizan para mostrar anuncios que son relevantes para usted y sus intereses. También se utilizan para limitar el número de veces que ve un anuncio, así como para ayudar a medir la efectividad de las campañas publicitarias.</li>
              </ul>
          <h3>4. Cookies de terceros</h3>
          <p>En algunos casos, utilizamos cookies de terceros de confianza. Por ejemplo, utilizamos Google Analytics para ayudarnos a analizar el uso de nuestro sitio. Estas cookies pueden recopilar información sobre sus actividades en línea a lo largo del tiempo y en diferentes sitios web.</p>
          <h3>5. ¿Cómo puede controlar las cookies?</h3>
          <p>Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su ordenador y configurar la mayoría de los navegadores para que no se acepten cookies. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.</p>
          <h3>6. Cambios en nuestra política de cookies</h3>
          <p>Podemos actualizar nuestra Política de Cookies de vez en cuando para reflejar cambios en nuestras prácticas y servicios. Le notificaremos sobre cualquier cambio publicando la nueva Política de Cookies en nuestro sitio web. Le recomendamos que revise esta página periódicamente para estar informado sobre cómo utilizamos las cookies.</p>
          <h3>7. Contacto</h3>
          <p>Si tiene alguna pregunta sobre nuestra Política de Cookies, puede contactarnos en:</p>
              <p>Booku</p>
              <p>Correo electrónico: booku-soporte@gmail.com</p>
      </div>
    </>
  )
}
