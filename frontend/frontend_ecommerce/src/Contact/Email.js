import { useState } from 'react';
import Back from "./Back";

function Email({ email, mailClicked, back, className, onClick, setForm, setTo, item }) {
    const [show, setShow] = useState(true);
    const click = onClick ? onClick : _=>{};

    const clicked = id => {
        mailClicked(id);
        setShow(false);
    }

    const reply = (e, fm) => {
        click(e);
        setTo(fm);
        setForm(true);
    }


    return (
            <>
            {show &&
                <div title={!item && ((email.to?email.see?'read':'unread':email.see?'old':'new')+` message`)} className={className} onClick={click}>
                    <div>
                        {email.image && (<img src="" alt="" />)}
                        <div className="head">
                            <div>
                                <h2>{email.to ? <><b style={{ fontSize: '18px' }}>To:</b> {email.to}</> : <><b style={{ fontSize: '18px' }}>From:</b> {email.from}</>}</h2>
                                <h3>{email.subject}</h3>
                            </div>
                            <div>
                                <span className="time">{email.date}</span>
                                {
                                    item && email.from && <i title="reply" onClick={e => reply(e, email.from)} className="fa-solid fa-paper-plane"></i>
                                }
                                {
                                    email.to && <i title="delete email" onClick={_ => clicked(email.id)} className="fas fa-trash-alt"></i>
                                }
                            </div>
                        </div>
                    </div>
                    {
                        !item && email.to ? (
                            <i className={`fa-solid fa-check${email.see ? '-double':''}`} style={{ color: email.see ? '#00c3ff' : '#a3a08d', fontSize: '16px', position: 'absolute', right: '.75em', bottom: '.25rem' }}></i>
                            ) : (
                            <></>
                        )
                    }
                    {
                        item && <>
                            <p className="content">
                                {email.content}
                            </p>
                            <Back back={back} />
                        </>
                    }
                </div>
            }
            </>
    )
}

export default Email;