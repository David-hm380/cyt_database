const Terrenos = require('./terrenos.model');

const getTerrenos = async (req, res) => {
    try {
        const terrenos = await Terrenos.getAllTerrenos();
        res.json(terrenos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTerrenosPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Obtener terrenos paginados
        const terrenos = await Terrenos.getTerrenosPaginated(limit, offset);
        
        // Obtener total para cálculo de paginación
        const totalResult = await Terrenos.getTotalCount();
        const total = totalResult.total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: terrenos,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTerrenoById = async (req, res) => {
    try {
        const { id } = req.params;
        const terreno = await Terrenos.getTerrenoById(id);

        if (!terreno) {
            return res.status(404).json({ message: 'Terreno no encontrado' });
        }

        res.json(terreno);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTerreno = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Terrenos.updateTerreno(id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: 'Terreno no encontrado' });
        }

        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTerreno = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Terrenos.deleteTerreno(id);

        if (!eliminado) {
            return res.status(404).json({ message: 'Terreno no encontrado' });
        }

        res.json({ message: 'Terreno eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTerreno = async (req, res) => {

    try {
        const nuevo = await Terrenos.createTerreno(req.body);

        res.json(nuevo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTerrenos,
    getTerrenosPaginated,
    createTerreno,
    getTerrenoById,
    updateTerreno,
    deleteTerreno
};