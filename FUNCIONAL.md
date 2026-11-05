# Vestuario · Documento funcional

Qué hace la aplicación, para quién y con qué reglas.
La parte técnica (instalación, arquitectura y decisiones) está en [TECNICO.md](TECNICO.md).

## Índice

1. [Qué es Vestuario](#1-qué-es-vestuario)
2. [Perfiles](#2-perfiles)
3. [Pantallas](#3-pantallas)
4. [Cómo se usa](#4-cómo-se-usa)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Requerimientos por sprint](#6-requerimientos-por-sprint)
7. [Criterios adoptados](#7-criterios-adoptados)

---

## 1. Qué es Vestuario

Una red social de jugadores de fútbol: cada jugador crea su cuenta con sus datos, su posición en la cancha, su club y
una foto de perfil, publica sus partidos, goles y jugadas con un título y una imagen opcional, y reacciona y comenta lo
que publican los demás. Los administradores, además, moderan las publicaciones, gestionan los usuarios y consultan
estadísticas de uso.

El trabajo se entrega por sprints de una semana. Hoy están terminados el **sprint 1** (registro con foto de perfil,
ingreso con correo o nombre de usuario y perfil propio), el **sprint 2** (publicar con imagen opcional, ver las
publicaciones paginadas y ordenadas por fecha o por "Me gusta", dar y quitar "Me gusta", eliminar las propias y ver en
el perfil las últimas tres con sus comentarios), el **sprint 3** (sesión con token JWT de 15 minutos que se puede
extender, pantalla de carga que valida el token, acceso solo con sesión, y la página de cada publicación con sus
comentarios, que se pueden escribir, cargar de a poco y editar) y el **sprint 4**: el administrador da de baja
cualquier publicación, gestiona las cuentas en el dashboard de usuarios (alta con perfil, baja y alta lógica) y ve
tres gráficos de estadísticas; además, la aplicación se puede instalar (PWA) y suma pipes y directivas propias.

Con el sprint 4 también cambió la estética: el club se elige entre los 30 de la Liga Profesional, el fondo de la
aplicación es la cancha del club de cada jugador y su escudo aparece, chiquito, junto a su nombre.

## 2. Perfiles

| Perfil | Quién es | Qué puede hacer hoy |
|---|---|---|
| Visitante | Entra sin sesión | Solo ingresar o crear una cuenta. Cualquier otra pantalla lo lleva a *Ingresar* |
| Usuario | Toda cuenta que se registra | Publicar, dar y quitar "Me gusta", eliminar sus publicaciones, comentar, editar sus comentarios, ver sus datos y sus últimas publicaciones en *Mi perfil*, extender la sesión y cerrarla |
| Administrador | Una cuenta creada como administradora desde el dashboard (o a la que se le cambió el perfil) | Lo mismo que un usuario y, además, eliminar cualquier publicación, crear cuentas de usuarios y de administradores, deshabilitar y volver a habilitar cuentas, y ver las estadísticas |
| Cuenta deshabilitada | Una cuenta a la que un administrador le dio la baja lógica | Nada: no puede ingresar (el login le avisa que no está autorizado) y, si tenía la sesión abierta, se le cierra en el próximo pedido. Sus publicaciones y comentarios siguen a la vista |

## 3. Pantallas

| Pantalla | Qué ofrece | Quién entra |
|---|---|---|
| Cargando | Spinner mientras se valida el token guardado. Si es válido sigue a la pantalla pedida; si venció, vuelve a *Ingresar* con un aviso. Si el servidor no responde, ofrece reintentar | Al abrir la aplicación con una sesión guardada |
| Publicaciones | El escudo y el estadio del club propio, formulario para publicar, selector de orden ("Más recientes" o "Más 'Me gusta'"), las publicaciones de a 5 con paginación y el rango que se está viendo ("Mostrando 1–5 de 12"). Cada publicación muestra autor con su posición y el escudo de su club, hace cuánto se publicó, título, mensaje, imagen, "Me gusta", la cantidad de comentarios y, si es propia (o si quien mira es administrador), el botón para eliminarla | Con sesión |
| Publicación | La publicación en grande y sus comentarios: formulario para comentar, los más recientes primero de a 5, "Cargar más" y edición de los propios | Con sesión |
| Mi perfil | Foto, nombre y apellido, nombre de usuario, posición, el escudo del club, perfil, descripción, correo, club, fecha de nacimiento y fecha de alta, y las últimas 3 publicaciones propias, cada una con sus comentarios más recientes | Con sesión |
| Usuarios (dashboard) | Formulario para crear cuentas (los datos del registro y el perfil, con botones de opción) y el listado de cuentas de a 10, con buscador, perfil, estado y el botón para deshabilitar o habilitar cada una | Administradores |
| Estadísticas (dashboard) | El lapso (últimos 7, 30 o 90 días, o dos fechas a elección) y tres gráficos: publicaciones por usuario (barras), comentarios por día (líneas) y comentarios por publicación (torta). Cada gráfico se puede ver también como tabla | Administradores |
| Crear cuenta | Formulario de registro con imagen de perfil opcional y vista previa, y la lista de los 30 clubes: al elegir uno, de fondo aparece su cancha | Sin sesión |
| Ingresar | Formulario con correo o nombre de usuario y contraseña | Sin sesión |
| Créditos de las imágenes | Autor y licencia de cada foto de estadio y de cada escudo | Todos |
| Página no encontrada | Aviso para direcciones que no existen, con un enlace a publicaciones | Todos |

El encabezado está en todas las pantallas, en verde como el césped: con sesión lleva a Publicaciones y a Mi perfil (y,
para los administradores, a Usuarios y Estadísticas) y muestra la foto y el nombre de usuario con el botón para cerrar
sesión; sin sesión, los accesos a ingresar y registrarse.

De fondo, en todas las pantallas, está la cancha del club del jugador con un velo verde oscuro para que se lea lo que
va encima. Sin sesión, sin club o con un club sin foto libre, se ve una cancha dibujada. Al pie, el nombre del estadio y
el autor de la foto, con el enlace a los créditos.

## 4. Cómo se usa

**Registro**

1. El jugador completa el formulario, elige su posición (arquero, defensor, mediocampista o delantero), elige su club
   de la lista si quiere (al elegirlo, de fondo aparece su cancha y, junto al campo, su escudo) y elige su imagen de
   perfil, que se ve en un círculo antes de enviar.
2. Cada campo avisa su error apenas se sale de él, y al tocar *Crear cuenta* se marcan todos los que falten.
3. Si el correo o el nombre de usuario ya existen, un modal lo explica y el campo queda marcado en rojo.
4. Si todo está bien, se crea la cuenta con perfil "usuario", la sesión queda iniciada y un modal da la bienvenida.
   Desde ahí se pasa a Publicaciones.

**Ingreso**

1. Se escribe el correo o el nombre de usuario (da igual mayúsculas o minúsculas) y la contraseña.
2. Si las credenciales no coinciden, un modal avisa "Las credenciales no son correctas." sin decir cuál de los dos
   falló.
3. Si coinciden pero la cuenta está deshabilitada, el modal "Tu cuenta está deshabilitada" avisa que no está autorizado
   a ingresar y que se comunique con un administrador.
4. Si coinciden y la cuenta está activa, se entra a Publicaciones con la sesión iniciada.

**Sesión**

- La sesión dura 15 minutos y se guarda en el navegador: sobrevive a recargar la página.
- Al abrir la aplicación o recargarla, la pantalla de carga valida la sesión con el servidor antes de mostrar nada.
- A los 10 minutos un modal avisa que quedan 5 y ofrece extenderla. *Extender sesión* da 15 minutos más; *Ahora no*
  deja que venza.
- Si la sesión vence, o el servidor la rechaza en cualquier momento, se cierra y se vuelve a *Ingresar* con el aviso
  "Tu sesión venció". Si la rechaza porque un administrador deshabilitó la cuenta, el aviso es "Tu cuenta fue
  deshabilitada".

**Publicar**

1. En Publicaciones se completa el título y el mensaje y, si se quiere, se agrega una imagen (se ve una vista previa
   y se puede quitar).
2. Si falta el título o el mensaje, se marca debajo del campo. Un texto con solo espacios cuenta como vacío.
3. Al publicar, un modal lo confirma y la publicación aparece primera en el listado ordenado por fecha.

**Ver las publicaciones**

- Se muestran de a 5, de la más nueva a la más vieja. El selector cambia el orden a "Más 'Me gusta'".
- Los botones de abajo pasan de página. La página y el orden quedan en la dirección (por ejemplo,
  `/publicaciones?pagina=2&orden=meGusta`), así se conservan al recargar o al volver atrás.
- El título y el botón de comentarios de cada publicación llevan a su página.

**"Me gusta"**

- El botón muestra cuántos "Me gusta" tiene la publicación y queda resaltado si ya le diste uno. Un clic lo da y otro
  lo quita.

**Comentar**

1. En la página de una publicación se escribe el comentario (hasta 500 caracteres, con contador) y se toca
   *Comentar*. Aparece primero en la lista y se suma al total.
2. Los comentarios se ven de los más recientes a los más viejos, de a 5. *Cargar más* agrega los siguientes debajo,
   sin perder los que ya se ven.
3. Los comentarios propios tienen el botón *Editar*: el texto se cambia en el lugar y, al guardar, el comentario
   muestra "editado" junto a la fecha.

**Eliminar**

- Las publicaciones propias muestran el botón para eliminar y, para un administrador, todas. Antes de borrar, un modal
  pide confirmación nombrando la publicación (y, si es ajena, a su autor).
- La publicación deja de verse en el listado, en su página y en el perfil, junto con sus comentarios, pero queda
  guardada (baja lógica).

**Mi perfil**

- Debajo de los datos de la cuenta aparecen las últimas 3 publicaciones propias, cada una con sus 3 comentarios más
  recientes y un enlace para ver todos. Desde ahí también se puede dar "Me gusta", eliminar y editar los comentarios
  propios.

**Cierre de sesión:** el botón del encabezado pide confirmación en un modal y después lleva a Ingresar.

**Dashboard de usuarios (administradores)**

1. *Crear usuario* abre el mismo formulario del registro con dos botones de opción más: perfil "Usuario" o
   "Administrador". Al crearla, un modal lo confirma y la cuenta aparece en el listado; la sesión sigue siendo la del
   administrador.
2. El listado muestra las cuentas de a 10, de la más nueva a la más vieja, con foto, nombre, usuario, correo, posición,
   club, perfil y estado. El buscador filtra por nombre, apellido, nombre de usuario o correo mientras se escribe.
3. *Deshabilitar* pide confirmación y da la baja lógica: la cuenta queda marcada como deshabilitada y ya no puede
   ingresar. *Habilitar* la vuelve a activar. La cuenta propia no tiene botón: un administrador no puede dejarse afuera.

**Estadísticas (administradores)**

1. Arriba se elige el lapso: los últimos 7, 30 (el de entrada) o 90 días, o *Elegir fechas* para poner un desde y un
   hasta (como mucho un año). Los tres gráficos usan siempre el mismo lapso.
2. *Publicaciones por usuario*: barras horizontales, de quien más publicó a quien menos.
3. *Comentarios en el lapso*: el total, el promedio por día, el día con más y una línea con un punto por día (también
   los días sin comentarios).
4. *Comentarios por publicación*: una torta con las 4 publicaciones más comentadas y el resto juntas en "Otras", y al
   lado la lista con la cantidad y el porcentaje de cada una. Cada título lleva a su publicación.
5. Al pasar el puntero por un gráfico se ve el dato exacto. *Ver datos* cambia el gráfico por una tabla con todos los
   valores (en la torta, todas las publicaciones, no solo las 4 primeras).

**Instalar la aplicación (PWA)**

- En el navegador del celular o de la computadora aparece la opción de instalar Vestuario: queda con su ícono, se abre
  en su propia ventana y carga más rápido, porque guarda la aplicación y las imágenes. Para ver publicaciones nuevas
  hace falta conexión.

## 5. Reglas de negocio

| Dato | Regla |
|---|---|
| Nombre y apellido | Obligatorios, hasta 50 caracteres cada uno |
| Correo | Obligatorio, con formato válido, único en la base. Se guarda en minúsculas |
| Nombre de usuario | Obligatorio, único, de 3 a 20 caracteres: letras, números, punto o guion bajo. Se guarda en minúsculas |
| Contraseña | Al menos 8 caracteres, una mayúscula y un número. Se pide dos veces y las dos tienen que coincidir |
| Fecha de nacimiento | Obligatoria, no puede ser futura ni anterior a 1900 |
| Posición | Obligatoria: arquero, defensor, mediocampista o delantero |
| Club | Opcional. Uno de los 30 clubes de la Liga Profesional 2026, elegido de la lista. Si se deja vacío, el perfil muestra "Sin club" |
| Descripción breve | Obligatoria, hasta 200 caracteres, con un contador a la vista |
| Imagen de perfil | Opcional. JPG, PNG, GIF o WEBP de hasta 2 MB. Sin foto, se muestra una silueta |
| Perfil | Toda cuenta que se registra es "usuario" y no lo puede elegir. Un administrador, al crear una cuenta desde el dashboard, elige "usuario" o "administrador" |
| Estado de la cuenta | Activa al crearse. Un administrador la deshabilita (baja lógica) y la vuelve a habilitar. Deshabilitada, no puede ingresar ni usar una sesión abierta. Un administrador no puede deshabilitar su propia cuenta |
| Sesión | Dura 15 minutos desde que se emite el token. Extenderla da 15 minutos más desde ese momento |
| Título de una publicación | Obligatorio, hasta 100 caracteres |
| Mensaje de una publicación | Obligatorio, hasta 1000 caracteres, con contador a la vista |
| Imagen de una publicación | Opcional. JPG, PNG, GIF o WEBP de hasta 2 MB |
| "Me gusta" | Uno por usuario y publicación. Solo se puede quitar si se había dado |
| Comentario | Obligatorio, hasta 500 caracteres. Lleva el autor y la fecha. Un texto con solo espacios cuenta como vacío |
| Editar un comentario | Solo su autor (tampoco un administrador). Queda marcado como editado |
| Eliminar una publicación | Solo el autor o un administrador. Es una baja lógica: deja de mostrarse junto con sus comentarios |
| Listado | Solo publicaciones activas. Por fecha (la más nueva primero) o por cantidad de "Me gusta"; a igual cantidad, la más nueva primero |
| Dashboards | Solo para administradores: un usuario que escribe la dirección vuelve a Publicaciones, y la API responde 403 |
| Lapso de las estadísticas | Desde y hasta, con "desde" no posterior a "hasta" y como mucho un año entre los dos. Sin fechas, los últimos 30 días |

Otras reglas:

- Los mensajes de la aplicación se muestran en modales, nunca con `alert()` del navegador.
- Las validaciones se hacen en la pantalla, para avisar en el momento, y se repiten en el servidor, que es el que
  decide.
- Ninguna respuesta del servidor incluye la contraseña, que se guarda encriptada.

## 6. Requerimientos por sprint

Referencias: `[x]` implementado · `[ ]` pendiente.

### Generales

- [x] Frontend en Angular
- [x] Servidor en NestJS
- [x] Base de datos MongoDB
- [x] Login y registro contra el servidor propio con JWT
- [x] Respuestas con status correctos (nunca 200 en errores ni 400 en respuestas correctas)
- [x] Diseño trabajado y uniforme, sin `alert()`: modales
- [x] Navegación entre pantallas e información clara al mostrar mensajes o realizar acciones
- [x] Publicaciones con título, mensaje e imagen opcional, "Me gusta" y comentarios
- [ ] Ver y editar el perfil propio (ver: hecho)
- [x] Solo se accede a la aplicación con sesión iniciada

### Sprint 1

**Front**

- [x] Proyecto Angular
- [x] Pantallas: Registro, Login, Publicaciones y Mi perfil
- [x] Deploy en hosting (<https://plaza-red-social.vercel.app>)
- [x] Navegación entre componentes, sin límites de acceso (hasta el sprint 3, que exige sesión)
- [x] Favicon propio
- [x] Login: formulario con validaciones y mensajes
- [x] Login por correo o nombre de usuario, únicos en la base
- [x] Contraseña de al menos 8 caracteres, una mayúscula y un número
- [x] Registro: formulario con validaciones y mensajes
- [x] Registro: nombre, apellido, correo, nombre de usuario, contraseña, repetir contraseña, fecha de nacimiento y descripción breve
- [x] Registro: campo de tipo file para la imagen de perfil
- [x] Atributo perfil: "usuario" por defecto, modificable a "administrador"

**Back**

- [x] Proyecto NestJS
- [x] Módulos Publicaciones, Autenticación y Usuarios
- [x] `POST` registro: recibe y valida los datos y guarda el usuario
- [x] Contraseña encriptada
- [x] Imagen de perfil guardada y su URL en la base
- [x] `POST` login: recibe usuario o correo y contraseña sin encriptar
- [x] El login encripta la contraseña recibida para compararla
- [x] El login devuelve todos los datos del usuario

### Sprint 2

**Front**

- [x] Publicaciones: listado ordenado por fecha por defecto
- [x] Cambiar el orden a cantidad de "Me gusta"
- [x] Cantidad limitada de publicaciones con paginación (de a 5)
- [x] Cada publicación es un componente (`app-tarjeta-publicacion`)
- [x] Dar y quitar "Me gusta"
- [x] Eliminar mis publicaciones
- [x] Mi perfil: todos los datos y la foto de perfil
- [x] Mi perfil: mis últimas 3 publicaciones con sus comentarios

**Back**

- [x] Alta, listado y baja lógica de publicaciones
- [x] `POST` publicación de un usuario con título, mensaje e imagen opcional guardada
- [x] `DELETE` baja lógica, solo del autor o de un administrador
- [x] `GET` listado con orden por fecha o "Me gusta", filtro por usuario y `offset`/`limit`
- [x] `POST` "Me gusta" (uno por usuario y publicación)
- [x] `DELETE` quitar el "Me gusta" propio

### Sprint 3

**Front**

- [x] Página publicación: publicación en grande con sus comentarios (`/publicaciones/:id`)
- [x] Escribir comentarios
- [x] Comentarios ordenados, carga limitada (de a 5) y botón "cargar más" sin perder los anteriores
- [x] Editar los comentarios propios, que quedan marcados como editados
- [x] Login y registro guardan el token en el navegador
- [x] Pantalla de carga con spinner que valida el token con `autorizar` y redirige a publicaciones o al login
- [x] A los 10 minutos de sesión, modal que avisa que quedan 5 y ofrece extenderla (refrescar el token)
- [x] Un 401 redirige al login

**Back**

- [x] Comentarios: listar, agregar y modificar
- [x] `POST` comentario con usuario y fecha
- [x] `PUT` modifica el mensaje y marca `modificado: true`
- [x] `GET` comentarios de una publicación, paginados, más recientes primero
- [x] Login y registro generan un JWT con la identidad del usuario y su rol
- [x] El token se devuelve en la respuesta
- [x] El token vence a los 15 minutos
- [x] `POST` autorizar: 401 si el token no es válido; si es válido, devuelve los datos del usuario
- [x] `POST` refrescar: devuelve un token nuevo con el mismo payload y 15 minutos más

### Sprint 4

**Front**

- [x] El administrador puede dar de baja cualquier publicación (y sus comentarios dejan de estar disponibles)
- [x] Dashboard de usuarios, solo para administradores (`/dashboard/usuarios`)
- [x] Listado de usuarios
- [x] Alta de usuarios con los datos del registro y radio buttons para elegir "usuario" o "administrador"
- [x] Alta y baja lógica de usuarios; un usuario deshabilitado no puede ingresar y se le avisa en el login
- [x] Formulario de registro de nuevos usuarios (el mismo componente del registro, `app-formulario-cuenta`)
- [x] Dashboard de estadísticas (`/dashboard/estadisticas`) con gráficos de distintos tipos y lapso de tiempo elegible:
  - [x] Publicaciones por usuario (barras)
  - [x] Comentarios realizados (líneas, por día)
  - [x] Comentarios por publicación (torta)
- [x] PWA (instalable, con service worker y manifest)
- [x] 3 pipes propios: `tiempoRelativo`, `nombrePosicion` y `plural`
- [x] 3 directivas propias: `*appSoloAdmin`, `appImagenRespaldo` y `appAutoAltura`

**Back**

- [x] Usuarios: listar, dar de alta y hacer bajas y altas lógicas, validando que el token sea de un administrador
- [x] `GET` listado de usuarios
- [x] `POST` alta de usuario con perfil elegible
- [x] `DELETE` deshabilitar usuario (al intentar ingresar se le avisa que no está autorizado)
- [x] `POST` rehabilitar usuario
- [x] Estadísticas: rutas `GET` para los gráficos, solo para administradores

### Sprint 5 (recuperatorio)

- [ ] Ver el perfil de otro usuario al tocar su nombre o foto, con sus datos y sus últimas 3 publicaciones
- [ ] En ese perfil se mantienen las acciones del administrador (baja lógica de publicaciones)
- [ ] Scroll infinito en lugar de la paginación tradicional
- [ ] Estadísticas: ingresos por usuario, visitas a mi perfil (de otros usuarios) y "Me gusta" por día
- [ ] Back: la lógica necesaria para lo anterior

### Sprint 6 (final)

- [ ] Guardar una publicación o quitarla de guardados, indicando si está guardada
- [ ] Pantalla de guardados
- [ ] Botón compartir: elegir un usuario al que compartirle la publicación
- [ ] Pantalla de compartidos, con quién compartió cada publicación
- [ ] Ordenar por cantidad de veces guardada y compartida
- [ ] Back: `POST` guardar, `POST` quitar de guardados, `POST` compartir, `GET` compartidos conmigo y los nuevos ordenamientos

---

## 7. Criterios adoptados

Puntos que la consigna no define y cómo se resolvieron:

| Tema | Criterio |
|---|---|
| Temática | Red social de jugadores de fútbol. Se agregan dos datos al registro que la consigna no pide: la posición (obligatoria, para que cada jugador se presente en la cancha) y el club (opcional). La posición se ve junto al nombre en cada publicación, con el escudo del club. |
| Club | Desde el sprint 4 se elige de una lista con los 30 clubes de la Liga Profesional 2026, en lugar de escribirlo: así cada club tiene su escudo y su cancha. Sigue siendo opcional, para quien juega sin club o entre amigos. Una cuenta vieja con un club escrito a mano lo sigue mostrando como texto, sin escudo. |
| Fondo de la aplicación | La cancha del club del jugador, con un velo verde oscuro para que se lea todo. En el registro se ve la del club elegido apenas se lo elige. Sin sesión, sin club o con un club sin foto de licencia libre (Deportivo Riestra), una cancha dibujada. |
| Imágenes de los clubes | Las fotos de los estadios y los escudos salen de Wikimedia Commons y Wikipedia, con licencias libres (Creative Commons o dominio público) salvo algún escudo que se usa como cita. Las licencias piden nombrar al autor: el pie de cada pantalla nombra el estadio y al autor de la foto, y la página *Créditos de las imágenes* lista todos. |
| Datos de ejemplo | El backend trae un comando (`npm run sembrar`) que carga una cuenta administradora y 10 jugadores de la Liga Profesional con su nombre, fecha de nacimiento, posición y club reales (a noviembre de 2026), con publicaciones, comentarios y "Me gusta" repartidos en los últimos 30 días para que las estadísticas tengan datos. Son cuentas de demostración: las publicaciones y los comentarios son inventados y las fotos de perfil son siluetas con los colores de cada club, no fotos de los jugadores. |
| Correo o nombre de usuario para ingresar | Se aceptan los dos en el mismo campo. Los dos son únicos, así que cualquiera identifica a la cuenta. Como el nombre de usuario no admite `@`, un texto con `@` siempre es un correo. |
| Mayúsculas | Correo y nombre de usuario se guardan en minúsculas: `Ana`, `ana` y `ANA` son la misma cuenta. La contraseña sí distingue mayúsculas. |
| Campos obligatorios | Todos los del registro, incluida la descripción breve, salvo dos: el club, porque no está en la consigna, y la imagen de perfil, que desde la versión 0.4.1 es opcional (igual que la de las publicaciones): sin foto, la aplicación muestra una silueta. |
| Imagen de perfil | JPG, PNG, GIF o WEBP de hasta 2 MB. El formato se comprueba por el contenido del archivo, no por su extensión. |
| Fecha de nacimiento | Sin edad mínima: la consigna no la pide. Solo se rechazan fechas futuras o anteriores a 1900. |
| Repetir contraseña | Se compara en la pantalla. Al servidor viaja una sola vez. |
| Cambio de perfil | No se elige al registrarse: si el formulario manda un perfil, se ignora. Un administrador elige el perfil al crear una cuenta desde el dashboard. El de una cuenta que ya existe se cambia con un comando del backend (`npm run perfil`), porque la consigna no pide hacerlo desde la pantalla. |
| Después de registrarse | La sesión queda iniciada, sin pedir que ingrese de nuevo: el registro devuelve el token igual que el login. |
| Acceso a las pantallas | Desde el sprint 3 todas las pantallas piden sesión, salvo *Ingresar*, *Crear cuenta* y la página 404. Con la sesión iniciada, *Ingresar* y *Crear cuenta* llevan a Publicaciones. |
| Token | Se devuelve en el cuerpo de la respuesta (no en cookies) y el front lo guarda en `localStorage`, para que la sesión sobreviva a recargar la página. Viaja en el header `Authorization: Bearer <token>`. |
| Rol en el token | El token lleva el perfil, como pide la consigna, pero los permisos se deciden con el perfil guardado en la base, que se lee en cada pedido: si un administrador cambia el perfil de una cuenta, rige enseguida, sin esperar a que venza el token. |
| Pantalla de carga | Se pasa por ella una vez por visita: al abrir o recargar la aplicación con una sesión guardada. Después de ingresar o registrarse no hace falta, porque el servidor acaba de emitir el token. Si el servidor no responde (por ejemplo, mientras Render se despierta), ofrece reintentar en lugar de cerrar la sesión. |
| Aviso de vencimiento | Aparece 5 minutos antes de que venza el token (a los 10 de sesión). Si al recargar quedan menos de 5, aparece enseguida y dice cuántos quedan. Si no se extiende, al vencer se vuelve al login. |
| Refrescar | Devuelve un token con el mismo payload (identidad y rol) y 15 minutos desde ese momento. Con un token ya vencido responde 401: hay que volver a ingresar. |
| Respuesta 401 | Cualquier 401 a un pedido que llevaba token cierra la sesión y vuelve al login con un aviso. El 401 de credenciales incorrectas en el login no, porque ese pedido no lleva token. |
| Error al ingresar | El mensaje no dice si falló el usuario o la contraseña, para no revelar qué cuentas existen. |
| Publicaciones por página | 5, para que la paginación se note con pocas publicaciones. La API acepta hasta 50 por pedido. |
| Orden por "Me gusta" | A igual cantidad de "Me gusta", primero la más nueva. |
| "Me gusta" a una publicación propia | Se permite: la consigna no lo prohíbe. |
| Quitar un "Me gusta" que no se dio | La API responde 404 (ese "Me gusta" no existe). Dar uno repetido responde 409. |
| Eliminar | Pide confirmación. La publicación no se borra de la base (baja lógica) y no hay forma de recuperarla desde la aplicación. Sus comentarios dejan de poder verse, escribirse y editarse. |
| Administrador y publicaciones | Ve el botón para eliminar en todas las publicaciones; la confirmación aclara que es ajena y de quién. No puede editar comentarios ajenos. |
| Cuenta deshabilitada | El login responde que no está autorizado a ingresar (y el modal lo dice con ese título). Si la cuenta tenía la sesión abierta, el servidor la rechaza en el próximo pedido aunque el token no haya vencido, y la aplicación vuelve al login con el aviso "Tu cuenta fue deshabilitada". Sus publicaciones y comentarios siguen a la vista: la consigna solo le quita el acceso. |
| Deshabilitarse a uno mismo | No se puede: el administrador se quedaría afuera. En el listado, la cuenta propia dice "Tu cuenta" en lugar del botón. |
| Alta de cuentas desde el dashboard | Usa el mismo formulario del registro (el mismo componente), más el perfil. No inicia sesión con la cuenta nueva: el administrador sigue con la suya. |
| Estadísticas: lapso | Uno solo para los tres gráficos, elegido arriba: últimos 7, 30 o 90 días (los días se cuentan enteros, desde las 0 h del primero) o dos fechas a elección. Como mucho un año, para que los gráficos sigan siendo legibles. |
| Estadísticas: qué se cuenta | Publicaciones por usuario cuenta también las que después se dieron de baja, porque se hicieron en el lapso. Comentarios por día usa la hora de Argentina y muestra los días sin comentarios en 0. Comentarios por publicación no cuenta las publicaciones dadas de baja, porque sus comentarios ya no están disponibles. |
| Estadísticas: tipos de gráfico | Barras para comparar cuánto publicó cada uno, líneas para ver cómo cambian los comentarios con los días y torta para ver qué parte del total se llevó cada publicación, como pide la consigna (tipos distintos). La torta muestra las 4 más comentadas y junta el resto en "Otras", porque con muchas porciones no se lee; la tabla tiene todas. |
| Estadísticas: colores | El verde de Vestuario y tres colores más, elegidos para que se distingan también con daltonismo. Cada publicación conserva su color en la torta al cambiar el lapso, si sigue entre las primeras. Los datos nunca dependen solo del color: la lista de la torta y la tabla *Ver datos* dicen todos los valores. |
| Pipes propios | `tiempoRelativo` ("recién", "hace 5 min", "hace 3 h", "ayer", "hace 4 días" y, de una semana en adelante, la fecha: "12 oct 2026"; al pasar el puntero se ve la fecha y hora exactas), `nombrePosicion` (`mediocampista` → "Mediocampista") y `plural` (`3 \| plural: 'comentario'` → "3 comentarios"). |
| Directivas propias | `*appSoloAdmin` (muestra lo que envuelve solo a los administradores: los accesos a los dashboards), `appImagenRespaldo` (si una cuenta no tiene foto de perfil o la foto no carga, pone una silueta) y `appAutoAltura` (los cuadros de texto crecen a medida que se escribe). |
| PWA | Se instala desde el navegador y guarda la aplicación y las imágenes ya vistas para abrir más rápido. Los datos (publicaciones, comentarios) siempre se piden al servidor, porque tienen que estar al día y llevan la sesión. Solo funciona en el build de producción. |
| Comentarios por carga | 5 por vez en la página de la publicación. Si alguien comenta mientras tanto, *Cargar más* no repite los que ya se ven. |
| Editar comentarios | Solo el autor, ni siquiera un administrador (la consigna habla de "los comentarios propios"). Siempre queda marcado como editado, aunque el texto no cambie. Los comentarios no se eliminan: la consigna no lo pide. |
| Comentarios en Mi perfil | Se muestran los 3 más recientes de cada publicación y un enlace a su página para ver todos y comentar. |
| Nombre de la aplicación | "Vestuario", por el lugar donde se junta el plantel antes y después de cada partido. |
