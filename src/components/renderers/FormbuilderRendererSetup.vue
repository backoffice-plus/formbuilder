<template>

  <FormBuilder
      :schema="schema"
      :uischema="uischema"
      :jsonFormsRenderers="renderers ?? []"
      :tools="tools ?? []"
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

<script setup lang="ts">
import {inject} from "vue";
import {resolveData, toDataPath} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry, JsonSchema, UISchemaElement} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";
import FormBuilder from "../FormBuilder.vue";
import {getFormbuilder} from "../../lib/vue";
import type {formbuilderPropsI, ToolInterface} from "../../lib/models";


const props = defineProps(rendererProps<ControlElement>())

    const control = useVanillaControl(useJsonFormsControl(props))
    const {appliedOptions, onChange} = control;

   const jsonforms = inject('jsonforms') as any
   const data = jsonforms?.core?.data;

    let renderers:JsonFormsRendererRegistryEntry[] = [];
    let tools:ToolInterface[]|undefined = [];

    const fb = getFormbuilder() as any;
    if(fb) {
      const fbProps = fb?.props as formbuilderPropsI;
      tools = fbProps.tools as ToolInterface[]
      renderers = fbProps.jsonFormsRenderers;
    }
    else {
      tools = inject('formbuilder-tools') as ToolInterface[]|undefined;
      renderers = jsonforms.renderers;
    }

    let schema:JsonSchema|undefined, uischema:UISchemaElement;
    let schemaOnly:boolean, schemaReadOnly:boolean;


    //ui only mode
    if(control.appliedOptions.value.schemaReadOnly) {

        if(control.appliedOptions.value.schemaScope) {
          const schemaScope = control.appliedOptions.value.schemaScope;
          const path = toDataPath(schemaScope);
          schema = resolveData(data, path);
        }

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


    const onSchemaUpdated = (e:any) => {
      let value:any;

      if(!e?.init) {
        if(schemaOnly) {
          value = e?.schema;
        }
        else if(schemaReadOnly) {
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
        onChange({target:{value:value}} as any);
      }
    }
</script>

<script lang="ts">
import type {RankedTester} from "@jsonforms/core";
import {rankWith, uiTypeIs} from "@jsonforms/core";
export const tester: RankedTester = rankWith(1, uiTypeIs('Formbuilder'));
</script>
