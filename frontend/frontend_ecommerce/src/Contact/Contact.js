import { useEffect, useState, useContext } from "react";
import { share } from "../App/App";
import Email from "./Email";
import Form from "./Form";
import './Contact.css';

const Contact = () => {
    const [send, setSend] = useState(false); // send = true => type = send
    const [form, setForm] = useState(false);
    const setD = useContext(share).setD;
    const setLength = useContext(share).length[1];
    const [item, setItem] = useState(false);
    const [emails, setEmails] = useState({
        sender: [],
        receive: []
    });
    const [email, setEmail] = useState({});
    const [to, setTo] = useState();

    function Fetch(target) {
        fetch(`/api/email/?type=${target}`)
            .then(r => r.json())
            .then(r => {
                send ? setEmails({
                    ...emails, sender: r.length ? r : [{
                        id: '',
                        to: '',
                        subject: '',
                        date: ''
                    }]
                }) : setEmails({
                    ...emails, receive: r.length ? r : [{
                        id: '',
                        from: '',
                        subject: '',
                        date: '',
                        see: ''
                    }]});
                back();
            })
            .catch(e => console.log(e));
    }

    function change(e, id) {
        if (!e.target.classList.contains('fas')) {
            const email = (send ? emails.sender : emails.receive).find(email => email.id === id);
            if (!send && !email.see) {
                setLength(prev => prev - 1);
            }
            if (email.content) {
                setItem(true);
                setEmail(email);
                return;
            }
            const i = send ? "" : email.see = true;
            (send ? fetch(`/api/email/?type=send&id=${id}`) : fetch('/api/email/', {
                method: 'PUT',
                body: JSON.stringify({ id })
            }))
                .then(r => r.json())
                .then(r => {
                    setItem(true);
                    email.content = r.content
                    setEmail(email);
                })
                .catch(e => console.log(e));
        }
    }

    function back() {
        setEmail({});
        setItem(false);
    }

    function deleteMail(id) {
        fetch('/api/email/', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        })
            .then(r => r.json())
            .then(r => {
                setD(r);
                setEmails({
                    ...emails,
                    sender: emails.sender.filter(i => i.id !== id)
                })
            })
            .catch(e => console.log(e));
        back();
    }

    useEffect(_ => {
        if (send && !emails.sender.length) {
            Fetch('send');
        } else if (!send && !emails.receive.length) {
            Fetch('receive');
        }
        back();
    }, [send]);

    function clicked(e) {
        if (e.target.className === 'only') {
            setTo(undefined);
            setForm(true);
            return;
        }
        if (e.target.classList.contains('true')) {
            setSend(true);
        } else {
            setSend(false);
        }
        if (form) {
            setForm(false);
        }
    }

    return (
        <div className='buy contact'>
            <div className='container'>
                <div className='links_contact'>
                    <a onClick={clicked} className={!send && !form && 'active'}>Received</a>
                    <a onClick={clicked} className={`${send && !form && 'active'} true`}>Sended</a>
                </div>
                {
                    form ?
                        <Form Fetch={Fetch} setForm={setForm} to={to} setSend={setSend} setItem={setItem} item={item} back={back} setEmails={setEmails} emails={emails} />
                        // to is undefined
                    :
                        <div className="emails">
                            <a className='only' onClick={clicked}><i className='fa fa-pen'></i>Compose</a>
                            {
                                item ?
                                    <Email className="email" setTo={setTo} setForm={setForm} email={email} back={back} mailClicked={deleteMail} item={item} />
                                    :
                                    (send ? emails.sender : emails.receive).map(email => email.id && (
                                        <Email key={email.id}
                                            className={send ? "item" : (email.see ? "item" : "item active")}
                                            mailClicked={deleteMail}
                                            onClick={e => change(e, email.id)}
                                            setForm={setForm}
                                            email={email}
                                            setTo={setTo}
                                           
                                        />
                                    ))
                            }
                        </div>
                }
            </div>
        </div>
    )
}

export default Contact;