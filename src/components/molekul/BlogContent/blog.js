import React from 'react'
import { RegisterBg } from '../../../assets'
import './blog.scss'
import { Button, Gap } from '../../atoms'
import { useHistory } from 'react-router-dom'

const Blog = () => {
    const history = useHistory();
    return (
        <div className='blog-item'>
            <img className='image-thumb' src={RegisterBg} alt='post' />
            <div className='content-detail'>
                <p className='title'>Title Blog</p>
                <p className='author'>Author - Date post</p>
                <p className='body'>Lorem ipsum, atau ringkasnya lipsum, adalah teks standar yang ditempatkan untuk mendemostrasikan elemen grafis atau presentasi visual seperti font, tipografi, dan tata letak.</p>
                <Gap height={20} />
                <Button title='View Detail' onClick={() => history.push('detail-post')} />
            </div>
        </div>
    )
}

export default Blog
