import express from 'express';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   PUT /api/customers/profile
 * @desc    Update customer info (including location)
 * @access  Private (Customer only)
 */
router.put('/profile', verifyToken, async (req, res) => {
	console.log(req);
	try {
		const customer = await User.findById(req.user.userId);
		if (!customer) {
			return res
				.status(404)
				.json({ error: 'Customer not found' });
		}

		// ✅ Update fields if provided
		if (req.body.name) customer.name = req.body.name;
		if (req.body.email) customer.email = req.body.email;
		if (req.body.phone) customer.phone = req.body.phone;
		if (req.body.address)
			customer.address = req.body.address;

		// ✅ Update location if provided
		if (req.body.latitude && req.body.longitude) {
			customer.customerProfile.location = {
				latitude: req.body.latitude,
				longitude: req.body.longitude,
				address:
					req.body.address ||
					customer.customerProfile.location?.address,
			};
		}

		await customer.save();
		res.json({
			success: true,
			message: 'Profile updated successfully',
			customer,
		});
	} catch (error) {
		console.error(
			'Error updating customer profile:',
			error,
		);
		res.status(500).json({ error: 'Server error' });
	}
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get a single customer by ID
 * @access  Private (Customer only)
 */
router.get('/:id', async (req, res) => {
	try {
		const customer = await Customer.findById(
			req.params.id,
		).select('-password');
		if (!customer) {
			return res
				.status(404)
				.json({ error: 'Customer not found' });
		}
		res.json(customer);
	} catch (error) {
		console.error('Error fetching customer:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 * @access  Private (Admin only)
 */
router.get('/', async (req, res) => {
	try {
		const customers = await Customer.find().select(
			'-password',
		);
		res.json(customers);
	} catch (error) {
		console.error('Error fetching customers:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;
