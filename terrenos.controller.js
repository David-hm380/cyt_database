const Terrenos = require('./terrenos.model');

const getTerrenos = async (req, res) => {
    try {
        const terrenos = await Terrenos.getAllTerrenos();
        res.json(terrenos);
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
    createTerreno,
    getTerrenoById,
    updateTerreno,
    deleteTerreno
};