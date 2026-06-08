from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/assessment/', include('apps.assessment.urls')),
    path('api/careers/', include('apps.careers.urls')),
    path('api/roadmap/', include('apps.roadmap.urls')),
    path('api/projects/', include('apps.projects.urls')),
]
