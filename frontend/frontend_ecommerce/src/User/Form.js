import {  useContext, useState } from 'react';
import { share } from '../App/App';
import Back from '../Contact/Back';

function Form({ item, setForm, setData }) {
    const setD = useContext(share).setD;
    const list = useContext(share).cat;
    const csrf = useContext(share).csrf;
    const setPath = useContext(share).setPath;
    const [data1, setData1] = useState({
        id: item?.id ?? '',
        file: '',
        title: item?.title ?? '',
        category: item?.category ?? 'fr',
        price: item?.price ?? '',
        piece: item?.piece ?? '',
        description: item?.description ?? '',
        min_order: item?.min_order ?? '',
        unit: item?.unit ?? 'kg',
    });
    const handleSubmit = e => {
        e.preventDefault();
        console.log(data1);

        const form = new FormData();
        if (item) {
            if (data1.file === '' && data1.title === item.title && data1.category === item.category && data1.price === item.price && data1.piece === item.piece && data1.description === item.description && data1.min_order === item.min_order && data1.unit === item.unit) return;
            form.append("id", data1.id);
            form.append("method", 'PUT');
        }
        form.append("title", data1.title);
        form.append("category", data1.category);
        form.append("price", data1.price);
        form.append("piece", data1.piece);
        form.append("description", data1.description);
        form.append("min_order", data1.min_order);
        form.append("unit", data1.unit);
        for (const f of data1.file) {
            form.append('image', f);
        }

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
            if (!r.error) {
                if (item) {
                    setData(d => {
                        return d.map(i => {
                            if (i.id === item.id) {
                                i = {...i,
                                    ...data1,
                                    ...(data1.file !== '' && {image: r.image}),
                                    datetime: r.datetime
                                };
                            }
                            console.log(i);
                            return i;
                        });
                    });
                    setForm(false);
                    setPath('/user/products/');
                } else {
                    setData(d => {
                        d.unshift({
                            ...data1,
                            id: r.id,
                            clients: [],
                            count: 0,
                            owner: true,
                            image: r.image,
                            datetime: r.datetime
                        })
                        return d;
                    });
                    if (e.nativeEvent.submitter.value === 'save') {
                        setForm(false);
                        setPath('/user/products/');
                    } else {
                        setData1({
                            id: '',
                            file: '',
                            title: '',
                            category: list.at(0).at(0),
                            price: '',
                            piece: '',
                            description: '',
                            min_order: '',
                            unit: 'kg',
                        });
                    }
                }
            }
        });
    }
    console.log(data1);
    return (
        <div className='User__form'>
            <form className='user__form' onSubmit={handleSubmit}>
                <h2>add product</h2>
                <div>
                    <input id='img' type='file' style={{ display: 'none' }} multiple required={!item} onChange={e => setData1({ ...data1, file: e.target.files })} />
                    <label htmlFor='img'>
                        {
                            data1.file.length ?
                                <>[{Array.from(data1.file).map(i => <>'{i.name}'</>)}] Selected</>
                            :
                                <>Choose an Image</>
                        }
                    </label>
                </div>
                <div className='user__form-input'>
                    <input id='title' required value={data1.title} onChange={e => setData1({ ...data1, title: e.target.value })} />
                    <label htmlFor='title'>title</label>
                </div>
                <div className='user__form-input'>
                    <select id='category' required value={data1.category} onChange={e => setData1({ ...data1, category: e.target.value })}>
                        {
                            list.length ? list.map(i => <option key={i[0]} value={i[0]}>{i[1]}</option>) : ""
                        }
                    </select>
                    <label htmlFor='category'>category</label>
                </div>
                <div className='user__form-input'>
                    <input id='piece' type='number' required value={data1.piece} onChange={e => setData1({ ...data1, piece: +e.target.value })} />
                    <label htmlFor='piece'>piece</label>
                </div>
                <div className='user__form-input'>
                    <input id='unit' required value={data1.unit} onChange={e => setData1({ ...data1, unit: e.target.value })} />
                    <label htmlFor='unit'>unit</label>
                </div>
                <div className='user__form-input'>
                    <input id='order' required type='number' value={data1.min_order} onChange={e => setData1({ ...data1, min_order: +e.target.value })} />
                    <label htmlFor='order'>min order</label>
                </div>
                <div className='user__form-input'>
                    <input id='price' required type='number' value={data1.price} onChange={e => setData1({ ...data1, price: +e.target.value })} />
                    <label htmlFor='price'>price in dollars</label>
                </div>
                <div className='buy__form-input'>
                    <textarea id='description' required value={data1.description} onChange={e => setData1({ ...data1, description: e.target.value })} />
                    <label htmlFor='description'>description</label>
                </div>
                <input type='submit' value={item ? 'update': 'save'} />
                {!item && <input type='submit' value='save and add another' />}
            </form>
            <Back back={_=>{setPath('/user/products/');setForm(false)}} />
        </div>
    )
}

export default Form