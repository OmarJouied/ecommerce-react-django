import {useContext, useState} from 'react';
import { share } from '../App/App';
import './Buy.css';

const Buy = () => {
    const context = useContext(share);
    const [select, setSelect]  = context.select;
    const setPath = context.setPath;
    const [input, setInput] = useState('');
    const [url, setUrl] = useState('');
    const setD = context.setD;
    const csrf = context.csrf;
    if ( !select.length ) {
        setPath('/');
    }
    
    function valid() {
        return (url.length > 0 && input.length === 0) || (url.length === 0 && input.length > 0);
    }

    function buy() {
        const form = new FormData();
        form.append('ids', JSON.stringify(select));
        form.append("address", input || url);
        form.append("method", 'PUT');
        fetch('/api/', {
            headers: {
                'X-CSRFToken': csrf
            },
            mode: 'same-origin',
            method: 'POST',
            body: form
        })
            .then(r => r.json())
            .then(r => {
                setD(r);
                if (!r.error) setTimeout(() => {
                    setSelect([]);
                    setPath('/');
                }, 3700);
            })

    }
    const [info, setInfo] = useState('');
    
    const handle = e => {
        if (e.match(/^(https?:\/\/)/) || !e || input) {
            setInfo('');
        } else setInfo('* Start URL with http or https');
        setUrl(e);
    }

    return (
        <div className='buy'>
            <div className='buy__form'>
                <h2>Confirm</h2>
                <div className='buy__form-input'>
                    <input id='address' name='address' required value={input} onChange={e=>setInput(e.target.value)} />
                    <label htmlFor='address'>address</label>
                </div>
                <span>OR</span>
                <div className='buy__form-input'>
                    <input id='gps' name='address' required value={url} onChange={e=>handle(e.target.value)} />
                    <label htmlFor='gps'>GPS URL</label>
                    {
                        info ?
                            <span className='info_url'>{info}</span>
                        :
                            ""
                    }
                </div>
                <input type='submit' value='Buy' onClick={buy} disabled={!valid()} style={{cursor: valid() ? 'pointer':'no-drop'}} />
            </div>
        </div>
    )
}

export default Buy;