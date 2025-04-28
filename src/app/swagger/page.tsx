// pages/index.tsx (or the appropriate page)
import { getAPIDOCS } from "../../../lib/swagger";  // Importing Swagger Spec generator
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

// React component to render Swagger UI
type Props = {
    spec: Record<string, any>;
};

const ReactSwagger = ({ spec }: Props) => {
    return <SwaggerUI spec={spec} />;
};

// Main Page Component
export default async function Page() {
    const spec = await getAPIDOCS();  // Fetching the Swagger spec
    return (
        <section className="container">
            <ReactSwagger spec={spec} /> {/* Rendering the Swagger UI with the spec */}
        </section>
    );
}
