// backend/routes/api/theses.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const auth = require('../../middleware/auth');
const authorizeRole = require('../../middleware/role');
const Thesis = require('../../models/Thesis');
const User = require('../../models/User'); // Import User model to populate user info

// --- Multer Setup (existing) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
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
        fileSize: 1024 * 1024 * 50
    }
});

// @route   POST api/theses/upload
// @desc    Upload a new thesis
// @access  Private
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
                const uploadedFilePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
                if (fs.existsSync(uploadedFilePath)) {
                    fs.unlinkSync(uploadedFilePath);
                }
                return res.status(400).json({ msg: 'Title and Abstract are required fields' });
            }

            const newThesis = new Thesis({
                user: req.user.id,
                title,
                abstract,
                keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
                filePath: path.join('uploads', req.file.filename),
                fileName: req.file.originalname,
                status: 'pending' // Default status for new uploads
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

// --- REORDERED ROUTES ---

// @route   GET api/theses/public
// @desc    Get all approved theses (publicly accessible)
// @access  Public
// This more specific route should come before /api/theses/:id
router.get('/public', async (req, res) => {
    try {
        const publicTheses = await Thesis.find({ status: 'approved' })
            .populate('user', ['username', 'email'])
            .sort({ uploadDate: -1 });
        res.json(publicTheses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/pending
// @desc    Get all pending theses (accessible by admin/supervisor)
// @access  Private (Admin/Supervisor)
// This more specific route should also come before /api/theses/:id
router.get(
    '/pending',
    auth,
    authorizeRole('admin', 'supervisor'),
    async (req, res) => {
        try {
            const pendingTheses = await Thesis.find({ status: 'pending' })
                .populate('user', ['username', 'email'])
                .sort({ uploadDate: 1 });
            res.json(pendingTheses);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/theses
// @desc    Get all theses for the authenticated user
// @access  Private
// This general route should come after more specific ones if its path is a prefix
router.get('/', auth, async (req, res) => {
    try {
        const theses = await Thesis.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.json(theses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/theses/:id
// @desc    Get a single thesis by ID (only if owned by authenticated user)
// @access  Private
// This general route with a parameter should come AFTER all specific static routes
router.get('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(thesis);
    } catch (err) {
        console.error(err.message);
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

    const thesisFields = {};
    if (title) thesisFields.title = title;
    if (abstract) thesisFields.abstract = abstract;
    if (keywords) {
        thesisFields.keywords = keywords.split(',').map(keyword => keyword.trim());
    }
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        thesisFields.status = status;
    }

    try {
        let thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        thesis = await Thesis.findByIdAndUpdate(
            req.params.id,
            { $set: thesisFields },
            { new: true }
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

// @route   PUT api/theses/approve/:id
// @desc    Approve a thesis (only accessible by admin or supervisor)
// @access  Private (Admin/Supervisor)
router.put(
    '/approve/:id',
    auth,
    authorizeRole('admin', 'supervisor'),
    async (req, res) => {
        try {
            const thesis = await Thesis.findById(req.params.id);

            if (!thesis) {
                return res.status(404).json({ msg: 'Thesis not found' });
            }

            if (thesis.status === 'approved') {
                return res.status(400).json({ msg: 'Thesis is already approved.' });
            }

            thesis.status = 'approved';
            await thesis.save();

            res.json({ msg: 'Thesis approved successfully', thesis });
        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Thesis not found' });
            }
            res.status(500).send('Server Error');
        }
    }
);


// @route   PUT api/theses/reject/:id
// @desc    Reject a thesis (only accessible by admin or supervisor)
// @access  Private (Admin/Supervisor)
router.put(
    '/reject/:id',
    auth,
    authorizeRole('admin', 'supervisor'),
    async (req, res) => {
        try {
            const thesis = await Thesis.findById(req.params.id);

            if (!thesis) {
                return res.status(404).json({ msg: 'Thesis not found' });
            }

            if (thesis.status === 'rejected') {
                return res.status(400).json({ msg: 'Thesis is already rejected.' });
            }

            thesis.status = 'rejected';
            await thesis.save();

            res.json({ msg: 'Thesis rejected successfully', thesis });
        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Thesis not found' });
            }
            res.status(500).send('Server Error');
        }
    }
);


// @route   DELETE api/theses/:id
// @desc    Delete a thesis (only if owned by authenticated user)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        if (thesis.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const filePathToDelete = path.join(__dirname, '..', '..', thesis.filePath);
        if (fs.existsSync(filePathToDelete)) {
            fs.unlinkSync(filePathToDelete);
            console.log(`Deleted file: ${filePathToDelete}`);
        } else {
            console.warn(`File not found for deletion: ${filePathToDelete}`);
        }

        await Thesis.deleteOne({ _id: req.params.id });

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
