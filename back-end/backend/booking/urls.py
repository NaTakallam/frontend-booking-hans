from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, google_auth, oauth2callback

router = DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('google-auth/', google_auth, name='google-auth'),
    path('oauth2callback/', oauth2callback, name='oauth2callback'),
]