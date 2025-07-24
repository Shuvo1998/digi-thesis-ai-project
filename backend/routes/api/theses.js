// backend/routes/api/theses.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // Import check and validationResult
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload'); // Multer middleware for file uploads
const Thesis = require('../../models/Thesis');
const User = require('../../models/User'); // Assuming you might need User model for user details

// @route   POST api/theses/upload
// @desc    Upload a new thesis
// @access  Private
router.post(
    '/upload',
    [
        auth, // Ensure user is authenticated
        upload.single('thesisFile'), // Handle single file upload named 'thesisFile'
        // Validation for text fields
        check('title', 'Thesis title is required').not().isEmpty(),
        check('abstract', 'Abstract is required').not().isEmpty(),
        // NEW FIELD VALIDATION
        check('authorName', 'Author name is required').not().isEmpty(),
        check('department', 'Department is required').not().isEmpty(),
        check('submissionYear', 'Submission year is required and must be a 4-digit number')
            .not().isEmpty()
            .isLength({ min: 4, max: 4 })
            .withMessage('Submission year must be 4 digits')
            .isNumeric()
            .withMessage('Submission year must be a number'),
        check('isPublic', 'isPublic must be a boolean').isBoolean().optional() // Optional, but validate if present
    ],
    async (req, res) => {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, return them
            // Also, if a file was uploaded before validation failed, clean it up
            if (req.file) {
                const fs = require('fs');
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if a file was actually uploaded by Multer
        if (!req.file) {
            return res.status(400).json({ msg: 'No thesis file uploaded' });
        }

        try {
            // Get user from token
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Extract fields from req.body
            const { title, abstract, keywords, authorName, department, submissionYear, isPublic } = req.body;

            // Create a new Thesis instance
            const newThesis = new Thesis({
                user: req.user.id,
                title,
                abstract,
                keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
                filePath: req.file.path, // Path where Multer saved the file
                fileName: req.file.originalname,
                fileSize: req.file.size,
                // Assign new fields
                authorName,
                department,
                submissionYear,
                isPublic: isPublic !== undefined ? isPublic : true // Default to true if not provided
            });

            // Save the thesis to the database
            const thesis = await newThesis.save();

            res.json({ msg: 'Thesis uploaded successfully', thesis });
        } catch (err) {
            console.error(err.message);
            // If an error occurs after file upload but before saving to DB, delete the file
            if (req.file) {
                const fs = require('fs');
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
        const limit = parseInt(req.query.limit) || 9; // Default 9 theses per page
        const skip = (page - 1) * limit;

        const totalTheses = await Thesis.countDocuments({ status: 'approved', isPublic: true });
        const theses = await Thesis.find({ status: 'approved', isPublic: true })
            .sort({ uploadDate: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limit)
            .populate('user', ['username', 'email']); // Populate user details

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

        // Fetch all pending theses, populate user info
        const pendingTheses = await Thesis.find({ status: 'pending' })
            .sort({ uploadDate: -1 })
            .populate('user', ['username', 'email']);

        // Return the pending theses within a paginated structure, even if not fully paginated yet
        res.json({
            theses: pendingTheses,
            currentPage: 1, // Defaulting for now
            totalPages: 1, // Defaulting for now
            totalTheses: pendingTheses.length
        });
    } catch (err) {
        console.error(err.message);
        // Log the full error to get more details on Render logs
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

        // Check if the thesis is public and approved
        const isPublicAndApproved = thesis.isPublic && thesis.status === 'approved';

        // Check if the logged-in user is the owner or an admin/supervisor
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

        // Check if user is owner, admin, or supervisor
        const user = await User.findById(req.user.id);
        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to perform plagiarism check on this thesis' });
        }

        // Simulate plagiarism check (replace with actual AI call)
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

        // Check if user is owner, admin, or supervisor
        const user = await User.findById(req.user.id);
        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to perform grammar check on this thesis' });
        }

        // Simulate grammar check (replace with actual AI call)
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

        // Check if user is owner OR admin/supervisor
        if (thesis.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'supervisor') {
            return res.status(401).json({ msg: 'User not authorized to delete this thesis' });
        }

        // Remove the file from the server's uploads directory
        const fs = require('fs');
        fs.unlink(thesis.filePath, async (err) => {
            if (err) {
                console.error('Error deleting thesis file from server:', err);
                // Even if file deletion fails, proceed to delete from DB
            }
            await thesis.deleteOne(); // Use deleteOne() instead of remove()
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
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query; // Get search query from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        if (!q) {
            return res.status(400).json({ msg: 'Search query (q) is required' });
        }

        // Create a case-insensitive regex for searching across multiple fields
        const searchRegex = new RegExp(q, 'i');

        const query = {
            status: 'approved',
            isPublic: true, // Only search public and approved theses
            $or: [
                { title: { $regex: searchRegex } },
                { abstract: { $regex: searchRegex } },
                { keywords: { $in: [searchRegex] } }, // Search within keywords array
                { authorName: { $regex: searchRegex } }, // Search by author name
                { department: { $regex: searchRegex } }, // Search by department
                // Only include submissionYear in $or if 'q' is a valid number
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
        // Log the full error to get more details on Render logs
        console.error("Error searching theses:", err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
