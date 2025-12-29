# Plantillas de Correo para Supabase

Para configurar estos correos, ve a tu panel de Supabase -> **Authentication** -> **Email Templates**.

---

## 1. Confirm Your Signup (Confirmación de Registro)

**Asunto:** `¡Bienvenido a Lana! Confirma tu cuenta`

**Cuerpo (Source Code):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Lana</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header con Logo -->
    <div style="background-color: #0B0F1A; padding: 30px; text-align: center;">
      <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" style="width: 80px; height: 80px; object-fit: contain;">
      <h1 style="color: #ffffff; margin-top: 10px; font-size: 24px; letter-spacing: 1px;">Lana</h1>
    </div>

    <!-- Contenido -->
    <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
      <h2 style="color: #111827; margin-bottom: 20px;">¡Gracias por unirte!</h2>
      
      <p>Hola,</p>
      
      <p>Estamos muy contentos de que hayas decidido tomar el control de tus finanzas personales con <strong>Lana</strong>.</p>
      
      <p>Para activar tu cuenta y comenzar, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(to right, #7c3aed, #db2777); background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar mi cuenta</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">Si no te registraste en Lana, puedes ignorar este correo de forma segura.</p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
      <p>&copy; 2024 Lana App. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Reset Password (Restablecer Contraseña)

**Asunto:** `Recuperación de contraseña - Lana`

**Cuerpo (Source Code):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header con Logo -->
    <div style="background-color: #0B0F1A; padding: 30px; text-align: center;">
      <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" style="width: 80px; height: 80px; object-fit: contain;">
    </div>

    <!-- Contenido -->
    <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
      <h2 style="color: #111827; margin-bottom: 20px;">Recuperación de Contraseña</h2>
      
      <p>Hola,</p>
      
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Lana</strong>.</p>
      
      <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(to right, #06b6d4, #7c3aed); background-color: #06b6d4; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">Si no solicitaste este cambio, no te preocupes, tu cuenta está segura y puedes ignorar este mensaje.</p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
      <p>&copy; 2024 Lana App. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
```
