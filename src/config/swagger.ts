import SwaggerParser from 'swagger-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to main swagger.yaml file
const swaggerYamlPath = path.join(__dirname, '../../docs/swagger.yaml');

// Parse and resolve all $ref references
let swaggerSpec: any = null;

async function loadSwaggerSpec() {
  try {
    swaggerSpec = await SwaggerParser.dereference(swaggerYamlPath);
    console.log('✅ Swagger spec loaded and dereferenced successfully');
  } catch (error) {
    console.error('❌ Error loading Swagger spec:', error);
    // Fallback to basic spec
    swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Restaurant Booking API',
        version: '1.0.0',
        description: 'API documentation loading failed. Check server logs.'
      },
      paths: {}
    };
  }
}

// Load spec on module initialization
await loadSwaggerSpec();

export { swaggerSpec };
