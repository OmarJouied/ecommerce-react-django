import { useContext, useEffect, useState } from "react";
import { share } from "../App/App";

const Choices = ({ Filter, catRef, className }) => {
    const list = [['all', 'all'], ...useContext(share).cat];
    const [cat, setCat] = useState(list);
    const [inp, setInp] = useState('all');
    const [opacity, setOpacity] = useState(0);
    const [type, setType] = useState();

    const Filter_product = (text) => {
        if (!className) {
            Filter(text);
        }
    }

    useEffect(_ => {
        if (className) {
            const s = list.find(i => i[1] === inp);
            if (s) {
                setType(s[0]);
            } else {
                setType('error');
            }
        }
    }, [inp]);

    const base = <>
        {!className && <label htmlFor='sel'>Filter by</label>}
        <div className="filter__container">
            <input id='sel' onFocus={_=>setOpacity(1)} onBlur={_=>setOpacity(0)} value={inp} data-type={type} ref={catRef} className={className ? className : 'ecommerce__main-query_options ecommerce__main-filter_'} onChange={e=>setInp(e.target.value.toLowerCase())} onInput={e=>setCat(list.filter(i => i[1].includes(e.target.value.toLowerCase())))} />
            <ul style={{opacity, visibility: opacity ? 'visible':'hidden'}}>
                {
                    cat.length ?
                        <>
                            {
                                cat.map(i => <li key={i[0]} onClick={_ => Filter_product(i[0])} onMouseOver={_ => setInp(i[1])}>{i[1]}</li>)
                            }
                        </>
                        :
                        ''
                }
            </ul>
            {
                type === 'error' && <div className="error_type">
                    * Choose A Correct Category
                </div>
            }
        </div>
    </>

    return (
        <>
            {
                className ?
                        <>
                            {base}
                        </>
                    :
                        <div className="ecommerce__main-filter">
                            {base}
                        </div>
            }
        </>
        
    )
}

export default Choices;