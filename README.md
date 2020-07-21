# HelloWorld

## Install

- Instalar Node lts
- Instalar MongoDB
- Editar .env

**Comandos**

```bash
# install dependencies
$ npm install --production
$ npm start
```

## Desarrollo

**Estructura de carpetas**

**Comandos**

```bash
# install dependencies
$ npm install

# Run server
$ npm run server
```

## Release

**Comandos**

```bash
# Run build script
$ sh ./release.sh
```

## APIs

**Crear Facebook API**
Entrar a: https://developers.facebook.com/apps/
Crear App categoria "Para todo lo demás".
En la sección agregar producto elegir "Inicio de sesión con Facebook", darle a configurar -> web.
Arriba aparece el App ID. En la sección configuración básica aparece la secret key.

**Crear Google API**
Entrar a: https://console.developers.google.com/
Crear un proyecto y luego ir a https://console.developers.google.com/apis/credentials/consent , completar los datos
Ir a la sección credenciales, darle a crear credencial-> ID de cliente OAuth
