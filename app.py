from flask import Flask, request, jsonify, render_template,redirect, url_for,session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from models import db, Vino, Cliente, Pedido, DetallePedido,Evento

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    migrate = Migrate(app, db)

    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return render_template('Index.html')

    @app.route('/tienda')
    def tienda():
        vinos = Vino.query.all()
        return render_template('Tienda.html', vinos=vinos)
    
    #Reservas-Eventos
    @app.route('/eventos')
    def eventos():
        eventos = Evento.query.all()
        return render_template('Eventos.html',eventos=eventos)
    
    @app.route('/reservar/<int:evento_id>', methods=['POST'])
    def reservar(evento_id):
        evento = Evento.query.get_or_404(evento_id)
        # cliente_id = request.form['cliente_id']  # Si tienes autenticación, usa esto.
        cantidad = int(request.form['cantidad'])
        total = cantidad * evento.precio

        nueva_reserva = Reserva(id_evento=evento_id, cantidad=cantidad, total=total)
        db.session.add(nueva_reserva)
        db.session.commit()
    
        return redirect(url_for('eventos'))

    @app.route('/cart')
    def cart():
        return 'Esta es la página del carrito.'

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            data = request.form
            hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
            new_cliente = Cliente(
                nombre=data['nombre'],
                email=data['email'],
                telefono=data.get('telefono'),
                direccion=data.get('direccion'),
                password=hashed_password
            )
            db.session.add(new_cliente)
            db.session.commit()
            return redirect(url_for('login'))
        return render_template('Registro.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            data = request.form
            cliente = Cliente.query.filter_by(email=data['email']).first()
            if cliente and check_password_hash(cliente.password, data['password']):
                session['cliente_id'] = cliente.id_cliente
                session['cliente_nombre'] = cliente.nombre  # Guarda el nombre del cliente en la sesión
                next_url = data.get('next', url_for('index'))
                return redirect(next_url)
            return jsonify({'message': 'Email o contraseña incorrectos'}), 401
        return render_template('Login.html')

    @app.route('/logout')
    def logout():
        session.pop('cliente_id', None)
        session.pop('cliente_nombre', None)
        return redirect(url_for('index'))
    
    
    # Inicio de pedido
    @app.route('/pedido', methods=['POST'])
    def realizar_pedido():
        data = request.get_json()
        cliente_id = session.get('cliente_id')
        if not cliente_id:
            return jsonify({'message': 'Debe iniciar sesión para realizar un pedido'}), 401

        vinos_pedidos = data.get('vinos', [])
        if not vinos_pedidos:
            return jsonify({'message': 'Debe especificar los vinos a pedir'})

        total = 0
        for item in vinos_pedidos:
            vino = Vino.query.get(item['id_vino'])
            if not vino or vino.cantidad < item['cantidad']:
                return jsonify({'message': f'El vino con id {item["id_vino"]} no está disponible en la cantidad solicitada'}), 400
            total += vino.precio * item['cantidad']

        try:
            new_pedido = Pedido(id_cliente=cliente_id, total=total, estado='pendiente')
            db.session.add(new_pedido)
            db.session.flush()  # Flush para obtener el ID del nuevo pedido antes de hacer commit

            for item in vinos_pedidos:
                detalle = DetallePedido(
                    id_pedido=new_pedido.id_pedido,
                    id_vino=item['id_vino'],
                    cantidad=item['cantidad'],
                    precio_unitario=Vino.query.get(item['id_vino']).precio  # Precio unitario
                )
                db.session.add(detalle)
                vino.cantidad -= item['cantidad']  # Reducir el stock del vino
            
            db.session.commit()  # Confirmar todas las operaciones en una sola transacción
            return jsonify({'message': 'Pedido realizado exitosamente', 'order_id': new_pedido.id_pedido})
        
        except Exception as e:
            db.session.rollback()  # Revertir en caso de error
            return jsonify({'message': 'Error al realizar el pedido', 'error': str(e)}), 500
        

    @app.route('/pedido/<int:id_pedido>/state', methods=['PUT'])
    def actualizar_estado(id_pedido):
        data = request.get_json()
        pedido = Pedido.query.get_or_404(id_pedido)
        if 'estado' in data:
            pedido.estado = data['estado']
            db.session.commit()
            return jsonify({'message': 'Estado actualizado exitosamente'})
        return jsonify({'message': 'No se pudo actualizar el estado del pedido'}), 400

    @app.route('/pedido/<int:id_pedido>', methods=['DELETE'])
    def eliminar_pedido(id_pedido):
        pedido = Pedido.query.get_or_404(id_pedido)
        db.session.delete(pedido)
        db.session.commit()
        return jsonify({'message': 'Pedido eliminado exitosamente'})
    
    @app.route('/pedidos', methods=['GET'])
    def listar_pedidos():
        pedidos = Pedido.query.all()
        resultado = []
        for pedido in pedidos:
            detalles = DetallePedido.query.filter_by(id_pedido=pedido.id_pedido).all()
            detalle_pedidos = [{'id_vino': d.id_vino, 'cantidad': d.cantidad} for d in detalles]
            resultado.append({
                'id_pedido': pedido.id_pedido,
                'id_cliente': pedido.id_cliente,
                'fecha_pedido': pedido.fecha_pedido,
                'total': pedido.total,
                'estado': pedido.estado,
                'detalles': detalles_pedido
            })
        return jsonify(resultado)

    @app.route('/pedidos/<int:id_cliente>', methods=['GET'])
    def listar_pedidos_cliente(id_cliente):
        pedidos = Pedido.query.filter_by(id_cliente=id_cliente).all()
        resultado = []
        for pedido in pedidos:
            detalles = DetallePedido.query.filter_by(id_pedido=pedido.id_pedido).all()
            detalle_pedidos = [{'id_vino': d.id_vino, 'cantidad': d.cantidad} for d in detalles]
            resultado.append({
                'id_pedido': pedido.id_pedido,
                'id_cliente': pedido.id_cliente,
                'fecha_pedido': pedido.fecha_pedido,
                'total': pedido.total,
                'estado': pedido.estado,
                #'detalles': detalles_pedido
            })
        return jsonify(resultado)

    @app.route('/wines', methods=['POST'])
    def agregar_vino():
        data = request.get_json()
        new_vino = Vino(
            nombre=data['nombre'],
            tipo=data.get('tipo'),
            precio=data['precio'],
            cantidad=data['cantidad'],
            descripcion=data.get('descripcion'),
            imagen_url=data.get('imagen_url')
        )
        db.session.add(new_vino)
        db.session.commit()
        return jsonify({'message': 'Vino agregado exitosamente'})

    @app.route('/wines/<int:id_vino>', methods=['PUT'])
    def actualizar_vino(id_vino):
        data = request.get_json()
        vino = Vino.query.get_or_404(id_vino)
        if 'nombre' in data:
            vino.nombre = data['nombre']
        if 'tipo' in data:
            vino.tipo = data['tipo']
        if 'precio' in data:
            vino.precio = data['precio']
        if 'cantidad' in data:
            vino.cantidad = data['cantidad']
        if 'descripcion' in data:
            vino.descripcion = data['descripcion']
        if 'imagen_url' in data:
            vino.imagen_url = data['imagen_url']
        
        db.session.commit()
        return jsonify({'message': 'Vino actualizado exitosamente'})
    

    @app.route('/wines/<int:id_vino>/stock', methods=['PUT'])
    def actualizar_stock(id_vino):
        data = request.get_json()
        vino = Vino.query.get_or_404(id_vino)
        if 'cantidad' in data:
            vino.cantidad = data['cantidad']
            db.session.commit()
            return jsonify({'message': 'Stock actualizado exitosamente'})
        return jsonify({'message': 'La cantidad de stock es requerida'}), 400
    
    # Ruta para agregar productos al carrito
    @app.route('/add-to-cart', methods=['POST'])
    def add_to_cart():
        data = request.get_json()
        cliente_id = session.get('cliente_id')
        if not cliente_id:
            return jsonify({'message': 'Debe iniciar sesión para agregar productos al carrito'}), 401
        
        vino_id = data.get('vino_id')
        cantidad = data.get('cantidad')

        # Verificar si el vino existe y hay suficiente stock
        vino = Vino.query.get(vino_id)
        if not vino:
            return jsonify({'message': 'Vino no encontrado'}), 404

        if vino.cantidad < cantidad:
            return jsonify({'message': 'Stock insuficiente para este vino'}), 400

        # Crear o actualizar el carrito del cliente (asumimos que solo puede haber un pedido pendiente por cliente)
        pedido_pendiente = Pedido.query.filter_by(id_cliente=cliente_id, estado='pendiente').first()
        if not pedido_pendiente:
            pedido_pendiente = Pedido(id_cliente=cliente_id, estado='pendiente', total=0)
            db.session.add(pedido_pendiente)
            db.session.commit()

        # Crear el detalle del pedido (carrito)
        detalle_pedido = DetallePedido(id_pedido=pedido_pendiente.id_pedido, id_vino=vino_id, cantidad=cantidad)
        db.session.add(detalle_pedido)
        db.session.commit()

        return jsonify({'message': 'Producto agregado al carrito exitosamente'}), 200
    
    #Inicio de la reserva de eventos

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
