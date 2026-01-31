from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import *
from .serializers import *

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        return Response({
            'status': 'success',
            'token': 'fake-jwt-token-for-hackathon',
            'role': user.role,
            'username': user.username
        })
    else:
        return Response({'status': 'error', 'message': 'Invalid Credentials'}, status=400)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    data = request.data
    
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'status': 'error', 'message': 'Login ID already exists'}, status=400)
    
    try:
        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('name', ''),
            role=data.get('role', 'portal')
        )
        
        return Response({
            'status': 'success',
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        })
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=400)