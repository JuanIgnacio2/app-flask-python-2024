from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id_cliente = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    telefono = db.Column(db.String(15))
    direccion = db.Column(db.String(255))
    fecha_registro = db.Column(db.DateTime, default=db.func.current_timestamp())
    password = db.Column(db.String(255), nullable=False)

class Vino(db.Model):
    __tablename__ = 'vinos'
    id_vino = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50))
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    descripcion = db.Column(db.Text)
    imagen_url = db.Column(db.String(255))

class Pedido(db.Model):
    __tablename__ = 'pedidos'
    id_pedido = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('clientes.id_cliente'))
    fecha_pedido = db.Column(db.DateTime, default=db.func.current_timestamp())
    total = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.String(50), default='pendiente')
    detalles = db.relationship('DetallePedido', backref='pedido', lazy=True)

class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedidos'
    id_detalle = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedidos.id_pedido', ondelete='CASCADE'))
    id_vino = db.Column(db.Integer, db.ForeignKey('vinos.id_vino'))
    cantidad = db.Column(db.Integer, nullable=False)
    vino = db.relationship('Vino', backref='pedido_detalles')
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)

class Factura(db.Model):
    __tablename__ = 'facturas'
    id_factura = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedidos.id_pedido', ondelete='CASCADE'))
    fecha_factura = db.Column(db.DateTime, default=db.func.current_timestamp())
    total = db.Column(db.Numeric(10, 2), nullable=False)
    metodo_pago = db.Column(db.String(50))
    estado = db.Column(db.String(50))

class Evento(db.Model):
    __tablename__ = 'eventos'
    id_evento = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    fecha = db.Column(db.DateTime, nullable=False)
    lugar = db.Column(db.String(255))
    capacidad = db.Column(db.Integer)
    precio = db.Column(db.Numeric(10, 2))
    imagen_url = db.Column(db.String(255))  # Nuevo campo para la URL de la imagen

class Reserva(db.Model):
    __tablename__ = 'reservas'
    id_reserva = db.Column(db.Integer, primary_key=True)
    id_evento = db.Column(db.Integer, db.ForeignKey('eventos.id_evento', ondelete='CASCADE'))
    id_cliente = db.Column(db.Integer, db.ForeignKey('clientes.id_cliente'))
    fecha_reserva = db.Column(db.DateTime, default=db.func.current_timestamp())
    cantidad = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.String(50), default='pendiente')
