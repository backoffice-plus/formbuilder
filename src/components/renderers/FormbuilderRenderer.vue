<template>

  <FormBuilder
      :schema="schema"
      :jsonFormsRenderers="jsonFormsRenderers"
      :tools="tools"
      :schemaOnly="true"
      :schemaTool="appliedOptions?.baseTool"
      :schemaToolProps="appliedOptions?.baseToolProps"
      @schemaUpdated="onSchemaUpdated"
  >
      <template #toolbar v-if="!!appliedOptions?.hideToolbar"></template>
      <template #droparea v-if="!!appliedOptions?.hideDroparea"></template>
  </FormBuilder>
<!--  :schemaReadOnly="schemaReadOnly"-->

</template>


<style>


</style>

<script lang="ts">
import {defineComponent} from "vue";
import type {ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {rankWith, uiTypeIs} from "@jsonforms/core";
import type {RendererProps} from '@jsonforms/vue';
import {rendererProps, useJsonFormsAllOfControl,} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import FormBuilder from "../FormBuilder.vue";
import {getFormbuilder} from "../../lib/vue";
import type {formbuilderPropsI, ToolInterface} from "../../lib/models";

/** @ts-ignore */
const formbuilderRenderer = defineComponent({
  name: 'formbuilder-renderer',
  components: {
    FormBuilder
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVanillaControl(useJsonFormsAllOfControl(props))

    const fb = getFormbuilder() as FormBuilder;
    const fbProps = fb?.props as formbuilderPropsI;

    return {
      ...control,
      tools: (fbProps.tools ?? []) as ToolInterface[],
      jsonFormsRenderers: fbProps.jsonFormsRenderers ?? [],
      schema: (control.control as any).value.data,
    };
  },
  methods: {
    onSchemaUpdated(e:any) {
      if("schema" in e && !e?.init) {
        this.onChange({target:{value:e.schema}} as any);
      }
    }
  }
});

export default formbuilderRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: formbuilderRenderer,
  tester: rankWith(1, uiTypeIs('Formbuilder')),
};

</script>
