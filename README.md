# Master-Path

Página de ejemplo para la práctica de aplicaciones web con Python y Flask.

## Para el uso o modificación del código

### Requisitos

1. **Node.js y npm**: necesarios para gestionar las dependencias y construir el código frontend.
   - **Instalación**: [Node.js](https://nodejs.org) incluye npm. Instala la última versión estable.
   - **Parcel**: Usado como bundler para agrupar y optimizar el código JavaScript y CSS.
     - Instalar con el comando: `npm install -g parcel`.

2. **Python 3.x**: requerido para ejecutar el servidor con Flask.
   - **Instalación**: Puedes descargar Python desde [python.org](https://www.python.org).

3. **Flask**: Framework de desarrollo web para Python utilizado en este proyecto.
   - **Instalación**: Ejecuta `pip install flask`.
   - **Extensiones necesarias**:
     - **Flask-CORS**: permite el intercambio de recursos de origen cruzado.
       - Instalación: `pip install flask-cors`.
     - **Flask-Script** (opcional): facilita la ejecución de comandos para desarrollo y testing.
       - Instalación: `pip install Flask-Script`.

4. **Firebase Realtime Database**: base de datos utilizada para almacenar la información de los usuarios y cursos.
   - **Configuración**: Asegúrate de configurar las credenciales de Firebase en el archivo de configuración.

5. **Configuración de entorno en PythonAnywhere**:
   - **Variables de Entorno**: Asegúrate de definir variables de entorno sensibles (e.g., claves de API) en la configuración de PythonAnywhere para evitar exponer información confidencial en el código fuente.
   - **Configuración del servidor web**: PythonAnywhere requiere configuraciones específicas para ejecutar aplicaciones Flask. Sigue [esta guía](https://help.pythonanywhere.com/pages/Flask/) para configurarlo.

### Recomendaciones adicionales

- **Gestor de dependencias virtuales**: Se recomienda usar `venv` o `virtualenv` para crear un entorno virtual aislado.
  - **Creación**: `python3 -m venv venv`
  - **Activación**: 
    - En Unix/macOS: `source venv/bin/activate`
    - En Windows: `venv\Scripts\activate`

Estas recomendaciones y requisitos asegurarán que cualquier colaborador o desarrollador pueda replicar el entorno y contribuir al proyecto sin problemas.
