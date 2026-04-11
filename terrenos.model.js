const pool = require('../../db'); // tu conexión a PostgreSQL

const getAllTerrenos = async () => {
    const result = await pool.query('SELECT * FROM terrenos ORDER BY id DESC');
    return result.rows;
};

const getTerrenoById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM terrenos WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

const updateTerreno = async (id, data) => {
    const query = `
        UPDATE terrenos SET
            zona = $1,
            fraccionamiento = $2,
            uso_suelo = $3,
            regimen = $4,
            categoria = $5,
            tipo = $6,
            precio_m2 = $7,
            metros_cuadrados = $8,
            frente_metros = $9,
            fondo_metros = $10,
            stock = $11,
            entrega = $12,
            ubicacion = $13,
            vigencia_precio = $14,
            contacto_nombre = $15,
            contacto_telefono = $16
        WHERE id = $17
        RETURNING *
    `;

    const values = [
        data.zona,
        data.fraccionamiento,
        data.uso_suelo,
        data.regimen,
        data.categoria,
        data.tipo,
        data.precio_m2,
        data.metros_cuadrados,
        data.frente_metros,
        data.fondo_metros,
        data.stock,
        data.entrega,
        data.ubicacion,
        data.vigencia_precio,
        data.contacto_nombre,
        data.contacto_telefono,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteTerreno = async (id) => {
    const result = await pool.query(
        'DELETE FROM terrenos WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

const createTerreno = async (data) => {
    const query = `
        INSERT INTO terrenos (
            zona, fraccionamiento, uso_suelo, regimen, categoria, tipo,
            precio_m2, metros_cuadrados, frente_metros, fondo_metros,
            stock, entrega, ubicacion, vigencia_precio,
            contacto_nombre, contacto_telefono
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,
            $11,$12,$13,$14,
            $15,$16
        )
        RETURNING *
    `;

    const values = [
        data.zona,
        data.fraccionamiento,
        data.uso_suelo,
        data.regimen,
        data.categoria,
        data.tipo,
        data.precio_m2,
        data.metros_cuadrados,
        data.frente_metros,
        data.fondo_metros,
        data.stock,
        data.entrega,
        data.ubicacion,
        data.vigencia_precio,
        data.contacto_nombre,
        data.contacto_telefono
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getAllTerrenos,
    createTerreno,
    getTerrenoById,
    updateTerreno,
    deleteTerreno
};