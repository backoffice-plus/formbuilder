<template>

  <FormBuilder
      :schema="schema"
      :uischema="uischema"
      :jsonFormsRenderers="jsonFormsRenderers"
      :tools="tools"
      :schemaOnly="schemaOnly"
      :schemaReadOnly="schemaReadOnly"
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
import {defineComponent, inject} from "vue";
import type {ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {rankWith, uiTypeIs} from "@jsonforms/core";
import type {RendererProps} from '@jsonforms/vue';
import {rendererProps, useJsonFormsAllOfControl,} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import FormBuilder from "../FormBuilder.vue";
import {getFormbuilder} from "../../lib/vue";
import type {formbuilderPropsI, ToolInterface} from "../../lib/models";
import {useJsonFormsControl} from "@jsonforms/vue";

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
    const control = useVanillaControl(useJsonFormsControl(props))

   const jsonforms = inject('jsonforms') as any
   const data = jsonforms?.core?.data;

    let renderers, tools;
    const fb = getFormbuilder() as any;
    if(fb) {
      const fbProps = fb?.props as formbuilderPropsI;
      tools = fbProps.tools as ToolInterface[]
      renderers = fbProps.jsonFormsRenderers;
    }
    else {
      tools = inject('formbuilder-tools');
      renderers = jsonforms.renderers;
    }

    let schema, uischema;
    let schemaOnly, schemaReadOnly;


    //ui only mode
    if(control.appliedOptions.value.schemaReadOnly) {
        const baseSchemaTool = fb?.exposed?.baseSchemaTool?.value as ToolInterface;
        const toolPropertyName = data?.propertyName;


        const currentTool = baseSchemaTool?.childs?.find(tool => tool.propertyName === toolPropertyName); //ArrayTool
        const items = currentTool?.schema?.items;
        if(items && 'type' in items && 'object' === items?.type) {
            schema = currentTool?.schema?.items;
        }
        // if(currentTool) {
        //     const firstChild = currentTool.childs[0]; //ObjectTool
        //     if('object' === firstChild?.schema?.type) {
        //         schema = firstChild.schema;
        //     }
        // }

        uischema = (control.control as any).value.data
        schemaOnly = false;
        schemaReadOnly = true;

        if(!uischema) {
          uischema = { type:'VerticalLayout'};
        }
    }

    //schema only mode
    else if(control.appliedOptions.value.schemaOnly) {
        schema = (control.control as any).value.data
        schemaOnly = true;
        schemaReadOnly = false;
    }

    //schema & layout mode
    else {
      schema = (control.control as any).value.data?.schema;
      uischema = (control.control as any).value.data?.uischema;
    }


    return {
      ...control,
      tools: tools ?? [],
      jsonFormsRenderers: renderers ?? [],

      schema, uischema,
      schemaOnly, schemaReadOnly
    };
  },
  methods: {
    onSchemaUpdated(e:any) {
      let value;

      if(!e?.init) {
        if(this.schemaOnly) {
            value = e?.schema;
        }
        else if(this.schemaReadOnly) {
            value = e?.uischema;
        }
        else if(e?.schema && e?.uischema) {
           value = {
             schema: e.schema,
             uischema: e.uischema,
           };
        }
      }

      if(value) {
        this.onChange({target:{value:value}} as any);
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
