import { useContext, useEffect, useState } from 'react';
import { share } from "../App/App";
import Products from './Products';
import Form from './Form';
import Back from '../Contact/Back';

function Show({ show, setShow }) {
    const [data, setData] = useState([]);
    const [item, setItem] = useState();
    const [form, setForm] = useState(false);
    const setPath = useContext(share).setPath;
    const path = useContext(share).path;
    const setD = useContext(share).setD;

    useEffect(_ => {
        if (path.match(/\/user\/products\/add\/?/)) {
            setForm(true);
            return;
        } else if (path.match(/^\/user\/products\/?$/)) {
            setForm(false)
        }
        if (!data.length) {
            const t = show ? `?see=''` : 'history/';
            setPath(`/user/${show?'products':'history'}/`);
            fetch(`/api/${t}`)
            .then(r=>r.json())
            .then(r=> {
                if (r.error) setD(r);
                return setData(r);
            })
        }
    }, [path]);

    const click = () => {
        setPath('/user/products/add');
        setForm(true);
    }
    if (!form && item) {
        setItem(undefined);
    }

    return (
        <div className='User__header'>
            {
                form ? <Form setForm={setForm} setShow={setShow} setData={setData} item={item} setItem={setItem} />
            :
                <><div className='User__header-content'>
                    <p>{data?.length} products</p>
                    {show&&<button onClick={click}>
                        add product
                        <i className='fa fa-plus'></i>
                    </button>}
                </div>
                <Products array={data} setData={setData} setForm={setForm} setItem={setItem} />
                <Back back={_=>{setPath('/user');setShow(undefined)}} />
                </>
            }
        </div>
    )
}

export default Show