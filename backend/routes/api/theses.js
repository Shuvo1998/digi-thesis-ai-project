// backend/routes/api/theses.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const config = require('config');

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

// @route   POST api/theses/upload (existing)
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

// --- REORDERED ROUTES (existing) ---

// @route   GET api/theses/public (existing)
// @desc    Get all approved theses (publicly accessible)
// @access  Public
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
// @desc    Get all pending theses with pagination (accessible by admin/supervisor)
// @access  Private (Admin/Supervisor)
router.get(
    '/pending',
    auth, // Ensure user is authenticated
    authorizeRole('admin', 'supervisor'), // Ensure user has 'admin' or 'supervisor' role
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const limit = parseInt(req.query.limit) || 10; // Items per page, default to 10
            const skipIndex = (page - 1) * limit; // Calculate how many documents to skip

            // Get total count of pending theses for pagination info
            const totalPendingTheses = await Thesis.countDocuments({ status: 'pending' });

            // Find all theses with status 'pending'
            // Populate the 'user' field to get username/email of the uploader
            const pendingTheses = await Thesis.find({ status: 'pending' })
                .populate('user', ['username', 'email']) // Get uploader details
                .sort({ uploadDate: 1 }) // Sort by oldest first for approval queue
                .limit(limit)
                .skip(skipIndex);

            res.json({
                theses: pendingTheses,
                currentPage: page,
                totalPages: Math.ceil(totalPendingTheses / limit),
                totalTheses: totalPendingTheses,
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route   GET api/theses (existing)
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


// @route   GET api/theses/:id (existing)
// @desc    Get a single thesis by ID (only if owned by authenticated user)
// @access  Private
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


// @route   POST api/theses/check-plagiarism/:id (existing)
// @desc    Trigger plagiarism check for a thesis using Gemini API
// @access  Private (Owner or Admin/Supervisor)
router.post(
    '/check-plagiarism/:id',
    auth,
    async (req, res) => {
        try {
            const thesis = await Thesis.findById(req.params.id);

            if (!thesis) {
                return res.status(404).json({ msg: 'Thesis not found' });
            }

            // Authorization: Only the owner or an admin/supervisor can trigger the check
            if (thesis.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
                return res.status(401).json({ msg: 'User not authorized to perform this action.' });
            }

            // Construct the absolute path to the PDF file
            const pdfFilePath = path.join(__dirname, '..', '..', thesis.filePath);

            // Check if the file exists
            if (!fs.existsSync(pdfFilePath)) {
                return res.status(404).json({ msg: 'Thesis PDF file not found on server.' });
            }

            // Read PDF file as buffer
            const dataBuffer = fs.readFileSync(pdfFilePath);

            // Parse PDF to extract text
            const data = await pdf(dataBuffer);
            const thesisText = data.text;

            if (!thesisText || thesisText.trim().length < 50) { // Minimum text length for meaningful check
                return res.status(400).json({ msg: 'Could not extract sufficient text from PDF for plagiarism check.' });
            }

            // --- Call Gemini API for Plagiarism Check ---
            const prompt = `Perform a plagiarism check on the following academic text. Identify any highly similar phrases or structures that suggest direct copying from common sources or general knowledge. Provide a summary of potential plagiarism, including any suspicious sections or a percentage of similarity if possible. If no plagiarism is found, state that clearly.

      Text to check:
      "${thesisText.substring(0, 10000)}..." // Limit text to 10,000 characters for prompt safety
      `;

            // Get Gemini API Key from config
            const geminiApiKey = config.get('geminiApiKey');
            if (!geminiApiKey) {
                console.error('Gemini API Key is not defined in config/default.json');
                return res.status(500).json({ msg: 'Server configuration error: Gemini API Key missing.' });
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            };

            const geminiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const geminiResult = await geminiResponse.json();

            let plagiarismResultText = 'Plagiarism check could not be completed.';
            if (geminiResult.candidates && geminiResult.candidates.length > 0 &&
                geminiResult.candidates[0].content && geminiResult.candidates[0].content.parts &&
                geminiResult.candidates[0].content.parts.length > 0) {
                plagiarismResultText = geminiResult.candidates[0].content.parts[0].text;
            } else {
                console.warn('Gemini API response structure unexpected:', geminiResult);
                plagiarismResultText = `Gemini API did not return a valid result. Response: ${JSON.stringify(geminiResult)}`;
            }

            // Update the thesis document with the plagiarism result
            thesis.plagiarismResult = plagiarismResultText;
            await thesis.save();

            res.json({
                msg: 'Plagiarism check initiated successfully. Results saved to thesis.',
                plagiarismResult: plagiarismResultText,
                thesisId: thesis._id
            });

        } catch (err) {
            console.error('Error during plagiarism check:', err.message);
            res.status(500).send('Server Error during plagiarism check.');
        }
    }
);

// @route   POST api/theses/check-grammar/:id (existing)
// @desc    Trigger grammar correction for a thesis using a simulated AI
// @access  Private (Owner or Admin/Supervisor)
router.post(
    '/check-grammar/:id',
    auth,
    async (req, res) => {
        try {
            const thesis = await Thesis.findById(req.params.id);

            if (!thesis) {
                return res.status(404).json({ msg: 'Thesis not found' });
            }

            // Authorization: Only the owner or an admin/supervisor can trigger the check
            if (thesis.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
                return res.status(401).json({ msg: 'User not authorized to perform this action.' });
            }

            // Construct the absolute path to the PDF file
            const pdfFilePath = path.join(__dirname, '..', '..', thesis.filePath);

            // Check if the file exists
            if (!fs.existsSync(pdfFilePath)) {
                return res.status(404).json({ msg: 'Thesis PDF file not found on server.' });
            }

            // Read PDF file as buffer
            const dataBuffer = fs.readFileSync(pdfFilePath);

            // Parse PDF to extract text
            const data = await pdf(dataBuffer);
            const thesisText = data.text;

            if (!thesisText || thesisText.trim().length < 50) {
                return res.status(400).json({ msg: 'Could not extract sufficient text from PDF for grammar check.' });
            }

            // --- SIMULATED Grammar Correction Logic ---
            let grammarResultText;
            const originalTextSnippet = thesisText.substring(0, Math.min(thesisText.length, 200)).trim();

            if (originalTextSnippet.toLowerCase().includes('i has')) {
                grammarResultText = `Original: "${originalTextSnippet}"\nCorrected: "${originalTextSnippet.replace(/i has/gi, 'I have')}"\n\nSuggestion: Corrected "i has" to "I have".`;
            } else if (originalTextSnippet.toLowerCase().includes('they was')) {
                grammarResultText = `Original: "${originalTextSnippet}"\nCorrected: "${originalTextSnippet.replace(/they was/gi, 'they were')}"\n\nSuggestion: Corrected "they was" to "they were".`;
            } else if (originalTextSnippet.toLowerCase().includes('alot')) {
                grammarResultText = `Original: "${originalTextSnippet}"\nCorrected: "${originalTextSnippet.replace(/alot/gi, 'a lot')}"\n\nSuggestion: Corrected "alot" to "a lot".`;
            } else {
                grammarResultText = `Original Text Snippet:\n"${originalTextSnippet}"\n\nNo significant grammar errors detected in this snippet.`;
            }

            // Simulate a delay for the "AI" processing
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Update the thesis document with the grammar result
            thesis.grammarResult = grammarResultText;
            await thesis.save();

            res.json({
                msg: 'Simulated grammar check completed successfully. Results saved to thesis.',
                grammarResult: grammarResultText,
                thesisId: thesis._id
            });

        } catch (err) {
            console.error('Error during simulated grammar check:', err.message);
            res.status(500).send('Server Error during simulated grammar check.');
        }
    }
);


// @route   PUT api/theses/:id (existing)
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

// @route   PUT api/theses/approve/:id (existing)
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


// @route   PUT api/theses/reject/:id (existing)
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


// @route   DELETE api/theses/:id (existing)
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
// ADDED: Missing closing curly brace for the router.delete callback function
module.exports = router;
