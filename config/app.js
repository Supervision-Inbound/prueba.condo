{
  "name": "ConAdmin Chile",
  "version": "1.0.0",
  "description": "Sistema de administración de condominios para Chile",
  "environment": "production",
  "region": "chile",
  "features": {
    "dark_mode": false,
    "analytics": false,
    "offline_support": true,
    "pwa": false,
    "push_notifications": false
  },
  "limits": {
    "max_residents": 1000,
    "max_payments": 10000,
    "max_maintenance": 5000,
    "max_announcements": 1000
  },
  "validation": {
    "rut_validation": true,
    "phone_validation": true,
    "email_validation": true,
    "date_validation": true
  },
  "ui": {
    "theme": "light",
    "primary_color": "#007BFF",
    "accent_color": "#007BFF",
    "font_family": "Inter",
    "animations": true,
    "reduced_motion": false
  },
  "storage": {
    "auto_backup": true,
    "backup_interval": 300000,
    "retention_days": 30,
    "max_size_mb": 5
  },
  "notifications": {
    "auto_hide": true,
    "duration_success": 3000,
    "duration_warning": 5000,
    "duration_error": 8000,
    "duration_info": 4000
  },
  "charts": {
    "library": "chartjs",
    "fallback_to_css": true,
    "animations": true,
    "theme_colors": {
      "primary": "#007BFF",
      "success": "#28a745",
      "warning": "#ffc107",
      "error": "#dc3545",
      "neutral": "#6C757D"
    }
  },
  "security": {
    "csp_enabled": true,
    "xss_protection": true,
    "input_sanitization": true,
    "output_escaping": true
  },
  "accessibility": {
    "wcag_level": "AA",
    "keyboard_navigation": true,
    "high_contrast": false,
    "screen_reader_support": true
  }
}
