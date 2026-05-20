from django.urls import path
from . import views

urlpatterns = [
    path('financiero/', views.reporte_financiero, name='reporte-financiero'),
]
