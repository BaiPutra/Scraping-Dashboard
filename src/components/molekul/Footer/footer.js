import React from 'react'
import { Discord, Facebook, Github, Instagram, LogoWebsite, Telegram, Twitter } from '../../../assets'

const Icon = ({img}) => {
    return (
        <div>
            <img src={img} alt='facebook' />
        </div>
    )
}

const Footer = () => {
  return (
    <div>
      <div>
        <div>
            <img className='logo' src={LogoWebsite} alt='logo' />
        </div>
        <div>
            <inmg src={Facebook} alt='facebook' />
            <inmg src={Twitter} alt='twitter' />
            <inmg src={Instagram} alt='insagram' />
            <inmg src={Telegram} alt='telegram' />
            <inmg src={Discord} alt='discord' />
            <inmg src={Github} alt='github' />
        </div>
      </div>
      <div>
        <p>copyright</p>
      </div>
    </div>
  )
}

export default Footer
