/**
 * Swagger Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Đi chợ tiện lợi API',
            version: '1.0.0',
            description: 'API documentation cho ứng dụng quản lý mua sắm và tủ lạnh gia đình',
            contact: {
                name: 'API Support',
                email: 'support@dtcl.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        username: { type: 'string' },
                        avatar: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        gender: { type: 'string', enum: ['male', 'female', 'other'] },
                        group: { type: 'string' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Unit: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Food: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        category: { $ref: '#/components/schemas/Category' },
                        unit: { $ref: '#/components/schemas/Unit' },
                        image: { type: 'string' },
                        group: { type: 'string' },
                    },
                },
                FridgeItem: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        food: { $ref: '#/components/schemas/Food' },
                        quantity: { type: 'number' },
                        useWithin: { type: 'number' },
                        expiryDate: { type: 'string', format: 'date-time' },
                        note: { type: 'string' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'User', description: 'User profile endpoints' },
            { name: 'Group', description: 'Group management endpoints' },
            { name: 'Admin', description: 'Admin endpoints (Category, Unit, Logs)' },
            { name: 'Food', description: 'Food management endpoints' },
            { name: 'Fridge', description: 'Fridge item endpoints' },
            { name: 'Shopping', description: 'Shopping list and task endpoints' },
            { name: 'MealPlan', description: 'Meal planning endpoints' },
            { name: 'Recipe', description: 'Recipe endpoints' },
        ],
    },
    apis: ['./src/docs/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
