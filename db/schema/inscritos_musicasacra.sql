CREATE TABLE IF NOT EXISTS inscritos_musicasacra (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT NOT NULL,
	apellidos TEXT NOT NULL,
	correo TEXT NOT NULL,
	telefono TEXT NOT NULL,
	edad INTEGER NOT NULL CHECK (edad >= 0 AND edad <= 120),
	sexo TEXT NOT NULL CHECK (sexo IN ('hombre', 'mujer')),
	nivel TEXT NOT NULL CHECK (nivel IN ('poca', 'media', 'alta', 'profesional', 'nose')),
	voz TEXT NOT NULL CHECK (voz IN ('soprano', 'alto', 'tenor', 'bajo', 'nose')),
	coro TEXT NOT NULL CHECK (coro IN ('si', 'no')),
	intolerancia TEXT,
	inscrito BOOLEAN NOT NULL DEFAULT FALSE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
