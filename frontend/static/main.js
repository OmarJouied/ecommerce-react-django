const form = new FormData();
form.append("username","Omar");
form.append("password","omarjouied");
form.append("confirm","omarjouied");
form.append("email","O@gmail.com");
// form.append("method","DELETE");
window.addEventListener('DOMContentLoaded', _=>{
        // for ( const f of file.files) {
        //     form.append('image', f);
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                img.setAttribute('src', this.result);
            })
            reader.readAsDataURL(f);

            document.body.appendChild(img);
        // }
        
        fetch(window.location.href + 'api/', {
            method: 'POST',
            body: form
        }).then(r => r.json()).then(t=>console.log(t.message));
})

// let getCookie = name => {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         let cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             let cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

// window.addEventListener('DOMContentLoaded', _ => {
//     console.log(getCookie('csrftoken'));
//     console.log(value);
// })

// fetch(window.location.href + 'api/', {
//     method: 'PUT',
//     body: form
// }).then(r => r.json()).then(t=>console.log(t.message)).catch(e => console.log(e));