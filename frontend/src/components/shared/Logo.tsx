//optional tone prop
import LogoStyle from './../../styles/logo.module.css';

interface LogoProps  {
    colour?: 'light' | 'dark';
}

function Logo({ colour = 'dark'}: LogoProps){

    const colourClass = colour === 'light' ? LogoStyle['logo-light']: LogoStyle['logo-dark'];

    return (
        <span className={`${LogoStyle.logo} ${colourClass}`}>
            NEXT<span className={LogoStyle['logo-next-stay']}>STAY</span>
        </span>
    )
}

export default Logo;