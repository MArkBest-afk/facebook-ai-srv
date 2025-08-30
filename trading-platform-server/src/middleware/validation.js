const { z } = require('zod');

// Schema for validating the select robot request body
const selectRobotSchema = z.object({
  robotId: z.string({
    required_error: 'robotId is required',
    invalid_type_error: 'robotId must be a string',
  }),
});

// Schema for validating the toggle trading status request body
const toggleTradingSchema = z.object({
  isRunning: z.boolean({
    required_error: 'isRunning is required',
    invalid_type_error: 'isRunning must be a boolean',
  }),
});

// Schema for validating the chat message request body
const chatSchema = z.object({
  text: z.string({
    required_error: 'text is required',
    invalid_type_error: 'text must be a string',
  }),
});

// Schema for validating the update user request body from admin panel
const updateUserSchema = z.object({
 name: z.string().optional(),
 balance: z.number().optional(),
 isBlocked: z.boolean().optional(),
 isSubscribed: z.boolean().optional(),
 timeLimit: z.number().optional(),
 comment: z.string().optional(),
});

/**
 * Middleware factory to validate request bodies against a Zod schema.
 * @param {ZodSchema} schema - The Zod schema to validate against.
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Validation error',
      details: error.errors,
    });
  }
};

module.exports = {
    selectRobotSchema,
    toggleTradingSchema,
    chatSchema,
    updateUserSchema,
    validate
}