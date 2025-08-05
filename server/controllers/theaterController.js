import Theater from '../models/Theater.js';

// Create a new theater
export const createTheater = async (req, res) => {
    try {
        const { name, location,row,seatsPerRow, screens } = req.body;

        const theater = new Theater({
            name,
            location,
            row,
            seatsPerRow,
            screens,
        });

        await theater.save();
        res.status(201).json({ message: 'Theater created successfully', theater });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create theater', error: err.message });
    }
};

// Get all theaters
export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find().sort({ name: 1 });
        res.status(200).json(theaters);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve theaters', error: err.message });
    }
};

// Get a theater by ID
export const getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) return res.status(404).json({ message: 'Theater not found' });

        res.status(200).json(theater);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch theater', error: err.message });
    }
};

// Update a theater
export const updateTheater = async (req, res) => {
    try {
        const updatedTheater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        if (!updatedTheater) return res.status(404).json({ message: 'Theater not found' });

        res.status(200).json({ message: 'Theater updated successfully', theater: updatedTheater });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update theater', error: err.message });
    }
};

// Delete a theater
export const deleteTheater = async (req, res) => {
    try {
        const deleted = await Theater.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Theater not found' });

        res.status(200).json({ message: 'Theater deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete theater', error: err.message });
    }
};
