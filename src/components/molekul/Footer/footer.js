import React from 'react'
import { Discord, Facebook, Github, Instagram, LogoWebsite, Telegram, Twitter } from '../../../assets'
import './footer.scss'

const Icon = ({ img }) => {
  return (
    <div className='icon-wrapper'>
      <img className='icon-medsos' src={img} alt='facebook' />
    </div>
  )
}

const Footer = () => {
  return (
    <div>
      <div className='footer'>
        <div>
          <img className='logo' src={LogoWebsite} alt='logo' />
        </div>
        <div className='social-wrapper'>
          <Icon img={Facebook} />
          <Icon img={Twitter} />
          <Icon img={Instagram} />
          <Icon img={Telegram} />
          <Icon img={Discord} />
          <Icon img={Github} />
        </div>
      </div>
      <div className='copyright'>
        <p>copyright</p>
      </div>
    </div>
  )
}

export default Footer
