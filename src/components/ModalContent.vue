<template>

    <section class="p-4 ">

      <h2>Optionen</h2>

      <!--
      :TODO how to change class from jsonForms?
      -->
<!--      options: {{ options }}-->
      <div class="styleA">
        <JsonForms
            :schema="jsonFormSchema?.schema"
            :uischema="jsonFormSchema?.uischema"
            :data="options"
            :renderers="mergedJsonFormsRenderers"
            :ajv="ajv"
            :i18n="{translate: createI18nTranslate(formBuilderCatalogue)}"
            @change="onChange"
            v-if="jsonFormSchema?.schema"
        />
      </div>

      <div v-if="error" class="errorMsg">{{error}}</div>
      <div v-if="errorAfterUpdated" class="flex flex-col gap-1">
        <div v-for="e in errorAfterUpdated" class="errorMsg px-1">{{ e.instancePath }}: {{e.message}}</div>
      </div>

<!--      Data: {{ dataAfterUpdated }}-->

<!--      <div class="mt-4 flex justify-center">-->
<!--        <button class="button blue">Submit</button>-->
<!--      </div>-->

    </section>

</template>



<style scoped>
.errorMsg {
  color: var(--error);
}
</style>



<script setup>

import {JsonForms} from "@jsonforms/vue";
import {createI18nTranslate} from "../lib/formbuilder";
import {emitter} from "../lib/mitt";
import {onMounted, ref} from "vue";
import {createAjv} from "@jsonforms/core";
import {formBuilderCatalogue} from "../translations/de";
import {getFormbuilder} from "../lib/vue";

const props = defineProps({
  tool: Object,//ToolInterface,
  data: Object,
  jsonFormsRenderers: Array,
})
const emit = defineEmits(['change']);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

const options = ref({});
const jsonFormSchema = ref({});
const dataAfterUpdated = ref({});
const errorAfterUpdated = ref([]);
const mergedJsonFormsRenderers = ref(Object.freeze(props.jsonFormsRenderers));
const error = ref('');

const fb = getFormbuilder();

onMounted(async () => {

  const context = {
    builder: fb?.exposed?.showBuilder,
    schemaReadOnly: fb.props.schemaReadOnly,
    rootSchema: fb?.exposed?.rootSchema?.value,
  }

  options.value = props.tool.optionDataPrepare(context);
  jsonFormSchema.value = await props.tool.optionJsonforms(context)
      .then(e => {
        const event = {
          tool:props.tool,
          schema: JSON.parse(JSON.stringify(e.schema)),
          uischema: JSON.parse(JSON.stringify(e.uischema)),
        };
        emitter.emit('afterOptionJsonforms', event)

        return {schema:event.schema, uischema:event.uischema};
    })
    .catch(e => error.value=e)



  /**
   * :TODO this can probably removed (all renderer should be registered at the init of jsonforms)
   */
    if(props.tool.optionJsonformsRenderer) {
      const renderer = props.tool.optionJsonformsRenderer();
      if(renderer?.length) {
        mergedJsonFormsRenderers.value = Object.freeze([
            ...mergedJsonFormsRenderers.value,
            ...renderer,
        ])
      }
    }

})

const onChange = (e) => {
  errorAfterUpdated.value = [];
  dataAfterUpdated.value = {};

  if(e.errors.length) {
    console.warn("ModalOption", "errors at onChange", e.errors, e.data);
    errorAfterUpdated.value = e.errors;
  }
  else {
    //const data = {...e.data};//:TODO deep copy
    const data = JSON.parse(JSON.stringify(e.data)); //:TODO other way to remove ref/proxy?
    dataAfterUpdated.value = data;

    const context = {
      builder: fb?.exposed?.showBuilder,
      schemaReadOnly: fb.props.schemaReadOnly,
    }
    props.tool.optionDataUpdate(context, data)

    emit('change', data);

    //:DEV global emit do not work with sub-formeditors
    //emitter.emit('formBuilderUpdated');
  }
}

</script>
