import React, { useState, useEffect } from 'react';
import './App.css';
import Header from '../Header/Header';
import Main from '../Main/Main';
import Buy from '../Buy/Buy';
import Contact from '../Contact/Contact';
import User from '../User/User';
import NotFoundPage from '../404/404';

export const share = React.createContext();

const Load = () => {
  return (
    <div className='load'></div>
  )
}

const Message = ({ d }) => {
  let type = 'active';
  if (typeof d.error !== "number") type = '';
  return <div className={`${d.error ? "error" : "succ"} ${type}`}>{d.message.split('.').map(item => <>{item}<br /></>)}</div>;
}
let stop = 0;
let log;

function App() {
  const [load, setLoad] = useState(1);
  const [data, setData] = useState([]);
  const [select, setSelect] = useState([]);
  const [show, setShow] = useState([]);
  const [login, setLogin] = useState();
  const [superUser, setSuperUser] = useState();
  const [path, setPath] = useState(window.location.pathname);
  const [comp, setComp] = useState();
  const [d, setD] = useState({
    message: '',
    error: ''
  });
  const [cat, setCat] = useState('');
  const [length, setLength] = useState();
  const csrf = document.cookie.split(';').find(i => i.trim().startsWith('csrftoken=')).split('=')[1];

  function fetchLogin() {
        fetch('/api/log')
        .then( r => r.json() )
          .then(r => {
            setLogin(r.isLogin);
            setSuperUser(r.isSuper);
            if (window.location.pathname !== '/' && typeof r.isLogin === 'boolean' ) {
                setLoad(0);
              }
           })
        .catch( e => console.log(e) );
  }

  function Fetch(e = '') {
    if ( stop !== e || (log !== login) ) {
      if (stop === e && typeof login === 'boolean' && log === undefined) {
        log = login;
        return;
      }
      log = login;
      fetch(`/api/?${e}`)
        .then(r => r.json())
        .then(r => {
          setShow(r);
          setLoad(0);
          return setData(r);
        })
        .catch(e => console.log(e));
      stop = e;
    }
  }

  useEffect(_ => {
    if (typeof d.error === 'number') {
      setTimeout(() => {
        setD({
          message: '',
          error: ``
        });
      }, 3500);
    }
  }, [d]);
  useEffect(fetchLogin, []);

  useEffect(_=>{
    if ( !cat.length && (path === '/' || path === '/cart' || path.match(/^\/user(?:\/\w+)*\/?$/)) )
      fetch(`/api/?choice=1`)
        .then(r => r.json())
        .then(r => setCat(r))
        .catch(e => console.log(e));
    }, [path]);

  useEffect(_=>{
    if (path !== '/' && login === false && !path.match(/^\/user(?:\/\w+)*\/?$/)) {
      setPath('/user');
      window.history.pushState(null, null, '/user');
    }
    if ( path !== window.location.pathname ) window.history.pushState(null, null, path);

    if (path.match(/^\/user(?:\/\w+)*\/?$/)) {
      setComp(<User />);
    }
    else if (path === '/') {
      Fetch();
      setShow(data);
      setComp(<Main />);
    }
    else if (path === '/cart') {
      setShow([...(show.filter(i => select.find(j => j.id === i.id)))]);
      setComp(<Main />);
    }
    
    else if (path === '/buy') setComp(<Buy />);
    
    else if (path === '/contact') setComp(<Contact />);
    
    else setComp(<NotFoundPage />);
  }, [path, login]);

  useEffect(_=>{
    document.addEventListener('click', e => {
      if (e.target.hasAttribute('href')) {
        e.preventDefault();
      }
      if (e.target.closest('[title=logout]')) {
        return null;
      }
      const i = e.target.closest('[data-link]') ?? e.target.closest('.info a');
      if ( i ) {
        e.preventDefault();
        if (login || i.pathname === '/user' || i.pathname === '/') {
          setPath( i.pathname );
        }
      }
    })
  }, [login]);

  window.addEventListener('popstate', e => {
    setPath(e.target.location.pathname);
  });
  

  return (
    <share.Provider value={{ select: [ select, setSelect ],
                             show: [show, setShow],
                             login: [ login, setLogin ],
                             data: [ data, setData ],
                             Fetch: Fetch,
                             setPath: setPath,
                             superUser: [superUser, setSuperUser],
                             setD,
                             fetchLogin,
                             cat,
                             length: [length, setLength],
                             path: path,
                             csrf
                          }}>
      <Header />
      <Message d={d} />
      {
        load ?
        <Load /> :
        comp
      }
    </share.Provider>
  );
}

export default App;
