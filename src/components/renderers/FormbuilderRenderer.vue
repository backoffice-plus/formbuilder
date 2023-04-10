<template>

  <FormBuilder
      :schema="schema"
      :jsonFormsRenderers="jsonFormsRenderers"
      :tools="tools"
      :schemaOnly="true"
      :schemaTool="baseSchemaTool"
      @schemaUpdated="onSchemaUpdated"
  />
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
import {useVanillaControl, vanillaRenderers} from "@jsonforms/vue-vanilla";
import FormBuilder from "../FormBuilder.vue";
import {getFormbuilder} from "../../lib/vue";

const formbuilderRenderer = defineComponent({
  components: {
    FormBuilder
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useVanillaControl(useJsonFormsAllOfControl(props))

    const fb = getFormbuilder();

    return {
      ...control,
      tools: fb?.props.tools ?? [],
      jsonFormsRenderers: fb?.props.jsonFormsRenderers ?? [],
      schema: (control.control as any).value.data,
      baseSchemaTool: control.appliedOptions?.value?.baseTool
    };
  },
  methods: {
    onSchemaUpdated(e:any) {
      if(e?.schema && !e?.init) {
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
