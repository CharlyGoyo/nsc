CREATE TABLE IF NOT EXISTS inscritos_retiros (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL,
	apellidos TEXT NOT NULL,
	correo TEXT NOT NULL,
	edad INTEGER NOT NULL CHECK (edad >= 0 AND edad <= 120),
	intolerancia TEXT,
	donacion REAL NOT NULL CHECK (donacion >= 1),
	habitacion TEXT,
	inscrito BOOLEAN NOT NULL DEFAULT FALSE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
