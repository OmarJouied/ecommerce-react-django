import { useState, useContext, useEffect } from 'react';
import { share } from '../App/App';

const Form = ({ setSend, setForm, to, setItem, item, back, setEmails, emails }) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [to_, setTo_] = useState(to);
    const [list, setList] = useState();
    const setD = useContext(share).setD;
    const csrf = useContext(share).csrf;
    const superUser = useContext(share).superUser[0];

    function valid() {
        return subject.length > 0 && content.length > 0;
    }

    function Send(e) {
        e.preventDefault();
        const mail = new FormData();
        mail.append('to', to_);
        mail.append('subject', subject);
        mail.append('content', content);
        fetch('/api/email/',{
            headers: {
                'X-CSRFToken': csrf
            },
            mode: 'same-origin',
            method: 'POST',
            body: mail
        })
        .then( r => r.json() )
        .then(r => {
            setD(r);
            if(!r.error) {
                if (emails.sender.length) {
                    emails.sender.unshift({
                        id: r.id,
                        to: superUser ? to_ : "OmarJouied",
                        content: content,
                        subject: subject,
                        date: r.date
                    })
                    console.log(emails.sender);
                    setEmails({
                        ...emails,
                        sender: emails.sender
                    });
                }
                setForm(false);
                setItem(false);
                setSend(true);
            }
        });
    }

    useEffect(() => {
        if (!to && superUser === true) {
            fetch('/api/users/')
            .then(r=>r.json())
            .then(r => setList(r))
        }
        if (item) back();
    }, [])

    return (
        <form className='buy__form contact'>
            <h2>contact</h2>
            {list?.length < 2 && <p style={{position: 'absolute', right: '3em', transform: 'translateY(35%)', color: 'red', textShadow: '0 0 5px #fff'}}>No Users Yet!</p>}
            {
                superUser && <div className='buy__form-input maybe'>
                    <input title={list?.length ? "":"No Users Yet"} list='users' autoFocus={superUser && list?.length} readOnly={(to_ && !list) || !list?.length} style={{ pointerEvents: to_ && !list ? "none" : "auto", paddingLeft: to_ && !list ? "2.25em":""}} required value={to_ ?? ""} onChange={e => setTo_(e.target.value)} />
                    <label>{to_ && !list ? "To:":"To"}</label>
                    {
                        list && <datalist id='users'>
                            {
                                list.map(user => <option value={user.user} key={user.id} />)
                            }
                        </datalist>
                    }
                </div>
            }
            <div className='buy__form-input'>
                <input autoFocus={!superUser} required value={subject} onChange={e => setSubject(e.target.value)} />
                <label>Subject</label>
            </div>
            <div className='buy__form-input'>
                <textarea required value={content} onChange={e => setContent(e.target.value)} />
                <label>Content</label>
            </div>
            <input onClick={Send} type='submit' value='Submit' disabled={!valid() || list?.length < 2} Style={`cursor: ${valid() ? "pointer" : "no-drop"}`} />
        </form>
    )
}

export default Form;