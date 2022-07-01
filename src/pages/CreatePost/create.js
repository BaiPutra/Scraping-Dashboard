import React from 'react'
import { Button, Gap, Input, TextArea, Upload, Link } from '../../components'
import './create.scss'
import { useHistory } from 'react-router-dom'

const Create = () => {
  const history = useHistory();
  return (
    <div className='blog-post'>
      <Link title='kembali' onClick={() => history.go('/')} />
      <p className='title'>Create New Blog Post</p>
      <Input label='Post Title' />
      <Upload />
      <TextArea />
      <Gap height={20} />
      <div className='button-action'>
        <Button title='save' />
      </div>
    </div>
  )
}

export default Create
