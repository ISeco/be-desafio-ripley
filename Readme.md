# BE Desafio Ripley

Este es un proyecto de Node.js con Typescript el cual esta hecho con una arquitectura hexagonal. El proyecto se conecta a una base de datos mysql consumiendo el servicio de RDS de Amazon Web Services. Para la gestion de usuarios utiliza el servicio Cognito de AWS el cual nos ayuda con la autenticación de usuarios y manejo de tokens de acceso.

Por ultimo, este proyecto tiene un Dockerfile el cual es construido y deployado en el servicio ECR el cual nos permite tener el registro de imágenes en un repository de Amazon. Para que el backend esté funcionado en la nube se procedió a crear un Cluster en ECS y un balanceador de carga para poder realizar peticiones con el protocolo http.