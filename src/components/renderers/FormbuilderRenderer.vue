<template>

  <FormBuilder
      :jsonForms="jsonForms"
      :jsonFormsRenderers="jsonFormsRenderers"
      :tools="tools"
      :builders="['schema']"
      initBuilder="schema"
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
import {boplusVueVanillaRenderers} from "../../../packages/boplus-vue-vanilla/src";
import {formbuilderRenderers} from "./index";
import {controlTools} from "../../lib/tools";
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

    const jsonForms = {
      schema: control.control.value.data,
      uischema: {},
    };

    return {
      ...control,
      tools: fb?.props.tools ?? [],
      jsonFormsRenderers: fb?.props.jsonFormsRenderers ?? [],
      jsonForms
    };
  },
  methods: {
    onSchemaUpdated(e) {
      this.onChange({target:{value:e.schema}});
    }
  }
});

export default formbuilderRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: formbuilderRenderer,
  tester: rankWith(1, uiTypeIs('Formbuilder')),
};

</script>
