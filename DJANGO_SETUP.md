# Wide View Production — Django email setup

## 1. Install and prepare

**File: `requirements.txt`** — lists Django. From this folder run:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

**File: `.env`** — created from `.env.example`. Put real credentials only in `.env`; it is ignored by Git.

Generate a Django secret key with:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Paste it after `DJANGO_SECRET_KEY=`.

## 2. Configure Gmail or Google Workspace

Enable Google 2-Step Verification, then create a Google **App Password**. Do not use the normal Google account password. Put the 16-character app password in `EMAIL_HOST_PASSWORD` (spaces may be omitted).

```env
EMAIL_HOST_USER=yourbusiness@gmail.com
EMAIL_HOST_PASSWORD=your-google-app-password
DEFAULT_FROM_EMAIL=yourbusiness@gmail.com
CONTACT_RECEIVER_EMAIL=yourbusiness@gmail.com
```

For Google Workspace, replace those addresses with the authenticated account, such as `info@mydomain.com`. SMTP remains `smtp.gmail.com` on TLS port 587.

## 3. Run locally

```powershell
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000/`. Both the existing yellow inquiry form and footer popup post to `/contact/submit/`.

## File map

- **`wideview/settings.py`** — loads `.env`, configures Django and Gmail SMTP.
- **`wideview/urls.py`** — connects the app and serves existing export assets during local development.
- **`website/forms.py`** — validates name, email, 7–15 digit phone, message lengths, and the honeypot.
- **`website/views.py`** — rate-limits, sends both emails, logs private errors, and returns safe JSON.
- **`website/urls.py`** — defines the homepage and submission URL.
- **`index.html`** — remains the existing UI; only POST/CSRF/honeypot/validation and submission JavaScript were added.
- **`.env.example`** — safe configuration template; contains no real secret.
- **`.gitignore`** — prevents `.env`, the database, and virtual environments from entering Git.

## Production checklist

Set these deployment environment variables:

```env
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
```

Serve `images/`, `js/`, `wp-content/`, `wp-includes/`, and `wp-json/` using the hosting platform or Nginx/Apache. Use HTTPS. The built-in per-IP cache limit is suitable as basic protection; for multiple production workers, configure a shared Redis cache. Turnstile or reCAPTCHA can later be added without changing the form fields.

For temporary local email inspection only, you may override the backend with Django's console backend. Keep the configured SMTP backend in production.
