import {createEntry, createEntryByModule} from "../../lib/formbuilder";

import * as DisclosureRenderer from "./DisclosureRendererSetup.vue";
import * as FormbuilderRenderer from "./FormbuilderRendererSetup.vue";
import * as ButtonRenderer from "./ButtonRenderer.vue";
import * as TextRenderer from "./TextRenderer.vue";

//DEV
import * as ObjectRenderer from "./DEV/ObjectRendererWithAdditionalProperties.vue";
import * as GroupRendererSloted from "./DEV/GroupRendererSloted.vue";

export const formbuilderRenderers = [
    createEntryByModule(DisclosureRenderer),
    createEntryByModule(FormbuilderRenderer),
    createEntryByModule(ButtonRenderer),
    createEntryByModule(TextRenderer),

    //DEV
    ObjectRenderer.entry,
    GroupRendererSloted.entry,
];
