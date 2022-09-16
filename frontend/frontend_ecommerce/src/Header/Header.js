import { useContext, useState, useEffect } from 'react';
import './Header.css';
import { share } from '../App/App';

const Header = () => {
    const context = useContext(share);
    const yes = context.select[0];
    const login = context.login[0];
    const setD = context.setD;
    const setLogin = context.login[1];
    const setSuperUser = context.superUser[1];
    const [length, setLength] = context.length;

    const count = () => {
        if (login) {
            fetch('/api/email/?count=1')
            .then(r=>r.json())
            .then(r=>setLength(r.count));
        }
    }

    useEffect(count, [login]);
    

    const logout = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('method', 'PUT');
        data.append('out', true);
        fetch('/api/log', {
            method: 'POST',
            body: data
        })
        .then(r => r.json())
        .then(r => { if (!r.error) {setLogin(false); setSuperUser(false);} return setD(r) })
        .catch(e => console.log(e));
    }

    return (
        <header className="ecommerce__header">
            <div className="container">
                <div className="ecommerce__header-logo">
                    <a href="/" title="home" data-link className="ecommerce__header-logo_link"><i className="fa fa-shop"></i></a>
                </div>
                <nav className="ecommerce__header-nav">
                    {
                        login ?
                            <>
                                <a href="/contact" data-link className="ecommerce__header-nav_link" title={length > 0 ? 'new messages' : 'contact us'}>
                                    <i className="fa fa-message" style={{"--clr": length > 0 ? "#ffe033" : "o"}}></i>
                                </a>
                                <a href="/cart" data-link className="ecommerce__header-nav_link" title={yes.length ? 'items selected' : 'cart'}>
                                    <i className="fa fa-shopping-cart" style={{'--clr': yes.length ? 'var(--main-clr)' : 'transparent'}}></i>
                                </a>
                            </>
                        :
                            ""
                    }
                    <a href="/user" data-link className="ecommerce__header-nav_profile" title='user' >
                        <i className="fa fa-user"></i>
                        {
                            login === true && <div className='logout' title='logout' onClick={logout}>
                                <i className='fa-sign-out fa'></i>
                            </div>
                        }
                    </a>
                </nav>
            </div>
        </header>
    )
}

export default Header;