import React, { useEffect, useRef, useState } from 'react';
import { share } from '../App/App';
import './Main.css';
import Choices from './Choices';
import Product from './Product';

const Main = () => {
    const context = React.useContext(share);
    const [data, ] = context.data;
    const [input, setInput] = useState('');
    const inputRef = React.useRef();
    const catRef = React.useRef();
    const [select, setSelect] = context.select;
    const [show, setShow] = context.show;
    const [login] = context.login;
    const Fetch = context.Fetch;
    const setPath = context.setPath;
    const cat = context.cat;
    const btn = useRef();

    useEffect(_=>{
        if (btn.current) {
            btn.current.click();
        }
    }, [show]);

    function Filter(e) {
        const list = window.location.pathname === '/cart' ? [...(data.filter(i => select.find(j => j.id === i.id)))] : data;
        setShow([...(list.filter(item => item.category === e || e === 'all'))]);
    }

    function check(e, id, min_order) {
        if (!e.target.className.includes('more') && !e.target.closest('.number') && login) {
            e.target.closest('.item').children[0].checked ? setSelect(select.filter(e => e.id !== id)) : setSelect([...select, { id: id, min_order: min_order }]);
        }
    }

    function buy() {
        setPath('/buy');
    }
    function clear() {
        setPath('/');
        setSelect([]);
        setShow([]);
        setInput('');
    }

    return (
        <main className='ecommerce__main'>
            <div className='container'>
                <div className='ecommerce__main-container'>
                    <Choices Filter={Filter} catRef={catRef} />
                    {
                        window.location.pathname !== '/cart' ?
                        (
                        <div className='ecommerce__main-query'>
                            <Choices Filter={Filter} catRef={catRef} className='ecommerce__main-query_options' />
                            <input ref={inputRef} className='ecommerce__main-query_input' value={input} onChange={e=>setInput(e.target.value)} />
                            <i className='fa fa-search'
                                onClick={
                                    _=>{const c = catRef.current.dataset.type === 'error' ? "":Fetch(`${catRef.current.dataset.type === 'all'?"":'category='+catRef.current.dataset.type+'&'}${inputRef.current.value === ''?"":'title='+inputRef.current.value}`)}}></i>
                            { input.length ? (<i className='fa fa-remove' onClick={_=>{setInput(''); inputRef.current.focus()}}></i>) : "" }
                        </div>
                        )
                        : show.length > 0 ?
                        (
                            <div className='btns'>
                                <button style={{"--i": "#ec1227"}} onClick={buy}>Buy Now</button>
                                <button style={{"--i": "#ffc107"}} onClick={clear}>clear cart</button>
                                <p>total: ${select.reduce((i, j) => i + show.find(k => k.id === j.id).price * j.min_order, 0)}</p>
                            </div>
                        ) : ""
                        
                    }
                </div>
                <div className='ecommerce__main-products'>
                    {
                        show.length > 0 && cat.length > 0 ?
                            <>
                                {show.map(item => <Product key={item.id} item={item} check={check} select={select} setSelect={setSelect} />)}
                                <button ref={btn} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 5, padding: '1rem 19.2px', border: 0, cursor: 'pointer', boxShadow: '0 0 5px', borderRadius: '50%' }} onClick={_=>window.scrollTo(0, 0)}><i className='fa fa-arrow-up'></i></button>
                            </>
                        :
                        window.location.pathname !== '/cart' ?
                        (
                            <div className='item p'>No products yet!</div>
                        )
                        :
                        (
                            <div className='item p'>No product choosing!</div>
                        )
                    }
                </div>
            </div>
        </main>
    )
}

export default Main;