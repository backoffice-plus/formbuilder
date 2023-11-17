import {createEntryByModule} from "../../lib/formbuilder";

import * as DisclosureRenderer from "./DisclosureRendererSetup.vue";
import * as FormbuilderRenderer from "./FormbuilderRendererSetup.vue";

export const formbuilderRenderers = [
    createEntryByModule(DisclosureRenderer),
    createEntryByModule(FormbuilderRenderer),
];
