from django.http import JsonResponse
from .models import Product, Image, History, Contact
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, models
from django.forms import ModelForm
from django.core.mail import send_mail
from django.utils import dateformat, timezone as d
# from django.middleware.csrf import get_token # for geting the csrf_token value inside backend
import json
import re
import os

User = models.User

class Form(ModelForm):
    class Meta:
        model = Product
        exclude = ('owner',)

class Users(ModelForm):
    class Meta:
        model = User
        fields = ('email','username','password')
# Create your views here.
def api(request):
    
    # print(get_token(request)) # printing the value of csrf_token
    
    if request.method == 'GET':

        if not request.GET:
            Products = Product.objects.raw(f'SELECT * FROM api_product WHERE owner_id != {request.user.pk or 0} AND piece ORDER BY RAND() LIMIT 40')
        else:
            if o := request.GET.get('see'):
                owner = User.objects.get(username=o[1:-1]) if o[1:-1] else request.user
                ps = Product.objects.filter(owner=owner).order_by('-id')
                pr = []
                for product in ps:
                    pr.append({
                        "id": product.pk,
                        "owner": product.owner.username == request.user.username,
                        "image": [settings.MEDIA_URL + str(image.image) for image in product.images.all()],
                        "title": product.title,
                        "category": product.category,
                        "price": product.price,
                        "description": product.description,
                        "piece": product.piece,
                        "min_order": product.min_order,
                        "unit": product.unit,
                        "clients": [client.owner.username for client in product.history_set.all()],
                        "count": product.history_set.count(),
                        'datetime': product.datetime
                    })
                return JsonResponse(pr, safe=False)
            if request.GET.get('choice'):
                return JsonResponse(Product.choices, safe=False)
            Products = []
            if category := request.GET.get('category'):
                Products = Product.objects.exclude(piece=0).filter(category=category)
                if not Products:
                    return JsonResponse({
                        'message': 'No Product in this Category.',
                        'error': 1
                    })
            if title := request.GET.get('title'):
                if Products:
                    Products = Products.filter(title__icontains=title)
                else:
                    Products = Product.objects.filter(title__icontains=title)
        
        products = []
        for product in Products:
            if not product.images.all():
                continue
            products.append({
                "id": product.pk,
                "owner": product.owner.username == request.user.username,
                "image": [settings.MEDIA_URL + str(image.image) for image in product.images.all()],
                "title": product.title,
                "category": product.category,
                "price": product.price,
                "description": product.description,
                "piece": product.piece,
                "min_order": product.min_order,
                "unit": product.unit,
                "count": product.history_set.count(),
                'datetime': product.datetime
            })
        return JsonResponse(products, safe=False)
        
    if request.method == 'POST':
        
        if request.user.is_authenticated:
            now = dateformat.format(d.now(), "y-m-d").split('-')
            extentions = [
                            'apng', 'avif', 'gif', 'jpg',
                            'jpeg', 'jfif', 'pjpeg', 'pjp',
                            'png', 'svg', 'webp', 'bmp',
                            'ico', 'cur', 'tif', 'tiff',
                        ]

            if request.POST.get('method') == 'PUT':

                info, imgs = dict(request.POST), request.FILES.getlist('image')
                info.pop('method')

                if ids := request.POST.get('ids'):
                    ids = json.loads(ids)
                    address = request.POST.get('address')

                    if len(ids) != len(list(filter(lambda i: Product.objects.filter(id=i.get('id')), ids))):
                        return JsonResponse({
                            'message': 'A Product Are Deleted!',
                            'error': 1
                        })
                    
                    html_message = f'<div style="border:1px solid #777"><h2>{request.user.username} wants:</h2>'
                    for id in ids:
                        order = float(id.get('min_order'))
                        id = id.get('id')
                        p = Product.objects.get(id=id)
                        p.piece = p.piece - order if p.piece > 0 else 0
                        history = History(owner=request.user, address=address, order=order, product=p)
                        history.save()
                        p.save()
                        html_message += f"""
                                <div style='display:flex;align-items:center;padding:10px;border:1px solid #777'>
                                    <img src={settings.MEDIA_URL+str(p.images.all()[0].image)} style='width:40%'/>
                                    <div style='padding:6px'>
                                        <a href="">{id}: {p.title}</a>
                                        <p>number of orders: {order}</p>
                                        <div style='padding-top:6px'>
                                            {
                                                f"<a href={address} target='_blank'>GPS Link</a>" if address.startswith('http') else f"address: <code style='bacground:#aaa'>{address}</code>"
                                            }
                                        </div>
                                    </div>
                                </div>
                            """
                    html_message += '</div>'
                    message = 'Buy Successflly'
                    error = 0
                    try:
                        if not send_mail(
                            subject="Buy Product",
                            message='',
                            from_email=request.user.email,
                            recipient_list=[p.owner.email],
                            html_message=html_message,
                            # fail_silently=False
                            ):
                            raise
                    except:
                        message = 'Internal Server Error when Tell the Owner'
                        error = 1

                    return JsonResponse({
                            'message': message,
                            'error': error
                        })

                p = Product.objects.get(id=info.get('id')[0])

                if len(list(filter(lambda image: str(image).split('.')[-1] in extentions, imgs))):
                    for image in Image.objects.filter(product=p):
                        image.delete()
                        os.remove(image.image.path)
                    dire = image.image.path.rsplit('\\',1)[0]
                    if not len(os.listdir(dire)):
                        os.rmdir(dire)
                for key in [ key for key in info if info.get(key)[0] ]:
                    setattr(p, key, info[key][0])
                for img in imgs:
                    Image.objects.create(product=p, image=img)
                p.save()

                return JsonResponse({
                    'image': [f"{settings.MEDIA_URL}{now[0]}/{now[1]}/{now[2]}/{str(image)}" for image in imgs], # removed
                    'datetime': p.datetime,
                    "message": 'Updated Successfully',
                    'error': 0
                })
            
            if request.POST.get('method') == 'DELETE':

                info = request.POST
                try:
                    if p := Product.objects.get(id=info.get('id')):
                        # # remove the comment if your hosting contain a file storage internal or equivalent
                        # for image in p.images.all():
                        #     os.remove(image.image.path)
                        # dire = image.image.path.rsplit('\\',1)[0]
                        # if not len(os.listdir(dire)):
                        #     os.rmdir(dire)
                        p.delete()
                        message = 'Deleted Successfully'
                        error = 0
                except Exception as e:
                    message = str(e)
                    error = 1
                return JsonResponse({
                            'message': message,
                            'error': error
                        })
                

            owner = request.user
            images = request.FILES.getlist('image')
            
            if not images or not len(list(filter(lambda image: str(image).split('.')[-1] in extentions, images))):
                return JsonResponse({
                    'message': 'at least one image',
                    'error': 1
                })
            form = Form(request.POST)
            if form.is_valid():
                owner = User.objects.filter(username=owner)[0]
                title = request.POST['title']
                if Product.objects.filter(owner=owner, title=title):
                    return JsonResponse({
                        'message': 'This Title already exist',
                        'error': 1
                    })
                try:
                    p = Product(
                    owner=owner,
                    title=title,
                    category=request.POST['category'],
                    price=float(request.POST['price']),
                    description=request.POST['description'],
                    piece=float(request.POST['piece']),
                    min_order=float(request.POST['min_order']),
                    unit=request.POST['unit']
                    )
                    p.save()
                except:
                    return JsonResponse({
                        'message': "Some Numbers Input Has Not A Numbers Value",
                        'error': 1
                    })
                for image in images:
                    if str(image).split('.')[-1] in extentions:
                        Image.objects.create(product=p, image=image)
                return JsonResponse({
                    'id': p.pk,
                    'image': [f"{settings.MEDIA_URL}{now[0]}/{now[1]}/{now[2]}/{str(image)}" for image in images],
                    'datetime': p.datetime,
                    'message': 'The product was added successfully.',
                    'error': 0
                })
            else:
                print(form) # remove this line
                return JsonResponse({
                    'message': "Fill All",
                    'error': 1
                })

    return JsonResponse({
        'message': 'error in something',
        'error': 1
    })

def log(request):
    
    if request.method == 'GET':
        return JsonResponse({
            'isLogin': request.user.is_authenticated,
            'isSuper': request.user.is_superuser
        })

    if request.method == 'POST':

        if request.POST.get('method') == 'PUT':

            if request.POST.get('out'):
                logout(request)
                message = 'Logout Successfully'
                error = 0
            elif u := authenticate(request, username=request.POST['username'], password=request.POST['password']):
                login(request, u)
                message = 'Login Successfully'
                error = 0
            else:
                message = 'error in username or password'
                error = 1
            return JsonResponse({
                    'message': message,
                    'error': error
                })

        if request.POST.get('method') == 'DELETE':
            username = request.POST['username']
            password = request.POST['password']
            if not len(password):
                return JsonResponse({
                    'message': 'error in password',
                    'error': 1
                })
            if u := authenticate(request, username=username, password=password):
                u.delete()
                message = 'welcome anytime in our shop 🥰'
                error = 0
            else:
                message = 'No User Like That'
                error = 1
            return JsonResponse({
                    'message': message,
                    'error': error
                })

        form = Users(request.POST)
        if form.is_valid():
            email = request.POST['email']
            username = request.POST['username']
            password = request.POST['password']
            confirm = request.POST['confirm']
            if password != confirm or not len(password):
                return JsonResponse({
                    'message': 'error in password',
                    'error': 1
                })
            if user := User.objects.create_user(email=email, username=username, password=password):
                user.save()
                login(request, user)
                return JsonResponse({
                    'message': 'welcome to our shop 🥰',
                    'error': 0
                })
        else:
            return JsonResponse({
                'message': ''.join(re.findall('<li>(.+)</li>', str(form))),
                'error': 1
            })

def emails(request):
    message = ''
    error = 0
    if request.method == 'GET':
        if request.GET.get('type') == 'send':
            if id := request.GET.get('id'):
                message = Contact.objects.get(id=id)
                return JsonResponse({
                        'content': message.content,
                    })
            messages = Contact.objects.filter(sender=request.user).order_by('-date')
            component = []
            for message in messages:
                component.append({
                    'id': message.pk,
                    'to': message.receiver.username,
                    'subject': message.subject,
                    'date': message.date,
                    'see': message.see
                })
            return JsonResponse(component, safe=False)
        elif request.GET.get('type') == 'receive':
            messages = Contact.objects.filter(receiver=request.user).order_by('-date')
            component = []
            for message in messages:
                component.append({
                    'id': message.pk,
                    'from': message.sender.username,
                    'subject': message.subject,
                    'date': message.date,
                    'see': message.see,
                })
            return JsonResponse(component, safe=False)
        elif request.GET.get('count'):
            return JsonResponse({'count': Contact.objects.filter(receiver=request.user, see=False).count()})
        else:
            message = 'Get A Specific Type'
            error = 1
    if request.method == 'POST':
        data = request.POST
        try:
            if request.user.is_superuser:
                to = User.objects.get(username=data.get('to'))
            else:
                to = User.objects.get(is_superuser=True)
            
            if (sender:=request.user) and (subject:=data.get('subject')) and (content:=data.get('content')):
                email = Contact (
                            receiver=to,
                            sender=sender,
                            subject=subject,
                            content=content
                        )
                email.save()
                message = 'Email Sending Successfully'
                error = 0
                id = email.pk
        except:
            message = 'Error in Sending Email'
            error = 1
    if request.method == 'PUT':
        id = json.loads(request.body).get('id')
        contact = Contact.objects.get(id=id)
        contact.see = True
        contact.save()
        return JsonResponse({
                'content': contact.content
            })
    if request.method == 'DELETE':
        id = json.loads(request.body).get('id')
        try:
            mail = Contact.objects.get(id=id)
            mail.delete()
            message = 'Your Mail Deleted Successfully!'
            error = 0
        except Exception as e:
            message = f'Error: { str(e) }'
            error = 1
        
    return JsonResponse({
        'message': message,
        'error': error,
        **({'id': id, 'date': d.now()} if request.method == 'POST' else {})
    })

def history(request):
    if request.method == 'DELETE':
        try:
            hist = History.objects.get(id=json.loads(request.body).get('id'))
            hist.delete()
            message = 'Deleted Successfully'
            error = 0
        except Exception as e:
            message = f'Deleted Failed: {str(e)}'
            error = 1
        return JsonResponse({
            'message': message,
            'error': error
        })
    else:
        products = []
        for product in History.objects.filter(owner=request.user).order_by('-datetime'):
            products.append({
                'id': product.pk,
                'datetime': product.datetime,
                'order': product.order,
                "image": [settings.MEDIA_URL + str(image.image) for image in product.product.images.all()],
                "title": product.product.title,
                "category": product.product.category,
                "price": product.product.price,
                "description": product.product.description,
                "piece": product.product.piece,
                "min_order": product.product.min_order,
                "unit": product.product.unit,
                'main_owner': product.product.owner.username
            })

    return JsonResponse(products, safe=False)

def users(request):
    users_not_me = User.objects.exclude(username=request.user)
    data = []
    for user in users_not_me:
        data.append({
            'id': user.pk,
            'user': user.username,
        })

    return JsonResponse(data, safe=False)
