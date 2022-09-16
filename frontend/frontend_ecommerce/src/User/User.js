import { useContext, useEffect, useState } from 'react';
import Auth from './Auth';
import { share } from "../App/App";
import './User.css';
import Show from './Show';


function User() {
    const [show, setShow] = useState();
    const signin = useContext(share).login[0];
    const p = useContext(share).path;
    useEffect(() => {
        if (p === '/user') {
            setShow(undefined);
        } else if (p.match(/\/user\/products(?:\/(?:add\/?)?)?/)) {
            setShow(true);
        } else if (p.match(/\/user\/history\/?/)) {
            setShow(false);
        }
    }, [p]);

    useEffect(_=>{
        const path = window.location.pathname.split('/').slice(1, -1)[1];
        if (path === 'products') {
            setShow(true);
        } else if (path === 'history') {
            setShow(false);
        } else if (path) {}
    }, []);

    return (
        <div className='user'>
            <div className='container'>
                {
                    signin ?
                            show !== undefined ?
                                <Show show={show} setShow={setShow} />
                            :
                                <div className='ecommerce__main-products'>
                                    <div className='item' onClick={_ => setShow(false)}>History</div>
                                    <div className='item' onClick={_ => setShow(true)}>Products</div>
                                </div>
                    :
                        <Auth />
                }
            </div>
        </div>
    )
}

export default User;