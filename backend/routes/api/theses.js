// backend/routes/api/theses.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import file system module for deleting files

const auth = require('../../middleware/auth');
const Thesis = require('../../models/Thesis');

// --- Multer Setup (already defined, keeping for context) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB
    }
});

// @route   POST api/theses/upload
// @desc    Upload a new thesis
// @access  Private
// (This route is already in your file, keeping for full context)
router.post(
    '/upload',
    auth,
    upload.single('thesisFile'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }

            const { title, abstract, keywords } = req.body;

            if (!title || !abstract) {
                fs.unlinkSync(req.file.path); // Delete the uploaded file
                return res.status(400).json({ msg: 'Title and Abstract are required fields' });
            }

            const newThesis = new Thesis({
                user: req.user.id,
                title,
                abstract,
                keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
                filePath: req.file.path,
                fileName: req.file.originalname,
            });

            await newThesis.save();

            res.status(201).json({
                msg: 'Thesis uploaded successfully',
                thesis: newThesis,
            });

        } catch (err) {
            console.error(err.message);
            if (err.message === 'Only PDF files are allowed!') {
                return res.status(400).json({ msg: err.message });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/theses
// @desc    Get all theses for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find all theses where the 'user' field matches the authenticated user's ID
        const theses = await Thesis.find({ user: req.user.id }).sort({ uploadDate: -1 }); // Sort by most recent
        res.json(theses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/:id
// @desc    Get a single thesis by ID (only if owned by authenticated user)
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        // Check if thesis exists
        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        // Check if the authenticated user owns the thesis
        // Convert both to string for comparison as req.user.id is a string, and thesis.user is an ObjectId
        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(thesis);
    } catch (err) {
        console.error(err.message);
        // Handle cases where ID is not a valid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/theses/:id
// @desc    Update a thesis (only if owned by authenticated user)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { title, abstract, keywords, status } = req.body;

    // Build thesis fields object
    const thesisFields = {};
    if (title) thesisFields.title = title;
    if (abstract) thesisFields.abstract = abstract;
    if (keywords) {
        thesisFields.keywords = keywords.split(',').map(keyword => keyword.trim());
    }
    // Only allow status update if it's a valid enum value
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        thesisFields.status = status;
    }

    try {
        let thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        // Check if the authenticated user owns the thesis
        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update the thesis
        thesis = await Thesis.findByIdAndUpdate(
            req.params.id,
            { $set: thesisFields }, // Use $set to update only provided fields
            { new: true } // Return the updated document
        );

        res.json({ msg: 'Thesis updated successfully', thesis });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/theses/:id
// @desc    Delete a thesis (only if owned by authenticated user)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        // Check if the authenticated user owns the thesis
        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the associated file from the file system
        if (fs.existsSync(thesis.filePath)) {
            fs.unlinkSync(thesis.filePath);
            console.log(`Deleted file: ${thesis.filePath}`);
        } else {
            console.warn(`File not found for deletion: ${thesis.filePath}`);
        }

        // Remove the thesis document from the database
        await Thesis.deleteOne({ _id: req.params.id }); // Using deleteOne with a query

        res.json({ msg: 'Thesis removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;