import { validationMetadatasToSchemas } from 'class-validator-jsonschema'
import { glob } from 'glob';
import swaggerJsDoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';
import { getMetadataStorage } from 'class-validator';
import { } from 'class-transformer';
import { baseUrl } from '@constants/env.constants.js';

const schemas = validationMetadatasToSchemas(
    {
        classValidatorMetadataStorage: getMetadataStorage(),
    }
);

const backendBaseUrl = baseUrl + '/api';

const swaggerOptions: SwaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Society Management API',
            version: '1.0.0',
            description: 'API Documentation',
            contact: {
                name: 'Nakul Jhunjhunwala',
                url: 'https://digicard.netlify.app/owner',
                email: 'jhunjhunwalanakul@gmail.com',
            },
        },
        servers: [
            {
                url: backendBaseUrl, // Your server URL
            },
        ],
        components: {
            schemas,
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            parameters: {
                DeviceTokenHeader: {
                    name: 'x-device-id',
                    in: 'header',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                },
                OptionalDeviceTokenHeader: {
                    name: 'x-device-id',
                    in: 'header',
                    required: false,
                    schema: {
                        type: 'string',
                    },
                },
                SocietyIdHeader: {
                    name: 'x-society-id',
                    in: 'header',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                },
                RefreshTokenHeader: {
                    name: 'x-refresh-token',
                    in: 'header',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                }
            },
            pagination: {
                page: {
                    name: 'page',
                    in: 'query',
                    required: false,
                    default: 1,
                    schema: {
                        type: 'number',
                    }
                },
                limit: {
                    name: 'limit',
                    in: 'query',
                    required: false,
                    default: 10,
                    schema: {
                        type: 'number',
                    }
                }
            }
        },
    },
    apis: glob.sync('src/**/**/*.route.ts'), // Match all route files ending with .route.ts
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const swaggerUiOptions = {
    explorer: true, // Enables the "Explore" feature to test endpoints
    swaggerOptions: {
        docExpansion: 'none', // Collapse all paths by default
        filter: true, // Enables filtering of endpoints
        showExtensions: true, // Show vendor extensions in the UI
        showCommonExtensions: true, // Show common extensions in the UI
        layout: 'BaseLayout', // Change layout (BaseLayout, Native, etc.)
        tagsSorter: 'alpha', // Sort tags alphabetically
    },
}