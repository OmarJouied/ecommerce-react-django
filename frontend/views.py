from django.shortcuts import render
from django.middleware.csrf import get_token

# Create your views here.
def index(request):
    resp = render(request, 'index.html')
    resp.set_cookie('csrftoken', get_token(request))
    return resp