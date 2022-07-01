import React from 'react'
import { RegisterBg } from '../../assets'
import { Gap, Link } from '../../components'
import './detail.scss'
import { useHistory } from 'react-router-dom'

const Detail = () => {
  const history = useHistory();
  return (
    <div className='detail-blog-wrapper' >
      <img className='img-cover' src={RegisterBg} alt='thumb' />
      <p className='title-post'>Title Post</p>
      <p className='author-post'>Author - Date Post</p>
      <p className='body-post'>Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.</p>
      <Gap height={20} />
      <Link title='kembali ke Home' onClick={() => history.push('/')} />
    </div>
  )
}

export default Detail
