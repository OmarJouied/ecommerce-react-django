import { useContext, useState } from 'react';
import { share } from '../App/App';

function Auth() {
    const [signup, setSignup] = useState(false);
    const setD = useContext(share).setD;
    const fetchLogin = useContext(share).fetchLogin;
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        confirm: '',
    })

    const switchState = () => {
        setForm({
            email: '',
            username: '',
            password: '',
            confirm: '',
        });
        return setSignup(previsous => !previsous);
    }

    function handleLog(e) {
        e.preventDefault();
        const method = signup ? '' : 'PUT';
        const data = new FormData();
        data.append('method', method);
        data.append('email', form.email);
        data.append('username', form.username);
        data.append('password', form.password);
        data.append('confirm', form.confirm);
        fetch('/api/log', {
            method: 'POST',
            body: data
        })
        .then(r => r.json())
        .then(r => { if (!r.error) fetchLogin();return setD(r) })
        .catch(e => console.log(e));
    }

    return (
        <form className='user__form' style={{ width: '400px' }} onSubmit={handleLog}>
            <h2>{signup ? 'sign up' : 'sign in'}</h2>
            {
                signup && <div className='user__form-input'>
                    <input required type='text' name='email' id='email' value={form.email} onChange={e => setForm({...form, email: e.target.value })} />
                    <label htmlFor='email'>Email</label>
                </div>
            }
            <div className='user__form-input'>
                <input required type='text' name='username' id='username' value={form.username} onChange={e => setForm({...form, username: e.target.value })} />
                <label htmlFor='username'>Username</label>
            </div>
            <div className='user__form-input'>
                <input required type='password' name='password' id='password' value={form.password} onChange={e => setForm({...form, password: e.target.value })} />
                <label htmlFor='password'>Password</label>
            </div>
            {
                signup && <div className='user__form-input'>
                    <input required type='password' name='confirm' id='confirm' value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value })} />
                    <label htmlFor='confirm'>Confirm</label>
                </div>
            }
            <div className='user__form-input'>
                <input type='submit' value={signup ? `Sign up` : `Sign in`} />
            </div>
            <p>Don't have an account?<br className='hidden' /> <b style={{ cursor: 'pointer', color: '#000', marginLeft: '5px' }} onClick={switchState}>{signup ? 'Sign in' : 'Sign up'}</b></p>
        </form>
    )
}

export default Auth;