from django.urls import path
from . import views

urlpatterns = [
    path('financiero/', views.reporte_financiero, name='reporte-financiero'),
    path('exportar/', views.exportar_excel, name='exportar-excel'),
    path('flujo-caja/', views.flujo_caja, name='flujo-caja'),
]
