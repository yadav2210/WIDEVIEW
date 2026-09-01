from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve


urlpatterns = [
    path("", include("website.urls")),
]

# Preserve the existing static export paths during local development.
# In production, configure Nginx/Apache/the hosting platform to serve these folders.
if settings.DEBUG:
    urlpatterns += [
        re_path(r"^(?P<path>(?:images|js|wp-content|wp-includes|wp-json)/.*)$", serve, {"document_root": settings.BASE_DIR}),
    ]
