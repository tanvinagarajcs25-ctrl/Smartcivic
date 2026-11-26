const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../database');
const generateTicketId = require('../ticketGenerator');

// Create uploads folder if it does not exist
const uploadFolder = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configure image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = Date.now() + '-' + Math.round(Math.random() * 1000000) + extension;
        cb(null, filename);
    }
});

// Allow image files only
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
        }
    }
});

// Submit a new complaint with optional image
router.post('/', (req, res) => {

    upload.single('image')(req, res, (uploadError) => {

        if (uploadError) {
            return res.status(400).json({
                success: false,
                message: uploadError.message
            });
        }

        try {
            const { category, description, location, latitude, longitude } = req.body;

            // Validate required fields
            if (!category || !description || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Category, description and location are required.'
                });
            }

            // Generate ticket ID
            const ticketId = generateTicketId();

            // Get uploaded image path
            const imageUrl = req.file
                ? '/uploads/' + req.file.filename
                : null;

            // Save complaint in database
            const insertComplaint = db.prepare(`
                INSERT INTO complaints
                (ticket_id, category, description, location, latitude, longitude, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            insertComplaint.run(
                ticketId,
                category,
                description,
                location,
                latitude || null,
                longitude || null,
                imageUrl
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
                    status: 'Submitted'
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

        res.status(200).json({
            success: true,
            message: 'Complaints retrieved successfully!',
            count: complaints.length,
            data: complaints
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve complaints.'
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

        res.status(200).json({
            success: true,
            message: 'Complaint retrieved successfully!',
            data: complaint
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve complaint.'
        });
    }
});


// Update complaint status
router.patch('/:ticketId/status', (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const { status } = req.body;

        const allowedStatuses = [
            'Submitted',
            'Assigned',
            'In Progress',
            'Resolved'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use Submitted, Assigned, In Progress or Resolved.'
            });
        }

        const result = db.prepare(`
            UPDATE complaints
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE ticket_id = ?
        `).run(status, ticketId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully!',
            data: {
                ticketId,
                status
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status.'
        });
    }
});

module.exports = router;