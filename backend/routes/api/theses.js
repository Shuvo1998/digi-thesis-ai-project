// backend/routes/api/theses.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const Thesis = require('../../models/Thesis');
const User = require('../../models/User');
const fs = require('fs');

// @route   POST api/theses/upload
// @desc    Upload a new thesis
// @access  Private
router.post(
    '/upload',
    [
        auth,
        upload.single('thesisFile'),
        check('title', 'Thesis title is required').not().isEmpty(),
        check('abstract', 'Abstract is required').not().isEmpty(),
        check('keywords', 'Keywords are required').not().isEmpty(),
        check('authorName', 'Author name is required').not().isEmpty(),
        check('department', 'Department is required').not().isEmpty(),
        check('submissionYear', 'Submission year is required and must be a 4-digit number')
            .not().isEmpty()
            .isLength({ min: 4, max: 4 })
            .isNumeric()
            .withMessage('Submission year must be a number'),
        check('isPublic', 'isPublic must be a boolean').isBoolean().optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No thesis file uploaded' });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const { title, abstract, keywords, authorName, department, submissionYear, isPublic } = req.body;

            const newThesis = new Thesis({
                user: req.user.id,
                title,
                abstract,
                keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
                filePath: req.file.path,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                authorName,
                department,
                submissionYear,
                isPublic: isPublic !== undefined ? isPublic : true,
                status: 'pending'
            });

            const thesis = await newThesis.save();
            res.json({ msg: 'Thesis uploaded successfully', thesis });
        } catch (err) {
            console.error(err.message);
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting uploaded file on server error:', unlinkErr);
                });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/theses/public
// @desc    Get all approved public theses with pagination
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const totalTheses = await Thesis.countDocuments({ status: 'approved', isPublic: true });
        const theses = await Thesis.find({ status: 'approved', isPublic: true })
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', ['username', 'email']);

        res.json({
            theses,
            currentPage: page,
            totalPages: Math.ceil(totalTheses / limit),
            totalTheses
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses
// @desc    Get all theses for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const theses = await Thesis.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.json(theses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/pending
// @desc    Get all pending theses (for admin/supervisor)
// @access  Private (Admin/Supervisor only)
router.get('/pending', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            return res.status(403).json({ msg: 'Access denied. Not authorized for this action.' });
        }

        const pendingTheses = await Thesis.find({ status: 'pending' })
            .sort({ uploadDate: -1 })
            .populate({
                path: 'user',
                select: 'username email'
            });

        res.json({
            theses: pendingTheses,
            currentPage: 1,
            totalPages: 1,
            totalTheses: pendingTheses.length
        });
    } catch (err) {
        console.error(err.message);
        console.error("Error fetching pending theses:", err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/:id
// @desc    Get thesis by ID
// @access  Private (User/Admin/Supervisor) or Public (if isPublic and approved)
router.get('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id).populate('user', ['username', 'email']);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        const isPublicAndApproved = thesis.isPublic && thesis.status === 'approved';
        const isOwnerOrAdmin = req.user && (thesis.user._id.toString() === req.user.id || req.user.role === 'admin' || req.user.role === 'supervisor');

        if (!isPublicAndApproved && !isOwnerOrAdmin) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to view this thesis.' });
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

// @route   PUT api/theses/approve/:id
// @desc    Approve a pending thesis (Admin/Supervisor only)
// @access  Private
router.put('/approve/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            return res.status(403).json({ msg: 'Access denied. Not authorized for this action.' });
        }

        let thesis = await Thesis.findById(req.params.id);
        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
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
});

// @route   PUT api/theses/reject/:id
// @desc    Reject a pending thesis (Admin/Supervisor only)
// @access  Private
router.put('/reject/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            return res.status(403).json({ msg: 'Access denied. Not authorized for this action.' });
        }

        let thesis = await Thesis.findById(req.params.id);
        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
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
});

// @route   POST api/theses/check-plagiarism/:id
// @desc    Check plagiarism for a thesis
// @access  Private (Owner, Admin, Supervisor)
router.post('/check-plagiarism/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        const user = await User.findById(req.user.id);
        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to perform plagiarism check on this thesis' });
        }

        const simulatedResult = Math.random() < 0.5
            ? 'Plagiarism check complete: 15% similarity found. Review required.'
            : 'Plagiarism check complete: 2% similarity found. No significant issues.';

        thesis.plagiarismResult = simulatedResult;
        await thesis.save();

        res.json({ msg: 'Plagiarism check initiated successfully. Result updated.', result: simulatedResult });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/theses/check-grammar/:id
// @desc    Check grammar for a thesis
// @access  Private (Owner, Admin, Supervisor)
router.post('/check-grammar/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        const user = await User.findById(req.user.id);
        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to perform grammar check on this thesis' });
        }

        const simulatedResult = `Grammar check complete:
- Found 3 spelling errors (e.g., 'teh' -> 'the').
- Found 2 grammatical issues (e.g., 'He go' -> 'He goes').
- Suggested rephrasing for clarity in paragraph 3.`;

        thesis.grammarResult = simulatedResult;
        await thesis.save();

        res.json({ msg: 'Grammar check initiated successfully. Result updated.', result: simulatedResult });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/theses/:id
// @desc    Delete a thesis
// @access  Private (Owner, Admin, Supervisor)
router.delete('/:id', auth, async (req, res) => {
    try {
        const thesis = await Thesis.findById(req.params.id);

        if (!thesis) {
            return res.status(404).json({ msg: 'Thesis not found' });
        }

        const user = await User.findById(req.user.id);

        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to delete this thesis' });
        }

        fs.unlink(thesis.filePath, async (err) => {
            if (err) {
                console.error('Error deleting thesis file from server:', err);
            }
            await thesis.deleteOne();
            res.json({ msg: 'Thesis removed' });
        });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Thesis not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/theses/search
// @desc    Search for approved public theses by title, abstract, keywords, author, department, year
// @access  Public (MODIFIED: Removed 'auth' middleware)
router.get('/search', async (req, res) => { // Removed 'auth' middleware here
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        if (!q) {
            return res.status(400).json({ msg: 'Search query (q) is required' });
        }

        const searchRegex = new RegExp(q, 'i');

        const query = {
            status: 'approved',
            isPublic: true,
            $or: [
                { title: { $regex: searchRegex } },
                { abstract: { $regex: searchRegex } },
                { keywords: { $in: [searchRegex] } },
                { authorName: { $regex: searchRegex } },
                { department: { $regex: searchRegex } },
                ...(isNaN(parseInt(q)) ? [] : [{ submissionYear: parseInt(q) }])
            ]
        };

        const totalTheses = await Thesis.countDocuments(query);
        const theses = await Thesis.find(query)
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', ['username', 'email']);

        res.json({
            theses,
            currentPage: page,
            totalPages: Math.ceil(totalTheses / limit),
            totalTheses
        });

    } catch (err) {
        console.error(err.message);
        console.error("Error searching theses:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
