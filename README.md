# Purple — Backend (Django + DRF)

Beauty salon booking platform API for Accra, Ghana. Men's cuts, women's styling,
lash studio, nails & pedicure — all bookable through one system.

## Apps
- **accounts** — custom `User` model (email login, roles: customer/stylist/admin), JWT auth
- **salons** — salon/studio locations
- **services** — service categories & individual services (price in GHS, duration)
- **stylists** — stylist profiles, weekly availability, time-off, portfolio images
- **bookings** — bookings with overlap validation + auto end-time calc, reviews

## Quick start
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 manage.py migrate
python3 manage.py createsuperuser
python3 manage.py seed_demo      # optional: seeds 1 salon, 4 categories, 12 services, 1 stylist
python3 manage.py runserver
```

Admin panel: http://127.0.0.1:8000/admin/
Default superuser (if you skip createsuperuser and just use seed data manually): none created automatically — run `createsuperuser` yourself.

## Key API endpoints
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/auth/register/` | create account |
| POST | `/api/auth/login/` | returns `access` + `refresh` JWT |
| POST | `/api/auth/login/refresh/` | refresh access token |
| GET/PATCH | `/api/auth/me/` | current user profile |
| GET | `/api/salons/` | list studios |
| GET | `/api/services/categories/` | categories with nested services |
| GET | `/api/services/` | flat service list, filter by `?category=` `?audience=` |
| GET | `/api/stylists/` | stylist profiles with specialties + portfolio |
| GET | `/api/stylists/<id>/slots/?date=YYYY-MM-DD&service_duration=60` | free time slots for a day |
| GET/POST | `/api/bookings/` | list own bookings / create a booking (auth required) |
| GET | `/api/bookings/upcoming/` | current user's upcoming bookings |
| POST | `/api/bookings/<id>/cancel/` | cancel a booking |
| GET/POST | `/api/bookings/reviews/` | leave a review on a completed booking |

All list endpoints are paginated (20/page) and support DRF's standard filtering/search/ordering.

## Auth model
- Login is by **email**, not username.
- Roles: `customer` (default), `stylist`, `admin`. Stylist accounts should be linked to a `StylistProfile` in the admin panel.
- JWT access tokens last 6 hours, refresh tokens 14 days.

## Booking integrity
`Booking.clean()` blocks double-booking a stylist for an overlapping time window.
`end_time` and `price` are computed automatically from the selected `Service` on creation.

## Admin
Django admin is fully wired: manage salons, categories/services (with inline services per category),
stylists (with inline availability/time-off/portfolio), bookings (with status bulk-actions), and reviews.
Branded as "Purple Admin" in `urls.py`.

## Next steps (not yet built)
- Email/SMS notifications on booking confirm
- Payment integration (Paystack/MTN MoMo — common for Ghana)
- Image upload wired to S3 for production media storage
