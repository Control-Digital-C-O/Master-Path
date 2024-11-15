# Frameworks para el uso de Apps webs python
from flask import Flask, render_template, request

app = Flask(__name__)  # Varible de ruta

# Rutas de procesamiento (direccionamiento)


@app.route('/')  # Ruta principal
def home():
    user_ip = request.remote_addr
    return render_template("home.html", user_ip=user_ip)


@app.route('/about')
def about():
    return render_template("about.html")


# Validacion de la ruta, para rotornar home por defecto
# Si no, escucha nuevas peticiones
if __name__ == '__main__':
    # Habilitamos el entorno de prueba
    app.run(host='0.0.0.0', port=5000, debug=True)
