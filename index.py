	# Frameworks para el uso de Apps webs python
from flask import Flask, render_template 

app = Flask(__name__) # Varible de ruta

# Rutas de procesamiento (direccionamiento)
@app.route('/') # Ruta principal
def home():
	return render_template("home.html")

@app.route('/about')
def about():
	return render_template("about.html")


# Validacion de la ruta, para rotornar home por defecto
# Si no, escucha nuevas peticiones
if __name__ == '__main__':
	app.run(debug=True) # Habilitamos el entorno de prueba