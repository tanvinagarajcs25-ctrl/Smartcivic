const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const { classifyImage } = require('../aiClassifier');

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
        }
    }
});

// Generate ticket ID
function generateTicketId() {
    return 'SC-' + Date.now();
}

// AI image classification endpoint
router.post('/classify', (req, res) => {

    upload.single('image')(req, res, async (uploadError) => {

        if (uploadError) {
            return res.status(400).json({
                success: false,
                message: uploadError.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image.'
                });
            }

            const aiResult = await classifyImage(req.file.path);
            console.log('AI result received:', aiResult);

            res.json({
                success: true,
                suggestedCategory: aiResult.suggestedCategory,
                predictions: aiResult.predictions
            });

        } catch (error) {
            console.error('Classification error:', error);

            res.status(500).json({
                success: false,
                message: 'Image analysis failed.'
            });
        }
    });
});

// Submit a new complaint
router.post('/', (req, res) => {

    upload.single('image')(req, res, async (uploadError) => {

        if (uploadError) {
            return res.status(400).json({
                success: false,
                message: uploadError.message
            });
        }

        try {
            const {
                category,
                description,
                location,
                latitude,
                longitude
            } = req.body;

            if (!category || !description || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Category, description and location are required.'
                });
            }

            const ticketId = generateTicketId();

            const imageUrl = req.file
                ? '/uploads/' + req.file.filename
                : null;

            let aiSuggestedCategory = 'Not detected';

            if (req.file) {
                const aiResult = await classifyImage(req.file.path);
                aiSuggestedCategory = aiResult.suggestedCategory;
            }

            const insertComplaint = db.prepare(`
                INSERT INTO complaints
                (ticket_id, category, description, location, latitude, longitude, image_url, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            insertComplaint.run(
                ticketId,
                category,
                description,
                location,
                latitude || null,
                longitude || null,
                imageUrl,
                'Medium'
            );

            res.status(201).json({
                success: true,
                message: 'Complaint submitted successfully!',
                data: {
                    ticketId,
                    category,
                    description,
                    location,
                    imageUrl,
                    status: 'Submitted',
                    aiSuggestedCategory
                }
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: 'Something went wrong while submitting the complaint.'
            });
        }
    });
});

// Get all complaints
router.get('/', (req, res) => {

    try {
        const complaints = db.prepare(`
            SELECT * FROM complaints
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            data: complaints
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch complaints.'
        });
    }
});

// Get complaint by ticket ID
router.get('/:ticketId', (req, res) => {

    try {
        const ticketId = req.params.ticketId;

        const complaint = db.prepare(`
            SELECT * FROM complaints
            WHERE ticket_id = ?
        `).get(ticketId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.'
            });
        }

        res.json({
            success: true,
            data: complaint
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch complaint.'
        });
    }
});

// Update complaint status
router.patch('/:ticketId/status', (req, res) => {

    try {
        const { status } = req.body;
        const ticketId = req.params.ticketId;

        const allowedStatuses = [
            'Pending',
            'In Progress',
            'Resolved'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status.'
            });
        }

        const updateStatus = db.prepare(`
            UPDATE complaints
            SET status = ?
            WHERE ticket_id = ?
        `);

        const result = updateStatus.run(status, ticketId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.'
            });
        }

        res.json({
            success: true,
            message: 'Complaint status updated successfully.'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to update status.'
        });
    }
});

// Update complaint priority
router.patch('/:ticketId/priority', (req, res) => {

    try {
        const { priority } = req.body;
        const ticketId = req.params.ticketId;

        const allowedPriorities = [
            'High',
            'Medium',
            'Low'
        ];

        if (!allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority.'
            });
        }

        const updatePriority = db.prepare(`
            UPDATE complaints
            SET priority = ?
            WHERE ticket_id = ?
        `);

        const result = updatePriority.run(priority, ticketId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.'
            });
        }

        res.json({
            success: true,
            message: 'Complaint priority updated successfully.'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to update priority.'
        });
    }
});

module.exports = router;