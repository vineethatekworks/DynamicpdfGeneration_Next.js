import { getAPIDOCS } from "../../../lib/swagger";
import {ReactSwagger} from "./react-swagger";
export default async function Page() {
    const spec = await getAPIDOCS();
    return <section className="container"><ReactSwagger spec={spec} /></section>;
}