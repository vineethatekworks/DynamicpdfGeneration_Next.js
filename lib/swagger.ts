//create swagger spec
import { createSwaggerSpec } from 'next-swagger-doc';

//get api docs
export const getAPIDOCS = async () => {
    const spec = await createSwaggerSpec({
        apiFolder: 'src/app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Nomination Form API',
                version: '1.0.0',
                description: 'Documentation for Nomination Form API',
            },
            components: ['src/app/api/**/*.ts'],
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [],
    });

    return spec;
};

