from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class Product(models.Model):
    choices = [
        ('fr', 'fruits'),
        ('ve', 'vegetables'),
        ('me', 'meat'),
        ('mi', 'milk & derivatives'),
        ('pa', 'panties'),
        ('sh', 'shirts'),
        ('ca', 'caps'),
        ('hu', 'hours'),
        ('ho', 'homes'),
        ('co', 'computers'),
        ('ph', 'phones'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, default=User.objects.filter(is_superuser=True)[0].pk)
    title = models.CharField(max_length=20)
    category = models.CharField(max_length=20, choices=choices, default=choices[0][0])
    price = models.FloatField("price ($)", default=0.0)
    description = models.TextField(max_length=255)
    piece = models.FloatField(default=0)
    min_order = models.FloatField(default=0)
    unit = models.CharField(max_length=20, default='kg')
    datetime = models.DateTimeField(default=timezone.now, blank=True)
    
    def __str__(self):
        return f"{self.id}: {self.title}"

class Image(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='%y/%m/%d/')

    def __str__(self):
        return f"{self.product.id}: {self.product.title}"

class History(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, default='')
    order = models.FloatField(default=0)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    datetime = models.DateTimeField(default=timezone.now, blank=True)
    
    def __str__(self):
        return f"{self.owner.username} bought '{self.product}'"

class Contact(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.PROTECT, related_name="receive")
    sender = models.ForeignKey(User, on_delete=models.PROTECT, related_name="send")
    subject = models.CharField(max_length=255)
    content = models.TextField()
    date = models.DateTimeField(default=timezone.now)
    see = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.pk}: {self.subject}"
