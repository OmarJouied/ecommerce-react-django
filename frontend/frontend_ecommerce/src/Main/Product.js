import { useContext, useState } from "react";
import {share} from '../App/App';

const Product = ({ item, setItem, select, check, setSelect, setData, setForm }) => {
    const [num, setNum] = useState(item.min_order);
    let selected = 0;
    if (select) {
        selected = select.find(i => i.id === item.id);
    }
    const setD = useContext(share).setD;
    const cat = useContext(share).cat;
    const csrf = useContext(share).csrf;
    const [show, setShow] = useState(true);
    const [ele, setEle] = useState('');
    let counter = '';
    const category = cat.find(i => i[0] === item.category);
    const handleMin = e => {
        const value = e.target.value < item.min_order ? item.min_order : e.target.value > item.piece ? item.piece : +e.target.value;
        setNum(value);
        setSelect(select.map(i => {
            if (i.id === item.id) i.min_order = value;
            return i;
        }))
    }

    const deleteProduct = (e, id) => {
        e.target.classList.toggle('active');
        if (e.target.className.includes('active')) {
            e.target.innerText = 'cancel';
            counter = setTimeout(() => {
                const form = new FormData();
                if(item.owner){
                form.append('method', 'DELETE');
                form.append('id', id);}
                fetch(`/api/${item.owner ?'':'history/'}`, {
                    headers: {
                        'X-CSRFToken': csrf
                    },
                    mode: 'same-origin',
                    method: item.owner ? 'POST':'DELETE',
                    body: item.owner ? form : JSON.stringify({id})
                }).then(r => r.json())
                .then(r => {
                    setD(r);
                    if (!r.error) {
                        setShow(item.owner?false:true);
                        setData(p => p.filter(i => i.id !== id));
                    } else {
                        e.target.innerText = 'delete';
                        e.target.classList.remove('active');
                    }
                });
            }, 5000);
        } else {
            clearTimeout(counter);
            e.target.innerText = 'delete';
        }
    }

    const editProduct = () => {
        setItem(item);
        setForm(true);
    }

    const clicked = e => {
        e.classList.toggle('active');
        if (e.className.includes('active')) {
            setEle(true);
        } else {
            setEle(false);
        }
    }

    // console.log(selected);

    return (
        <>
            {
                show ?
                <div id={category[0]} className={`item ${selected ? "active" : ""}`} onClick={e => item.owner || item.main_owner ? "" : check(e, item.id, num)}>
                    {!item.main_owner && !item.owner && <><input type="checkbox" id="choise" checked={selected ?? false} />
                        <label htmlFor="choise"></label></>}
                    <div className='img'>
                        {
                            item.image?.map(img => <img key={img} src={img} alt={`${item.title} image`} />)
                        }
                    </div>
                    <div className='arrow'>
                        <span className='right'></span>
                        <span className='left'></span>
                    </div>
                    <div className='info'>
                        <span className='title'>{item.title}:</span><span className='price'>${item.price}</span>
                    {
                        item.owner || ele ?
                            <>
                                    <p className='min-order'><span>min order:</span>{item.min_order}{item.unit}</p>
                                    <p className='piece'><span>rest:</span>{item.piece}{item.unit}</p>
                                    <p className='category'><span>category:</span>{category[1]}</p>
                                    <p className='unit'><span>unit:</span>{item.unit}</p>
                                    <p className='count'><span>Times To Buy:</span>{item.count}</p>
                                    {item.count > 0 && item.clients && <div className='clients'>
                                        <span>clients:</span>
                                        {
                                            [...(new Set(item.clients))].map(client => <a href={`/user/${client}`}>{client}</a>)
                                        }
                                    </div>}
                                    <p className="time"><span>Added Date:</span>{item.datetime}</p>
                            </>
                            :
                            <>
                                {
                                    window.location.pathname === '/cart' &&
                                    <label className='number'><span>Piece Number:</span><input type='number' value={num} onBlur={handleMin} onChange={e=>setNum(+e.target.value)} style={{ width: `${("" + item.piece).length + 5}ch` }} /></label>
                                }
                            </>
                    }
                    {item.main_owner && <><p className="time"><span>Your Order:</span>{item.order}{item.unit}</p><p className="time"><span>Purchases Date:</span>{item.datetime}</p>
                    <span>Product Owner:</span> <a href={`/user/${item.main_owner}`}>{item.main_owner}</a></>}
                    <span>description:</span><p className='description'>{item.description}</p>
                    {(item.owner || item.main_owner) && <div className='btn'>
                        {item.owner &&<button className='edit' onClick={editProduct}>edit</button>}
                        <button className='delete' onClick={e => deleteProduct(e, item.id)}>delete</button>
                    </div>}
                    </div>
                    {!item.main_owner && !item.owner && <div className='more' onClick={e => clicked(e.target)}>read {ele ? 'less':'more'}</div>}
                </div>
                :
                <></>
            }
        </>
    )
}

export default Product;